import styles from "./Ranking.module.css";
import { useState } from "react";
import { getRanking } from "../../api/pokinder";
import Page from "../../component/organism/Page/Page";
import { useInfiniteQuery } from "react-query";
import Button from "../../component/atom/Button/Button";
import RankingCard from "./RankingCard";
import { useAfterEffect } from "../../hook/useAfterEffect";
import { queryClient } from "../..";
import RankingFilter from "./RankingFilter";
import { groupeOptions } from "../../data/options";

function Ranking() {
  const POKEMON_PER_PAGES = 20;

  const initFilters = {
    headNameOrCategory: "All",
    bodyNameOrCategory: "All",
  };

  const [filters, setFilters] = useState(initFilters);

  const { data, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
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

    return rankings.map((ranking) => (
      <RankingCard ranking={ranking} key={ranking.fusion.id} />
    ));
  };

  return (
    <Page
      name="Community ranking"
      description="Discover the Most Beloved Pokémon Infinite Fusion Sprites Voted by the Community."
    >
      <div className={styles.wrapper}>
        <RankingFilter
          pokemonOptions={groupeOptions}
          filters={filters}
          onChange={setFilters}
        />
        <div className={styles.container}>{drawRankings()}</div>
        <div className={styles.button}>
          <Button
            onClick={() => fetchNextPage()}
            disabled={!hasNextPage || isFetchingNextPage}
            title={
              isFetchingNextPage
                ? "Loading more..."
                : hasNextPage
                ? "Load More"
                : "Nothing more to load"
            }
          />
        </div>
      </div>
    </Page>
  );
}

export default Ranking;
