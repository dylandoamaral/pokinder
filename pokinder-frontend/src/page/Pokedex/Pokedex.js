import { createRef } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useInfiniteQuery } from "react-query";
import { Link } from "react-router-dom";

import { useAfterEffect } from "../../hook/useAfterEffect";
import { useAuthentication } from "../../hook/useAuthentication";
import useSearchParams from "../../hook/useSearchParams";

import { getHistory } from "../../api/pokinder";

import Loader from "../../component/atom/Loader/Loader";
import Oak from "../../component/atom/Oak/Oak";
import FilterPanel from "../../component/organism/FilterPanel/FilterPanel";
import Page from "../../component/organism/Page/Page";

import { queryClient } from "../..";
import LoadingPokedexCard from "./LoadingPokedexCard";
import styles from "./Pokedex.module.css";
import PokedexCard from "./PokedexCard";

function Pokedex() {
  const { t } = useTranslation();
  const { token } = useAuthentication();

  const scrollRef = createRef();

  const POKEMON_PER_PAGES = 36;

  const defaultFilters = {
    headNameOrCategory: "All",
    bodyNameOrCategory: "All",
    downvoteEnabled: true,
    favoriteEnabled: true,
    upvoteEnabled: true,
  };

  const [paramsNotifier, newFilters, setFilters] = useSearchParams(defaultFilters);
  const filters = { ...defaultFilters, ...newFilters };

  const { data, refetch, hasNextPage, fetchNextPage, isError, isLoading, isFetchingNextPage } =
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
      staleTime: 10 * 60 * 1000,
      cacheTime: 0,
    });

  useAfterEffect(() => {
    scrollRef.current.scrollTop = 0;
    queryClient.setQueryData(["history"], (data) => ({
      pages: data.pages.slice(0, 1),
      pageParams: data.pageParams.slice(0, 1),
    }));
    refetch({ pageParam: 0 });
  }, [token, paramsNotifier, refetch]);

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
    if (isError) {
      return <p>{t("The API is down for the moment, sorry for the inconvenience.")}</p>;
    }

    if (isLoading) {
      return (
        <div className={`${styles.wrapper} ${styles.loading}`}>
          <FilterPanel
            defaultFilters={defaultFilters}
            currentFilters={filters}
            setFilters={setFilters}
          />
          <div className={styles.container}>
            {Array.from({ length: 30 }, (_, index) => (
              <LoadingPokedexCard key={index} />
            ))}
          </div>
        </div>
      );
    }

    const pages = data?.pages.map((page) => page.records) || [];
    const votes = pages.flat();

    // Usefull when user filter everything to avoid showing Oak.
    if (votes.length > 0) {
      localStorage.setItem("pokinderHasVoted", "yes");
    }

    if (votes.length === 0 && localStorage.getItem("pokinderHasVoted") === null) {
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
        <FilterPanel
          defaultFilters={defaultFilters}
          currentFilters={filters}
          setFilters={setFilters}
        />
        <div className={styles.container}>{drawCards(votes)}</div>
        <Loader loading={isFetchingNextPage} />
      </div>
    );
  }

  return (
    <Page
      name={t("Vote history")}
      overflow={"scroll"}
      onScrollFinish={onScrollFinish}
      scrollRef={scrollRef}
    >
      {renderContent()}
    </Page>
  );
}

export default Pokedex;
