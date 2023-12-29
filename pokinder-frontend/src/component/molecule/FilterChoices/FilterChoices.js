import styles from "./FilterChoices.module.css";

import FilterChoice from "../../atom/FilterChoice/FilterChoice";

import { AnimatePresence } from "framer-motion";

function FilterChoices({ initFilters, currentFilters, setFilters }) {
  function generateFilterChoiceData() {
    const filterChoiceData = {};

    for (const key in currentFilters) {
      if (
        initFilters.hasOwnProperty(key) &&
        initFilters[key] !== currentFilters[key]
      ) {
        filterChoiceData[key] = currentFilters[key];
      }
    }

    return filterChoiceData;
  }

  const filterChoiceData = generateFilterChoiceData();

  const translator = {
    headNameOrCategory: {
      key: "Pokemon head",
    },
    bodyNameOrCategory: {
      key: "Pokemon body",
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

  function renderFilterChoice(key) {
    const category = translator[key].key || key;
    const value = translator[key].value || filterChoiceData[key];

    return (
      <FilterChoice
        key={category + value}
        category={category}
        operator={translator[key].operator || "="}
        value={value}
        onClick={() => {
          setFilters({ ...currentFilters, [key]: initFilters[key] });
        }}
      />
    );
  }

  return (
    <div className={styles.container}>
      <AnimatePresence>
        {Object.keys(filterChoiceData).map((key) => renderFilterChoice(key))}
      </AnimatePresence>
    </div>
  );
}

export default FilterChoices;
