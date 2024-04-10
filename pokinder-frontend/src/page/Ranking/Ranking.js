import { createRef, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useInfiniteQuery } from "react-query";

import { useAfterEffect } from "../../hook/useAfterEffect";
import useSearchParams from "../../hook/useSearchParams";

import { getRanking } from "../../api/pokinder";

import { calculateCardsAmount } from "../../utils/math";

import Loader from "../../component/atom/Loader/Loader";
import FilterPanel from "../../component/organism/FilterPanel/FilterPanel";
import Page from "../../component/organism/Page/Page";

import { queryClient } from "../..";
import LoadingRankingCard from "./LoadingRankingCard";
import styles from "./Ranking.module.css";
import RankingCard from "./RankingCard";

const AMOUNT_CARDS_TO_GET_RATIOS = [
  { maxWidth: 620, cardHeight: 84 + 8, cardsPerRow: 1 },
  { maxWidth: 1250, cardHeight: 104 + 8, cardsPerRow: 2 },
  { maxWidth: Infinity, cardHeight: 104 + 8, cardsPerRow: 3 },
];

function Ranking() {
  const { t } = useTranslation();

  const scrollRef = createRef();

  const [amountCardsToGet, setAmountCardsToGet] = useState(
    calculateCardsAmount(AMOUNT_CARDS_TO_GET_RATIOS),
  );

  const defaultFilters = {
    headNameOrCategory: "All",
    bodyNameOrCategory: "All",
    creatorName: "All",
  };

  const [paramsNotifier, newFilters, setFilters] = useSearchParams(defaultFilters);
  const filters = { ...defaultFilters, ...newFilters };

  const {
    data,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["ranking"],
    queryFn: ({ pageParam }) => {
      const offset = pageParam || 0;
      return getRanking(filters, amountCardsToGet, offset);
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.records.length < amountCardsToGet) return false;
      return lastPage.previousOffset + amountCardsToGet;
    },
    staleTime: 60 * 60 * 1000,
    cacheTime: 0,
  });

  const isFetchingFirstPage = isFetching && !isFetchingNextPage

  // When the number of item to fetch is greater then acutal fetched data, refetch the data.
  useEffect(() => {
    const handleResize = () => {
      const newAmountCardsToGet = calculateCardsAmount(AMOUNT_CARDS_TO_GET_RATIOS);
      if (newAmountCardsToGet - amountCardsToGet > 1) {
        setAmountCardsToGet(newAmountCardsToGet);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [amountCardsToGet]);

  useAfterEffect(() => {
    scrollRef.current.scrollTop = 0;
    queryClient.setQueryData(["ranking"], (data) => {
      if (data === undefined) return;

      return {
        pages: data.pages.slice(0, 1),
        pageParams: data.pageParams.slice(0, 1),
      };
    });
    refetch({ pageParam: 0 });
  }, [paramsNotifier, amountCardsToGet, refetch]);

  const drawRankings = () => {
    const pages = data?.pages.map((page) => page.records) || [];
    const rankings = pages.flat();

    return rankings.map((ranking) => <RankingCard ranking={ranking} key={ranking.fusion.id} />);
  };

  function onScrollFinish() {
    if (isFetchingNextPage || isLoading || !hasNextPage) {
      return;
    }

    fetchNextPage();
  }

  function renderContent() {
    if (isError) {
      return <p>{t("The API is down for the moment, sorry for the inconvenience.")}</p>;
    }

    if (isLoading || isFetchingFirstPage) {
      return (
        <div className={`${styles.wrapper} loading`}>
          <FilterPanel
            defaultFilters={defaultFilters}
            currentFilters={filters}
            setFilters={setFilters}
          />
          <div className={styles.container}>
            {Array.from({ length: amountCardsToGet }, (_, index) => (
              <LoadingRankingCard key={index} />
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className={styles.wrapper}>
        <FilterPanel
          defaultFilters={defaultFilters}
          currentFilters={filters}
          setFilters={setFilters}
        />
        <div className={styles.container}>{drawRankings()}</div>
        <Loader loading={isFetchingNextPage} />
      </div>
    );
  }

  return (
    <Page
      name={t("Community ranking")}
      description="Discover the Most Beloved Pokémon Infinite Fusion Sprites Voted by the Community."
      overflow={"scroll"}
      onScrollFinish={onScrollFinish}
      scrollRef={scrollRef}
    >
      {renderContent()}
    </Page>
  );
}

export default Ranking;
