import { useEffect, useRef, useState } from "react";
import { useQuery } from "react-query";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import { v4 as uuidv4 } from "uuid";

import { useAfterEffect } from "../../hook/useAfterEffect";

import { CARD_GAP, CARD_HEIGHT, CARD_WIDTH, calculateCardsPerRow } from "./ExploreCard";
import ExploreCardLoading from "./ExploreCardLoading";
import styles from "./ExploreCardsGrid.module.css";

function List({ width, height, items, state, count, filters, loadItems, renderCard }) {
  const infiniteLoaderRef = useRef(null);

  const queries = useRef({});
  const scrollInformation = useRef(null);

  const cardsPerRow = calculateCardsPerRow(width);

  const itemCount = Math.ceil(count / cardsPerRow) || Math.ceil(height / CARD_HEIGHT);
  const itemSize = CARD_HEIGHT + CARD_GAP;

  const requestsPerSecond = 4;

  useEffect(() => {
    if (!infiniteLoaderRef.current) return;

    infiniteLoaderRef.current.resetloadMoreItemsCache();
  }, [state.id]);

  // NOTE: Used to scroll to the aproximativelly same row on card row change.
  useEffect(() => {
    if (scrollInformation.current === null) {
      scrollInformation.current = { cardsPerRow: cardsPerRow, firstVisibleColumn: 0 };
      return;
    }

    const listRef = infiniteLoaderRef.current?._listRef;

    if (listRef === undefined) {
      return;
    }

    const firstVisibleColumn = Math.floor(listRef.state.scrollOffset / CARD_HEIGHT);
    const firstVisibleCard = firstVisibleColumn * cardsPerRow;

    if (scrollInformation.current.cardsPerRow === cardsPerRow) {
      scrollInformation.current = { cardsPerRow: cardsPerRow, firstVisibleCard: firstVisibleCard };
    } else {
      const oldFirstVisibleCard = scrollInformation.current.firstVisibleCard;
      const fixedFirstVisibleColumn = Math.floor(oldFirstVisibleCard / cardsPerRow) - 1;
      const fixedFirstVisibleCard = fixedFirstVisibleColumn * cardsPerRow;

      listRef.scrollToItem(fixedFirstVisibleColumn);
      scrollInformation.current = {
        cardsPerRow: cardsPerRow,
        firstVisibleCard: fixedFirstVisibleCard,
      };
    }
  }, [height, width, cardsPerRow]);

  function renderAllCard(index, data) {
    if (data === "UNAVAILABLE") return null;
    if (data === undefined) return <ExploreCardLoading key={index} />;
    if (data === "WAITING") return <ExploreCardLoading key={index} />;

    return renderCard(data);
  }

  function calculateItemsAmount(rowIndex, cardsPerRow) {
    if (count === undefined) return cardsPerRow;

    if (Math.floor(count / cardsPerRow) === rowIndex) {
      return count % cardsPerRow;
    } else {
      return cardsPerRow;
    }
  }

  function renderRow(rowIndex, style, cardsPerRow) {
    const itemsAmount = calculateItemsAmount(rowIndex, cardsPerRow);
    const startIndex = rowIndex * cardsPerRow;

    const cardIndexes = Array.from({ length: itemsAmount }, (_, i) => i + startIndex);
    // NOTE: used for the last row to align cards.
    const phantomIndexes = Array.from(
      { length: cardsPerRow - itemsAmount },
      (_, i) => i + startIndex + itemsAmount,
    );

    return (
      <div className={styles.row} style={style}>
        {cardIndexes.map((index) => renderAllCard(index, items[index]))}
        {phantomIndexes.map((index) => (
          <div key={index} style={{ width: `${CARD_WIDTH}px` }} />
        ))}
      </div>
    );
  }

  // NOTE: The goal is to delay query when we reach more than {requestsPerSecond} per secondes.
  function calculateQueryStartDate(now) {
    const allQueries = Object.values(queries.current);

    if (allQueries.length < requestsPerSecond) return now;

    const oneSecondAgo = now - 1000;
    const recentQueries = allQueries.filter((data) => data["startDate"] >= oneSecondAgo);

    if (recentQueries.length < requestsPerSecond) return now;

    const sortedQueries = recentQueries.sort(
      (a, b) => new Date(a["startDate"]) - new Date(b["startDate"]),
    );
    const farAwayQuery = sortedQueries[sortedQueries.length - requestsPerSecond];

    return farAwayQuery["startDate"] + 1000;
  }

  async function loadMoreItems(startIndex, stopIndex) {
    const now = Date.now();
    const queryId = uuidv4();
    const queryData = { startDate: calculateQueryStartDate(now), status: "IN_PROGRESS" };

    queries.current[queryId] = queryData;

    const offset = startIndex * cardsPerRow;
    const limit = (stopIndex - startIndex + 1) * cardsPerRow;

    //console.log("Load more with start index", startIndex, "stop index", stopIndex);

    for (let index = 0; index < limit; index++) {
      items[index + offset] = "WAITING";
    }

    const delayQuery = new Promise((resolve) => {
      //console.log(`Delayed the query for ${queryData["startDate"] - now} milliseconds`)
      return setTimeout(resolve, queryData["startDate"] - now);
    });

    const runQuery = () =>
      new Promise((resolve) => {
        loadItems(filters, limit, offset).then((data) => {
          //console.log("Done for start index", startIndex, "stop index", stopIndex);

          for (let index = 0; index < limit; index++) {
            if (data[index]) items[index + offset] = data[index];
            else items[index + offset] = "UNAVAILABLE";
          }

          queries.current[queryId]["status"] = { status: "DONE" };
          resolve();
        });
      });

    return delayQuery
      .then(() => runQuery())
      .catch((error) => console.error("Error in chain:", error));
  }

  function isItemLoaded(index) {
    return !!items[index * cardsPerRow];
  }

  return (
    <InfiniteLoader
      key={state.id}
      ref={infiniteLoaderRef}
      isItemLoaded={isItemLoaded}
      itemCount={itemCount}
      loadMoreItems={loadMoreItems}
      minimumBatchSize={Math.ceil(45 / cardsPerRow)}
      threshold={Math.ceil(45 / cardsPerRow)}
    >
      {({ onItemsRendered, ref }) => {
        return (
          <FixedSizeList
            height={height}
            itemCount={itemCount}
            itemSize={itemSize}
            onItemsRendered={onItemsRendered}
            ref={ref}
            width={width}
          >
            {({ index, style }) => renderRow(index, style, cardsPerRow)}
          </FixedSizeList>
        );
      }}
    </InfiniteLoader>
  );
}

export default function ExploreCardsGrid({ filters, loadItems, loadItemsCount, renderCard }) {
  let items = {};
  const [state, setState] = useState({ id: uuidv4() });

  const { data: count, isRefetching } = useQuery(
    ["card", state.id],
    async () => loadItemsCount(filters),
    { staleTime: 10 * 60 * 1000, cacheTime: 0 },
  );

  useAfterEffect(() => {
    setState({ id: uuidv4() });
  }, [filters, isRefetching]);

  if (count === undefined) {
    return null;

    //return (
    //  <div className={styles.loading}>
    //    <Loader loading={true} />
    //  </div>
    //)
  }

  return (
    <div style={{ flex: "1 1 auto" }}>
      <AutoSizer>
        {({ height, width }) => (
          <List
            width={width}
            height={height}
            items={items}
            state={state}
            count={count}
            filters={filters}
            loadItems={loadItems}
            renderCard={renderCard}
          />
        )}
      </AutoSizer>
    </div>
  );
}
