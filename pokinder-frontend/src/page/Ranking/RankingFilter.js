import styles from "./RankingFilter.module.css";
import Filter from "../../component/atom/Filter/Filter";
import Select from "../../component/atom/Select/Select";
import { useTranslation } from "react-i18next";

function PokedexFilter({ pokemonOptions, filters, onChange }) {
  const { t } = useTranslation();

  const updateFilters = (newFilters) => {
    onChange(newFilters);
  };

  const setPokemonHeads = (pokemonHeads) =>
    updateFilters({ ...filters, headNameOrCategory: pokemonHeads.value });
  const setPokemonBodies = (pokemonBodies) =>
    updateFilters({ ...filters, bodyNameOrCategory: pokemonBodies.value });

  return (
    <div className={styles.container}>
      <Filter title={t("Pokemon head")}>
        <Select
          options={pokemonOptions}
          value={pokemonOptions[0].options[0]}
          onChange={setPokemonHeads}
        />
      </Filter>
      <Filter title={t("Pokemon body")}>
        <Select
          options={pokemonOptions}
          value={pokemonOptions[0].options[0]}
          onChange={setPokemonBodies}
        />
      </Filter>
    </div>
  );
}

export default PokedexFilter;
