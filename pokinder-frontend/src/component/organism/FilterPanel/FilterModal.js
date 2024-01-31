import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { listCreators } from "../../../api/pokinder";

import { findOptionByValue, groupeOptions } from "../../../data/options";

import Button from "../../atom/Button/Button";
import CheckField from "../../atom/CheckField/CheckField";
import Filter from "../../atom/Filter/Filter";
import Modal from "../../atom/Modal/Modal";
import FutureSelect from "../../atom/Select/FutureSelect";
import Select from "../../atom/Select/Select";
import styles from "./FilterModal.module.css";

function FilterModal({ defaultFilters, currentFilters, setFilters, isVisible, onClose }) {
  const { t } = useTranslation();
  const [updatedFilters, setUpdatedFilters] = useState(currentFilters);

  const updateFilters = (newFilters) => {
    setUpdatedFilters({ ...updatedFilters, ...newFilters });
  };

  useEffect(() => setUpdatedFilters(currentFilters), [currentFilters]);

  const setPokemonHeads = (pokemonHeads) =>
    updateFilters({ headNameOrCategory: pokemonHeads.value });
  const setPokemonBodies = (pokemonBodies) =>
    updateFilters({ bodyNameOrCategory: pokemonBodies.value });
  const setCreator = (creator) => updateFilters({ creatorName: creator.value });
  const toggleDownvoteEnabled = () => {
    updateFilters({ downvoteEnabled: !updatedFilters.downvoteEnabled });
  };
  const toggleFavoriteEnabled = () =>
    updateFilters({ favoriteEnabled: !updatedFilters.favoriteEnabled });
  const toggleUpvoteEnabled = () => updateFilters({ upvoteEnabled: !updatedFilters.upvoteEnabled });

  function renderPokemonParts() {
    if (!updatedFilters.hasOwnProperty("headNameOrCategory")) {
      return null;
    }

    return (
      <div className={styles.pokemons}>
        <Filter title={t("Pokemon head")}>
          <Select
            options={groupeOptions}
            onChange={setPokemonHeads}
            defaultValue={findOptionByValue(updatedFilters.headNameOrCategory)}
          />
        </Filter>
        <Filter title={t("Pokemon body")}>
          <Select
            options={groupeOptions}
            onChange={setPokemonBodies}
            defaultValue={findOptionByValue(updatedFilters.bodyNameOrCategory)}
          />
        </Filter>
      </div>
    );
  }

  function renderCreator() {
    if (!updatedFilters.hasOwnProperty("creatorName")) {
      return null;
    }

    function valueToOption(value) {
      return { value: value.name, label: value.name };
    }

    const defaultValue = {
      value: updatedFilters.creatorName,
      label: updatedFilters.creatorName,
    };

    return (
      <div className={styles.pokemons}>
        <Filter title={t("Creator")}>
          <FutureSelect
            futureValues={listCreators}
            valueToOption={valueToOption}
            onChange={setCreator}
            defaultValue={defaultValue}
          />
        </Filter>
      </div>
    );
  }

  function renderVoteTypes() {
    if (!updatedFilters.hasOwnProperty("downvoteEnabled")) {
      return null;
    }

    return (
      <Filter title={t("Vote types")}>
        <div className={styles.votes}>
          <CheckField
            title={t("Downvote")}
            onChange={toggleDownvoteEnabled}
            isChecked={updatedFilters.downvoteEnabled}
          />
          <CheckField
            title={t("Favorite")}
            onChange={toggleFavoriteEnabled}
            isChecked={updatedFilters.favoriteEnabled}
          />
          <CheckField
            title={t("Upvote")}
            onChange={toggleUpvoteEnabled}
            isChecked={updatedFilters.upvoteEnabled}
          />
        </div>
      </Filter>
    );
  }

  return (
    <Modal isVisible={isVisible} onClose={onClose} className={styles.container}>
      {renderPokemonParts()}
      {renderCreator()}
      {renderVoteTypes()}
      <div className={styles.buttons}>
        <Button
          title={t("Reset all filters")}
          variant="text"
          foreground
          nopadding
          onClick={() => {
            setFilters(defaultFilters);
            onClose();
          }}
        />
        <div className={styles.right}>
          <Button title={t("Cancel")} variant="text" foreground onClick={onClose} />
          <Button
            title={t("Apply filters")}
            foreground
            onClick={() => {
              setFilters(updatedFilters);
              onClose();
            }}
          />
        </div>
      </div>
    </Modal>
  );
}

export default FilterModal;
