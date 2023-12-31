import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useInfiniteQuery } from "react-query";
import { Link } from "react-router-dom";

import { useAfterEffect } from "../../hook/useAfterEffect";
import { useAuthentication } from "../../hook/useAuthentication";

import { getHistory } from "../../api/pokinder";

import Oak from "../../component/atom/Oak/Oak";
import FilterPanel from "../../component/organism/FilterPanel/FilterPanel";
import Page from "../../component/organism/Page/Page";

import { queryClient } from "../..";
import styles from "./Pokedex.module.css";
import PokedexCard from "./PokedexCard";

function Pokedex() {
  const { t } = useTranslation();
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

  const { data, refetch, hasNextPage, fetchNextPage, isLoading, isFetchingNextPage } =
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

  const drawCards = (votes) => {
    return votes.map((vote) => <PokedexCard vote={vote} key={vote.fusion.id} />);
  };

  function onScrollFinish() {
    if (isFetchingNextPage || isLoading || !hasNextPage) {
      return;
    }

    fetchNextPage();
  }

  function renderContent() {
    const pages = data?.pages.map((page) => page.records) || [];
    const votes = pages.flat();

    if (votes.length === 0) {
      return (
        <Oak>
          <p>
            <Trans t={t} i18nKey="History empty one">
              Ah, my dear young Trainer, it appears you've delved into the Pokédex history page
              without yet casting your votes.
            </Trans>
          </p>
          <p>
            <Trans t={t} i18nKey="History empty two">
              Can you assist me in my ongoing research by{" "}
              <Link className={styles.link} to="/">
                voting for your favorite sprites
              </Link>
              ? There, you'll actively aid in completing your Pokédex. Your contributions would be
              invaluable to our collective knowledge!
            </Trans>
          </p>
        </Oak>
      );
    }

    return (
      <div className={styles.wrapper}>
        <FilterPanel initFilters={initFilters} currentFilters={filters} setFilters={setFilters} />
        <div className={styles.container}>{drawCards(votes)}</div>
      </div>
    );
  }

  return (
    <Page name="Vote history" overflow="scroll" onScrollFinish={onScrollFinish}>
      {renderContent()}
    </Page>
  );
}

export default Pokedex;
