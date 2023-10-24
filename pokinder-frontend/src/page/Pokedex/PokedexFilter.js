import styles from "./PokedexFilter.module.css";
import Filter from "../../component/atom/Filter/Filter";
import Select from "../../component/atom/Select/Select";
import CheckField from "../../component/atom/CheckField/CheckField";

function PokedexFilter({ pokemonOptions, filters, onChange }) {
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
      <Filter title="Pokemon head">
        <Select
          options={pokemonOptions}
          value={pokemonOptions[0].options[0]}
          onChange={setPokemonHeads}
        />
      </Filter>
      <Filter title="Pokemon body">
        <Select
          options={pokemonOptions}
          value={pokemonOptions[0].options[0]}
          onChange={setPokemonBodies}
        />
      </Filter>
      <Filter title="Vote types">
        <div className={styles.voteTypesContainer}>
          <CheckField
            title="Downvote"
            onChange={toggleDownvoteEnabled}
            isChecked={filters.downvoteEnabled}
          />
          <CheckField
            title="Favorite"
            onChange={toggleFavoriteEnabled}
            isChecked={filters.favoriteEnabled}
          />
          <CheckField
            title="Upvote"
            onChange={toggleUpvoteEnabled}
            isChecked={filters.upvoteEnabled}
          />
        </div>
      </Filter>
    </div>
  );
}

export default PokedexFilter;
