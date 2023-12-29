import { useState } from "react";
import { getHistory } from "../../api/pokinder";
import { useInfiniteQuery } from "react-query";
import { useAfterEffect } from "../../hook/useAfterEffect";

import Page from "../../component/organism/Page/Page";
import styles from "./Pokedex.module.css";
import PokedexCard from "./PokedexCard";
import { queryClient } from "../..";
import { useAuthentication } from "../../hook/useAuthentication";
import FilterPanel from "../../component/organism/FilterPanel/FilterPanel";

function Pokedex() {
  const { token } = useAuthentication();

  const POKEMON_PER_PAGES = 30;

  const initFilters = {
    headNameOrCategory: "All",
    bodyNameOrCategory: "All",
    downvoteEnabled: true,
    favoriteEnabled: true,
    upvoteEnabled: true,
  };

  const [filters, setFilters] = useState(initFilters);

  const {
    data,
    refetch,
    hasNextPage,
    fetchNextPage,
    isLoading,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["history"],
    queryFn: ({ pageParam }) => {
      const offset = pageParam || 0;
      return getHistory(filters, POKEMON_PER_PAGES, offset);
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.records.length < POKEMON_PER_PAGES) return false;
      return lastPage.previousOffset + POKEMON_PER_PAGES;
    },
  });

  useAfterEffect(() => {
    queryClient.setQueryData(["history"], (data) => ({
      pages: data?.pages.slice(0, 1) || [],
      pageParams: data.pageParams.slice(0, 1),
    }));
    refetch();
  }, [token, filters, refetch]);

  const drawCards = () => {
    const pages = data?.pages.map((page) => page.records) || [];
    const votes = pages.flat();

    return votes.map((vote) => (
      <PokedexCard vote={vote} key={vote.fusion.id} />
    ));
  };

  function onScrollFinish() {
    if (isFetchingNextPage || isLoading || !hasNextPage) {
      return;
    }

    fetchNextPage();
  }

  return (
    <Page name="Vote history" overflow="scroll" onScrollFinish={onScrollFinish}>
      <div className={styles.wrapper}>
        <FilterPanel
          initFilters={initFilters}
          currentFilters={filters}
          setFilters={setFilters}
        />
        <div className={styles.container}>{drawCards()}</div>
      </div>
    </Page>
  );
}

export default Pokedex;
