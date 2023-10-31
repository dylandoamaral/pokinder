import { useState } from "react";
import { getHistory } from "../../api/pokinder";
import { useInfiniteQuery } from "react-query";
import useAccountId from "../../hook/useAccountId";
import { useAfterEffect } from "../../hook/useAfterEffect";

import Page from "../../component/organism/Page/Page";
import styles from "./Pokedex.module.css";
import PokedexFilter from "./PokedexFilter";
import PokedexVote from "./PokedexVote";
import { allPokemonNames } from "../../utils/pokemon";
import Button from "../../component/atom/Button/Button";
import { queryClient } from "../..";

function Pokedex() {
  const POKEMON_PER_PAGES = 50;

  const specialOptions = [
    { value: "All", label: "All" },
    { value: "Legendary", label: "Legendaries" },
    { value: "Mythical", label: "Mythicals" },
    { value: "Starter", label: "Starters" },
  ];
  const pokemonOptions = allPokemonNames().map((name) => ({
    value: name,
    label: name,
  }));

  const groupedOptions = [
    {
      label: "Specials",
      options: specialOptions,
    },
    {
      label: "Pokemons",
      options: pokemonOptions,
    },
  ];

  const initFilters = {
    headNameOrCategory: "All",
    bodyNameOrCategory: "All",
    downvoteEnabled: true,
    favoriteEnabled: true,
    upvoteEnabled: true,
  };

  const [filters, setFilters] = useState(initFilters);

  const accountId = useAccountId();

  const { data, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["history"],
      queryFn: ({ pageParam }) => {
        const offset = pageParam || 0;
        return getHistory(accountId, filters, POKEMON_PER_PAGES, offset);
      },
      getNextPageParam: (lastPage) => {
        if (lastPage.records.length < POKEMON_PER_PAGES) return false;
        return lastPage.previousOffset + POKEMON_PER_PAGES;
      },
    });

  useAfterEffect(() => {
    queryClient.setQueryData(["history"], (data) => ({
      pages: data.pages.slice(0, 1),
      pageParams: data.pageParams.slice(0, 1),
    }));
    refetch();
  }, [filters, refetch]);

  const drawVotes = () => {
    const pages = data?.pages.map((page) => page.records) || [];
    const votes = pages.flat();

    return votes.map((vote) => (
      <PokedexVote vote={vote} key={vote.fusion.id} />
    ));
  };

  return (
    <Page>
      <div className={styles.wrapper}>
        <PokedexFilter
          pokemonOptions={groupedOptions}
          filters={filters}
          onChange={setFilters}
        />
        <div className={styles.container}>{drawVotes()}</div>
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

export default Pokedex;
