import { now } from "moment";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import useQueryParameters from "../../hook/useQueryParameters";

import Page from "../../component/organism/Page/Page";

import styles from "./Explore.module.css";
import ExploreCardLoading from "./ExploreCardLoading";
import ExploreCardLocked from "./ExploreCardLocked";
import ExploreMenu from "./ExploreMenu";
import ExploreHistoryCard from "./History/ExploreHistoryCard";
import ExploreHistoryCards from "./History/ExploreHistoryCards";
import ExplorePokedexCard from "./Pokedex/ExplorePokedexCard";
import ExplorePokedexCards from "./Pokedex/ExplorePokedexCards";
import ExploreRankingCard from "./Ranking/ExploreRankingCard";
import ExploreRankingCards from "./Ranking/ExploreRankingCards";
import ExploreReferenceCard from "./Reference/ExploreReferenceCard";
import ExploreReferenceCards from "./Reference/ExploreReferenceCards";

// TODO: add mode as query param
// TODO: reduce menu size

export const MODE_POKEDEX = "pokedex";
export const MODE_HISTORY = "history";
export const MODE_REFERENCE = "reference";
export const MODE_RANKING = "ranking";

export default function Explore() {
  const { t } = useTranslation();

  const [parameters, setParameters] = useQueryParameters();
  const mode = parameters.mode || MODE_POKEDEX;

  function setMode(mode) {
    setParameters({ ...parameters, mode: mode });
  }

  function getDefaultFilters() {
    const sharedDefaultFilters = {
      headNameOrCategory: "All",
      bodyNameOrCategory: "All",
      referenceFamilyName: "All",
      referenceName: "All",
      creatorName: "All",
    };

    switch (mode) {
      case MODE_HISTORY:
        const specificDefaultFilters = {
          downvoteEnabled: true,
          favoriteEnabled: true,
          upvoteEnabled: true,
        };

        return { ...sharedDefaultFilters, ...specificDefaultFilters };
      default:
        return sharedDefaultFilters;
    }
  }

  function getFilters(defaultFilters) {
    let filters = {};

    for (const key in defaultFilters) {
      if (parameters[key] !== undefined && parameters[key] !== defaultFilters[key]) {
        filters[key] = parameters[key];
      } else {
        filters[key] = defaultFilters[key];
      }
    }

    return filters;
  }

  const defaultFilters = getDefaultFilters();
  const filters = getFilters(defaultFilters);

  function renderCards() {
    switch (mode) {
      case MODE_POKEDEX:
        return <ExplorePokedexCards filters={filters} />;
      case MODE_HISTORY:
        return <ExploreHistoryCards filters={filters} />;
      case MODE_REFERENCE:
        return <ExploreReferenceCards filters={filters} />;
      case MODE_RANKING:
        return <ExploreRankingCards filters={filters} />;
      default:
        return <ExplorePokedexCards filters={filters} />;
    }
  }

  function renderLoadingCard() {
    return <ExploreCardLoading />;
  }

  function renderLockedCard() {
    const fusionId = "dde76924-4eb2-4864-abd7-a05476e230f0";

    return <ExploreCardLocked fusionId={fusionId} isLocked={true} />;
  }

  function renderPokedexCard() {
    const fusionId = "dde76924-4eb2-4864-abd7-a05476e230f0";
    const fusionPath = "296.243";
    const fusionName = "Zynogre";
    const fusionType1 = "flying";
    const fusionType2 = "normal";
    const fusionWeight = 10.2;
    const fusionHeight = 100;

    return (
      <ExplorePokedexCard
        fusionId={fusionId}
        fusionPath={fusionPath}
        fusionName={fusionName}
        fusionType1={fusionType1}
        fusionType2={fusionType2}
        fusionWeight={fusionWeight}
        fusionHeight={fusionHeight}
      />
    );
  }

  function renderHistoryCard() {
    const fusionId = "dde76924-4eb2-4864-abd7-a05476e230f0";
    const fusionPath = "296.243";
    const fusionName = "Zynogre";
    const fusionVoteType = 1;
    const fusionVoteAt = now();

    return (
      <ExploreHistoryCard
        fusionId={fusionId}
        fusionPath={fusionPath}
        fusionName={fusionName}
        fusionVoteType={fusionVoteType}
        fusionVoteAt={fusionVoteAt}
      />
    );
  }

  function renderReferenceCard() {
    const fusionId = "dde76924-4eb2-4864-abd7-a05476e230f0";
    const fusionPath = "296.243";
    const fusionName = "Zynogre";
    const fusionReferenceName = "Divine Beast Vah Naboris";
    const fusionReferenceLink = "https://zelda.fandom.com/wiki/Divine_Beast_Vah_Naboris";
    const fusionReferenceProposer = "Portuar";

    return (
      <ExploreReferenceCard
        fusionId={fusionId}
        fusionPath={fusionPath}
        fusionName={fusionName}
        fusionReferenceName={fusionReferenceName}
        fusionReferenceLink={fusionReferenceLink}
        fusionReferenceProposer={fusionReferenceProposer}
      />
    );
  }

  function renderRankingCard() {
    const fusionId = "dde76924-4eb2-4864-abd7-a05476e230f0";
    const fusionPath = "296.243";
    const fusionName = "Zynogre";
    const fusionRank = 1;
    const fusionScore = 100;
    const fusionVoteCount = 10;

    return (
      <ExploreRankingCard
        fusionId={fusionId}
        fusionPath={fusionPath}
        fusionName={fusionName}
        fusionRank={fusionRank}
        fusionScore={fusionScore}
        fusionVoteCount={fusionVoteCount}
      />
    );
  }

  function renderTestCards() {
    return (
      <div className={styles.container}>
        {renderLoadingCard()}
        {renderLockedCard()}
        {renderPokedexCard()}
        {renderHistoryCard()}
        {renderReferenceCard()}
        {renderRankingCard()}
      </div>
    );
  }

  return (
    <Page name={t("Explore")} overflow={"scroll"}>
      <div className={styles.container}>
        <ExploreMenu
          mode={mode}
          setMode={setMode}
          defaultFilters={defaultFilters}
          filters={filters}
          parameters={parameters}
          setParameters={setParameters}
        />
        {renderCards()}
      </div>
    </Page>
  );
}
