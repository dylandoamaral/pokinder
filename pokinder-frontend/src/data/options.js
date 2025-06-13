import { allPokemonNames } from "../utils/pokemon";

const specialOptions = [
  { value: "All", label: "All" },
  { value: "Legendary", label: "Legendary" },
  { value: "Mythical", label: "Mythical" },
  { value: "Starter", label: "Starter" },
];

const pokemonOptions = allPokemonNames().map((name) => ({
  value: name,
  label: name,
}));

export const groupOptions = [
  {
    label: "Specials",
    options: specialOptions,
  },
  {
    label: "Pokemons",
    options: pokemonOptions,
  },
];

export const findOptionByValue = (value) => {
  for (const group of groupOptions) {
    const foundOption = group.options.find((option) => option.value === value);
    if (foundOption) {
      return foundOption;
    }
  }
  return null;
};
