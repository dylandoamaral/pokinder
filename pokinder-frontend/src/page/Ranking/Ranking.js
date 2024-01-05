import { useState } from "react";
import { createRef } from "react";
import { useTranslation } from "react-i18next";
import { useInfiniteQuery } from "react-query";

import { useAfterEffect } from "../../hook/useAfterEffect";

import { getRanking } from "../../api/pokinder";

import Loader from "../../component/atom/Loader/Loader";
import FilterPanel from "../../component/organism/FilterPanel/FilterPanel";
import Page from "../../component/organism/Page/Page";

import { queryClient } from "../..";
import LoadingRankingCard from "./LoadingRankingCard";
import styles from "./Ranking.module.css";
import RankingCard from "./RankingCard";

function Ranking() {
  const { t } = useTranslation();

  const scrollRef = createRef();

  const POKEMON_PER_PAGES = 20;

  const initFilters = {
    headNameOrCategory: "All",
    bodyNameOrCategory: "All",
  };

  const [filters, setFilters] = useState(initFilters);

  const { data, refetch, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    useInfiniteQuery({
      queryKey: ["ranking"],
      queryFn: ({ pageParam }) => {
        const offset = pageParam || 0;
        return getRanking(filters, POKEMON_PER_PAGES, offset);
      },
      getNextPageParam: (lastPage) => {
        if (lastPage.records.length < POKEMON_PER_PAGES) return false;
        return lastPage.previousOffset + POKEMON_PER_PAGES;
      },
    });

  useAfterEffect(() => {
    scrollRef.current.scrollTop = 0;
    queryClient.setQueryData(["ranking"], (data) => ({
      pages: data.pages.slice(0, 1),
      pageParams: data.pageParams.slice(0, 1),
    }));
    refetch({ pageParam: 0 });
  }, [filters, refetch]);

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

    if (isLoading) {
      return (
        <div className={`${styles.wrapper} ${styles.loading}`}>
          <FilterPanel initFilters={initFilters} currentFilters={filters} setFilters={setFilters} />
          <div className={styles.container}>
            {Array.from({ length: 20 }, (_, index) => (
              <LoadingRankingCard key={index} />
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className={styles.wrapper}>
        <FilterPanel initFilters={initFilters} currentFilters={filters} setFilters={setFilters} />
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
