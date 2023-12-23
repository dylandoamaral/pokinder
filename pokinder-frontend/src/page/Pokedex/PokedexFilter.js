import styles from "./PokedexFilter.module.css";
import Filter from "../../component/atom/Filter/Filter";
import Select from "../../component/atom/Select/Select";
import CheckField from "../../component/atom/CheckField/CheckField";
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
  const toggleDownvoteEnabled = () =>
    updateFilters({ ...filters, downvoteEnabled: !filters.downvoteEnabled });
  const toggleFavoriteEnabled = () =>
    updateFilters({ ...filters, favoriteEnabled: !filters.favoriteEnabled });
  const toggleUpvoteEnabled = () =>
    updateFilters({ ...filters, upvoteEnabled: !filters.upvoteEnabled });

  return (
    <div className={styles.container}>
      <Filter title={t("Pokemon head")}>
        <Select options={pokemonOptions} onChange={setPokemonHeads} />
      </Filter>
      <Filter title={t("Pokemon body")}>
        <Select options={pokemonOptions} onChange={setPokemonBodies} />
      </Filter>
      <Filter title={t("Vote types")}>
        <div className={styles.voteTypesContainer}>
          <CheckField
            title={t("Downvote")}
            onChange={toggleDownvoteEnabled}
            isChecked={filters.downvoteEnabled}
          />
          <CheckField
            title={t("Favorite")}
            onChange={toggleFavoriteEnabled}
            isChecked={filters.favoriteEnabled}
          />
          <CheckField
            title={t("Upvote")}
            onChange={toggleUpvoteEnabled}
            isChecked={filters.upvoteEnabled}
          />
        </div>
      </Filter>
    </div>
  );
}

export default PokedexFilter;
