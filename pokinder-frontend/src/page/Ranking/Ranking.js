import { useState } from "react";
import { useInfiniteQuery } from "react-query";

import { useAfterEffect } from "../../hook/useAfterEffect";

import { getRanking } from "../../api/pokinder";

import FilterPanel from "../../component/organism/FilterPanel/FilterPanel";
import Page from "../../component/organism/Page/Page";

import { queryClient } from "../..";
import styles from "./Ranking.module.css";
import RankingCard from "./RankingCard";

function Ranking() {
  const POKEMON_PER_PAGES = 20;

  const initFilters = {
    headNameOrCategory: "All",
    bodyNameOrCategory: "All",
  };

  const [filters, setFilters] = useState(initFilters);

  const { data, refetch, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
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
    queryClient.setQueryData(["ranking"], (data) => ({
      pages: data.pages.slice(0, 1),
      pageParams: data.pageParams.slice(0, 1),
    }));
    refetch();
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

  return (
    <Page
      name="Community ranking"
      description="Discover the Most Beloved Pokémon Infinite Fusion Sprites Voted by the Community."
      overflow="scroll"
      onScrollFinish={onScrollFinish}
    >
      <div className={styles.wrapper}>
        <FilterPanel initFilters={initFilters} currentFilters={filters} setFilters={setFilters} />
        <div className={styles.container}>{drawRankings()}</div>
      </div>
    </Page>
  );
}

export default Ranking;
