import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FaPlus, FaTimes } from "react-icons/fa";

import useToggle from "../../hook/useToggle";

import { MODE_HISTORY, MODE_POKEDEX, MODE_RANKING, MODE_REFERENCE } from "./Explore";
import styles from "./ExploreMenu.module.css";
import ExploreMenuFiltersModal from "./ExploreMenuFiltersModal";

export default function ExploreMenu({
  defaultFilters,
  filters,
  parameters,
  setParameters,
  mode,
  setMode,
}) {
  const { t } = useTranslation();
  const [showModal, toggleModal] = useToggle();

  function setFilters(newFilters) {
    let newParameters = { ...parameters };

    for (const key in newFilters) {
      const defaultValue = defaultFilters[key];
      const newValue = newFilters[key];

      if (newValue === undefined || newValue === defaultValue) {
        delete newParameters[key];
      } else {
        newParameters[key] = newValue;
      }
    }

    setParameters(newParameters);
  }

  function generateFiltersData() {
    const filterChoiceData = {};

    for (const key in filters) {
      if (defaultFilters.hasOwnProperty(key) && defaultFilters[key] !== filters[key]) {
        filterChoiceData[key] = filters[key];
      }
    }

    return filterChoiceData;
  }

  const translator = {
    headNameOrCategory: {
      key: "Pokemon head",
    },
    bodyNameOrCategory: {
      key: "Pokemon body",
    },
    referenceFamilyName: {
      key: "Reference family",
    },
    referenceName: {
      key: "Reference",
    },
    creatorName: {
      key: "Creator",
    },
    downvoteEnabled: {
      key: "Vote type",
      value: "Downvote",
      operator: "!=",
    },
    favoriteEnabled: {
      key: "Vote type",
      value: "Favorite",
      operator: "!=",
    },
    upvoteEnabled: {
      key: "Vote type",
      value: "Upvote",
      operator: "!=",
    },
  };

  const filtersData = generateFiltersData();

  function renderFilter(key) {
    const category = translator[key].key || key;
    const value = translator[key].value || filtersData[key];
    const operator = translator[key].operator || "=";

    return (
      <motion.button
        key={category + value}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, y: 4 }}
        transition={{ duration: 0.15 }}
        className={styles.filter}
        onClick={() => {
          if (key === "referenceFamilyName") {
            setFilters({
              ...parameters,
              referenceFamilyName: defaultFilters["referenceFamilyName"],
              referenceName: defaultFilters["referenceName"],
            });
          } else {
            setFilters({ ...parameters, [key]: defaultFilters[key] });
          }
        }}
      >
        {t(category)} {operator} {t(value)}
        <FaTimes />
      </motion.button>
    );
  }

  return (
    <>
      <div className={styles.container}>
        <div className={styles.filters}>
          {Object.keys(filtersData).map((key) => renderFilter(key))}
          <button className={styles.filterButton} onClick={toggleModal}>
            <FaPlus />
            {t("Add filter")}
          </button>
        </div>
        <div className={styles.modes}>
          <button
            className={styles.mode}
            data-checked={mode === MODE_POKEDEX}
            onClick={() => setMode(MODE_POKEDEX)}
          >
            {t("Pokedex")}
          </button>
          <button
            className={styles.mode}
            data-checked={mode === MODE_HISTORY}
            onClick={() => setMode(MODE_HISTORY)}
          >
            {t("History")}
          </button>
          <button
            className={styles.mode}
            data-checked={mode === MODE_REFERENCE}
            onClick={() => setMode(MODE_REFERENCE)}
          >
            {t("Reference")}
          </button>
          <button
            className={styles.mode}
            data-checked={mode === MODE_RANKING}
            onClick={() => setMode(MODE_RANKING)}
          >
            {t("Ranking")}
          </button>
        </div>
      </div>
      <ExploreMenuFiltersModal
        defaultFilters={defaultFilters}
        filters={filters}
        setFilters={setFilters}
        isVisible={showModal}
        onClose={toggleModal}
      />
    </>
  );
}
