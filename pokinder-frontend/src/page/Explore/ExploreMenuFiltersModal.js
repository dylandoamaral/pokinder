import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { listCreators, listReferenceFamilies, listReferences } from "../../api/pokinder";

import { findOptionByValue, groupeOptions } from "../../data/options";

import Button, {
  VARIANT_FILLED_FOREGROUND,
  VARIANT_TEXT,
} from "../../component/atom/Button/Button";
import CheckField from "../../component/atom/CheckField/CheckField";
import Modal from "../../component/atom/Modal/Modal";
import Panel from "../../component/atom/Panel/Panel";
import FutureSelect from "../../component/atom/Select/FutureSelect";
import Select from "../../component/atom/Select/Select";

import styles from "./ExploreMenuFiltersModal.module.css";

function ExploreMenuFiltersModal({ defaultFilters, filters, setFilters, isVisible, onClose }) {
  const { t } = useTranslation();
  const [updatedFilters, setUpdatedFilters] = useState(filters);

  const updateFilters = (newFilters) => {
    setUpdatedFilters({ ...updatedFilters, ...newFilters });
  };

  useEffect(() => setUpdatedFilters(filters), [filters]);

  const setPokemonHeads = (pokemonHeads) =>
    updateFilters({ headNameOrCategory: pokemonHeads.value });
  const setPokemonBodies = (pokemonBodies) =>
    updateFilters({ bodyNameOrCategory: pokemonBodies.value });
  const setReference = (reference) => updateFilters({ referenceName: reference.value });
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
        <Panel title={t("Pokemon head")}>
          <Select
            options={groupeOptions}
            onChange={setPokemonHeads}
            defaultValue={findOptionByValue(updatedFilters.headNameOrCategory)}
          />
        </Panel>
        <Panel title={t("Pokemon body")}>
          <Select
            options={groupeOptions}
            onChange={setPokemonBodies}
            defaultValue={findOptionByValue(updatedFilters.bodyNameOrCategory)}
          />
        </Panel>
      </div>
    );
  }

  function renderReference() {
    if (!updatedFilters.hasOwnProperty("referenceName")) {
      return null;
    }

    function valueToOption(value) {
      return { value: value.name, label: value.name };
    }

    async function listReferencesByCurrentReferenceFamily() {
      if (updatedFilters.referenceFamilyName === undefined) return [];
      if (updatedFilters.referenceFamilyName === "All") return [];
      return await listReferences(undefined, updatedFilters.referenceFamilyName);
    }

    const referenceFamilyDefaultValue = {
      value: updatedFilters.referenceFamilyName,
      label: t(updatedFilters.referenceFamilyName),
    };

    const referenceDefaultValue = {
      value: updatedFilters.referenceName,
      label: t(updatedFilters.referenceName),
    };

    return (
      <div className={styles.pokemons}>
        <Panel title={t("Reference family")}>
          <FutureSelect
            futureValues={listReferenceFamilies}
            valueToOption={valueToOption}
            onChange={(option) => {
              updateFilters({
                referenceName: "All",
                referenceFamilyName: option.value,
              });
            }}
            defaultValue={referenceFamilyDefaultValue}
            allOption
          />
        </Panel>
        <Panel title={t("Reference")}>
          <FutureSelect
            futureValues={listReferencesByCurrentReferenceFamily}
            valueToOption={valueToOption}
            onChange={setReference}
            defaultValue={referenceDefaultValue}
            updateKey={referenceFamilyDefaultValue} // NOTE: trick to force rerendering when family change.
            allOption
          />
        </Panel>
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
      label:
        updatedFilters.creatorName === "All"
          ? t(updatedFilters.creatorName)
          : updatedFilters.creatorName,
    };

    return (
      <div className={styles.pokemons}>
        <Panel title={t("Creator")}>
          <FutureSelect
            futureValues={listCreators}
            valueToOption={valueToOption}
            onChange={setCreator}
            defaultValue={defaultValue}
            allOption
          />
        </Panel>
      </div>
    );
  }

  function renderVoteTypes() {
    if (!updatedFilters.hasOwnProperty("downvoteEnabled")) {
      return null;
    }

    return (
      <Panel title={t("Vote types")}>
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
      </Panel>
    );
  }

  return (
    <Modal isVisible={isVisible} onClose={onClose} className={styles.container}>
      {renderPokemonParts()}
      {renderReference()}
      {renderCreator()}
      {renderVoteTypes()}
      <div className={styles.buttons}>
        <Button
          title={t("Reset all filters")}
          variant={VARIANT_TEXT}
          noPadding={true}
          onClick={() => {
            setFilters(defaultFilters);
            onClose();
          }}
        />
        <div className={styles.right}>
          <Button title={t("Cancel")} variant={VARIANT_TEXT} onClick={onClose} />
          <Button
            title={t("Apply filters")}
            variant={VARIANT_FILLED_FOREGROUND}
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

export default ExploreMenuFiltersModal;
