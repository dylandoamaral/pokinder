import { useTranslation } from "react-i18next";

import useQueryParameters from "../../hook/useQueryParameters";

import Page from "../../component/organism/Page/Page";

import styles from "./Explore.module.css";
import ExploreMenu from "./ExploreMenu";
import ExploreHistoryCards from "./History/ExploreHistoryCards";
import ExplorePokedexCards from "./Pokedex/ExplorePokedexCards";
import ExploreRankingCards from "./Ranking/ExploreRankingCards";
import ExploreReferenceCards from "./Reference/ExploreReferenceCards";

export const MODE_POKEDEX = "pokedex";
export const MODE_HISTORY = "history";
export const MODE_REFERENCE = "reference";
export const MODE_RANKING = "ranking";

export default function Explore() {
  const { t } = useTranslation();

  const [parameters, setParameters] = useQueryParameters();
  const currentMode = parameters.mode || MODE_RANKING;

  function setCurrentMode(mode) {
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

    switch (currentMode) {
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
    switch (currentMode) {
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

  return (
    <Page name={t("Explore")} overflow={"scroll"}>
      <div className={styles.container}>
        <ExploreMenu
          currentMode={currentMode}
          setCurrentMode={setCurrentMode}
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
