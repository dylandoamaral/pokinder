import { useEffect, useRef, useState } from "react";
import { useQuery } from "react-query";
import AutoSizer from "react-virtualized-auto-sizer";
import { VariableSizeList } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import { v4 as uuidv4 } from "uuid";

import { useAfterEffect } from "../../../hook/useAfterEffect";

import { getExploreReference, getExploreReferenceCount } from "../../../api/pokinder";

import { getName } from "../../../utils/pokemon";

import Heading from "../../../component/atom/Heading/Heading";
import Loader from "../../../component/atom/Loader/Loader";

import { CARD_GAP, CARD_HEIGHT, CARD_WIDTH, calculateCardsPerRow } from "../ExploreCard";
import ExploreCardLoading from "../ExploreCardLoading";
import ExploreReferenceCard from "./ExploreReferenceCard";
import styles from "./ExploreReferenceCards.module.css";

function List({ width, height, items, state, counts, filters }) {
  const infiniteLoaderRef = useRef(null);
  const queries = useRef({});

  const itemCount = counts.length;
  const cardsPerRow = calculateCardsPerRow(width);

  const requestsPerSecond = 4;

  const refreshId = state.id + cardsPerRow;

  useEffect(() => {
    if (!infiniteLoaderRef.current) return;

    infiniteLoaderRef.current.resetloadMoreItemsCache();
  }, [refreshId]);

  async function loadItems(filters, limit, offset) {
    return await getExploreReference(filters, limit, offset);
  }

  function getStartIndex(counts, rowIndex) {
    if (rowIndex === 0) return 0;

    let startIndex = 0;

    for (let i = rowIndex - 1; i >= 0; i--) {
      startIndex += counts[i]["count"];
    }

    return startIndex;
  }

  function renderAllCard(index, data) {
    if (data === "UNAVAILABLE") return null;
    if (data === undefined) return <ExploreCardLoading key={index} />;
    if (data === "WAITING") return <ExploreCardLoading key={index} />;

    const fusionId = data.fusion_id;
    const fusionPath = data.fusion_path;
    const fusionName = getName(
      data.fusion_head_name,
      data.fusion_head_name_separator_index,
      data.fusion_body_name,
      data.fusion_body_name_separator_index,
    );
    const fusionReferenceName = data.reference_name;
    const fusionReferenceLink = data.reference_link;
    const fusionReferenceProposer = data.reference_proposer_name;

    return (
      <ExploreReferenceCard
        key={index}
        fusionId={fusionId}
        fusionPath={fusionPath}
        fusionName={fusionName}
        fusionReferenceName={fusionReferenceName}
        fusionReferenceLink={fusionReferenceLink}
        fusionReferenceProposer={fusionReferenceProposer}
      />
    );
  }

  function renderRow(rowIndex, style, cardsPerRow) {
    const itemCount = counts[rowIndex];
    const itemsAmount = itemCount["count"];
    const startIndex = getStartIndex(counts, rowIndex);

    const cardIndexes = Array.from({ length: itemsAmount }, (_, i) => i + startIndex);
    // NOTE: used for the last row to align cards.
    const phantomIndexes = Array.from(
      { length: cardsPerRow - (itemsAmount % cardsPerRow) },
      (_, i) => i + startIndex + itemsAmount,
    );

    return (
      <div className={styles.row} style={style}>
        <Heading align="left">{itemCount["reference_family_name"]}</Heading>
        <div className={styles.cards}>
          {cardIndexes.map((index) => renderAllCard(index, items[index]))}
          {phantomIndexes.map((index) => (
            <div key={index} style={{ width: `${CARD_WIDTH}px` }} />
          ))}
        </div>
      </div>
    );
  }

  function getItemSize(index) {
    const itemsAmount = counts[index]["count"];
    const rowAmount = Math.ceil(itemsAmount / cardsPerRow);
    const titleSize = 80;

    return CARD_HEIGHT * rowAmount + CARD_GAP * (rowAmount - 1) + titleSize;
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

    const offset = startIndex;
    const limit = stopIndex - startIndex + 1;

    const firstCardFetched = getStartIndex(counts, startIndex);
    const lastCardFetched = getStartIndex(counts, stopIndex) + counts[stopIndex]["count"];
    const amountCardFetched = lastCardFetched - firstCardFetched;

    for (let index = 0; index < amountCardFetched; index++) {
      items[index + firstCardFetched] = "WAITING";
    }

    const delayQuery = new Promise((resolve) => {
      return setTimeout(resolve, queryData["startDate"] - now);
    });

    const runQuery = () =>
      new Promise((resolve) => {
        loadItems(filters, limit, offset).then((data) => {
          for (let index = 0; index < amountCardFetched; index++) {
            if (data[index]) items[index + firstCardFetched] = data[index];
            else items[index + firstCardFetched] = "UNAVAILABLE";
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
    const startIndex = getStartIndex(counts, index);

    return !!items[startIndex];
  }

  return (
    <InfiniteLoader
      key={refreshId}
      ref={infiniteLoaderRef}
      isItemLoaded={isItemLoaded}
      itemCount={itemCount}
      loadMoreItems={loadMoreItems}
      minimumBatchSize={5}
      threshold={5}
    >
      {({ onItemsRendered, ref }) => (
        <VariableSizeList
          height={height}
          className={styles.loader}
          itemCount={itemCount}
          itemSize={getItemSize}
          onItemsRendered={onItemsRendered}
          ref={ref}
          width={width}
        >
          {({ index, style }) => renderRow(index, style, cardsPerRow)}
        </VariableSizeList>
      )}
    </InfiniteLoader>
  );
}

export default function ExploreReferenceCards({ filters }) {
  let items = {};

  async function loadItemsCount() {
    return await getExploreReferenceCount(filters);
  }

  const [state, setState] = useState({ id: uuidv4() });
  const { data: counts, isRefetching } = useQuery(
    ["card", state.id],
    async () => loadItemsCount(filters),
    { staleTime: Infinity, cacheTime: 0 },
  );

  useAfterEffect(() => {
    setState({ id: uuidv4() });
  }, [filters, isRefetching]);

  if (counts === undefined) {
    return (
      <div className={styles.loading}>
        <Loader loading={true} />
      </div>
    );
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
            counts={counts}
            filters={filters}
          />
        )}
      </AutoSizer>
    </div>
  );
}
