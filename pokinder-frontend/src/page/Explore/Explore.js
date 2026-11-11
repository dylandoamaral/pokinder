import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import useQueryParameters from "../../hook/useQueryParameters";

import Page from "../../component/organism/Page/Page";

import styles from "./Explore.module.css";
import ExploreMenu from "./ExploreMenu";
import ExploreHistoryCards from "./History/ExploreHistoryCards";
import ExplorePokedexCards from "./Pokedex/ExplorePokedexCards";
import ExploreRankingCards from "./Ranking/ExploreRankingCards";
import ExploreReferenceCards from "./Reference/ExploreReferenceCards";
import { MODE_HISTORY, MODE_POKEDEX, MODE_RANKING, MODE_REFERENCE } from "./modes";

export default function Explore() {
  const { t } = useTranslation();
  const location = useLocation();

  const [parameters, setParameters] = useQueryParameters();
  const currentMode = parameters.mode || MODE_RANKING;
  const canonical =
    currentMode === MODE_RANKING || currentMode === MODE_REFERENCE
      ? `https://pokinder.com${location.pathname}${location.search}`
      : undefined;

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
    <Page
      name={t("Explore")}
      description="Browse Pokémon Infinite Fusion sprites, rankings, Pokédex entries, and community favorites."
      canonical={canonical}
      noindex={false}
      overflow={"scroll"}
    >
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
