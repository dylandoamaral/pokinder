import { allPokemonNames } from "../utils/pokemon";

const specialOptions = [
  { value: "All", label: "All" },
  { value: "Legendary", label: "Legendaries" },
  { value: "Mythical", label: "Mythicals" },
  { value: "Starter", label: "Starters" },
];

const pokemonOptions = allPokemonNames().map((name) => ({
  value: name,
  label: name,
}));

export const groupeOptions = [
  {
    label: "Specials",
    options: specialOptions,
  },
  {
    label: "Pokemons",
    options: pokemonOptions,
  },
];
