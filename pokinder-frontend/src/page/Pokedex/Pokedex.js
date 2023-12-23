import { useState } from "react";
import { getHistory } from "../../api/pokinder";
import { useInfiniteQuery } from "react-query";
import { useAfterEffect } from "../../hook/useAfterEffect";

import Page from "../../component/organism/Page/Page";
import styles from "./Pokedex.module.css";
import PokedexFilter from "./PokedexFilter";
import PokedexVote from "./PokedexVote";
import Button from "../../component/atom/Button/Button";
import { queryClient } from "../..";
import { useAuthentication } from "../../hook/useAuthentication";
import { groupeOptions } from "../../data/options";
import { useTranslation } from "react-i18next";

function Pokedex() {
  const { t } = useTranslation();

  const { token } = useAuthentication();

  const POKEMON_PER_PAGES = 50;

  const initFilters = {
    headNameOrCategory: "All",
    bodyNameOrCategory: "All",
    downvoteEnabled: true,
    favoriteEnabled: true,
    upvoteEnabled: true,
  };

  const [filters, setFilters] = useState(initFilters);

  const { data, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
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

  const drawVotes = () => {
    const pages = data?.pages.map((page) => page.records) || [];
    const votes = pages.flat();

    return votes.map((vote) => (
      <PokedexVote vote={vote} key={vote.fusion.id} />
    ));
  };

  return (
    <Page name="Vote history">
      <div className={styles.wrapper}>
        <PokedexFilter
          pokemonOptions={groupeOptions}
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
                ? t("Loading more...")
                : hasNextPage
                ? t("Load more fusions")
                : t("Nothing more to load")
            }
          />
        </div>
      </div>
    </Page>
  );
}

export default Pokedex;
