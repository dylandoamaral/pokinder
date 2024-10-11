import { AnimatePresence } from "framer-motion";

import FilterChoice from "../../atom/FilterChoice/FilterChoice";
import styles from "./FilterChoices.module.css";

function FilterChoices({ defaultFilters, currentFilters, setFilters }) {
  function generateFilterChoiceData() {
    const filterChoiceData = {};

    for (const key in currentFilters) {
      if (defaultFilters.hasOwnProperty(key) && defaultFilters[key] !== currentFilters[key]) {
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
          setFilters({ ...currentFilters, [key]: defaultFilters[key] });
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
