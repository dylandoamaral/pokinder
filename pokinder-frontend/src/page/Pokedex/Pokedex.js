import { createRef, useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useInfiniteQuery } from "react-query";
import { Link } from "react-router-dom";

import { useAfterEffect } from "../../hook/useAfterEffect";
import { useAuthentication } from "../../hook/useAuthentication";
import useSearchParams from "../../hook/useSearchParams";

import { getHistory } from "../../api/pokinder";

import { calculateCardsAmount } from "../../utils/math";

import Loader from "../../component/atom/Loader/Loader";
import Oak from "../../component/atom/Oak/Oak";
import FilterPanel from "../../component/organism/FilterPanel/FilterPanel";
import Page from "../../component/organism/Page/Page";

import { queryClient } from "../..";
import LoadingPokedexCard from "./LoadingPokedexCard";
import styles from "./Pokedex.module.css";
import PokedexCard from "./PokedexCard";

const AMOUNT_CARDS_TO_GET_RATIOS = [
  { maxWidth: 500, cardHeight: 104, cardsPerRow: 1 },
  { maxWidth: 600, cardHeight: 250, cardsPerRow: 2 },
  { maxWidth: 800, cardHeight: 250, cardsPerRow: 3 },
  { maxWidth: 1000, cardHeight: 250, cardsPerRow: 4 },
  { maxWidth: 1200, cardHeight: 250, cardsPerRow: 5 },
  { maxWidth: Infinity, cardHeight: 250, cardsPerRow: 6 },
];

function Pokedex() {
  const { t } = useTranslation();
  const { token } = useAuthentication();

  const scrollRef = createRef();

  const [amountCardsToGet, setAmountCardsToGet] = useState(
    calculateCardsAmount(AMOUNT_CARDS_TO_GET_RATIOS),
  );

  const defaultFilters = {
    headNameOrCategory: "All",
    bodyNameOrCategory: "All",
    referenceFamilyName: "All",
    referenceName: "All",
    creatorName: "All",
    downvoteEnabled: true,
    favoriteEnabled: true,
    upvoteEnabled: true,
  };

  const [paramsNotifier, newFilters, setFilters] = useSearchParams(defaultFilters);
  const filters = { ...defaultFilters, ...newFilters };

  const {
    data,
    refetch,
    hasNextPage,
    fetchNextPage,
    isError,
    isLoading,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["history"],
    queryFn: ({ pageParam }) => {
      const offset = pageParam || 0;
      return getHistory(filters, amountCardsToGet, offset);
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.records.length < amountCardsToGet) return false;
      return lastPage.previousOffset + amountCardsToGet;
    },
    staleTime: 10 * 60 * 1000,
    cacheTime: 0,
  });

  const isFetchingFirstPage = isFetching && !isFetchingNextPage;

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
    queryClient.setQueryData(["history"], (data) => ({
      pages: data.pages.slice(0, 1),
      pageParams: data.pageParams.slice(0, 1),
    }));
    refetch({ pageParam: 0 });
  }, [token, amountCardsToGet, paramsNotifier, refetch]);

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
              <LoadingPokedexCard key={index} />
            ))}
          </div>
        </div>
      );
    }

    const pages = data?.pages.map((page) => page.records) || [];
    const votes = pages.flat();

    const isOak = votes.length === 0 && localStorage.getItem("pokinderHasVoted") === null;

    // Usefull when user filter everything to avoid showing Oak.
    if (votes.length > 0) {
      localStorage.setItem("pokinderHasVoted", "yes");
    }

    if (isOak) {
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
