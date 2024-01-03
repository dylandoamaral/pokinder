# Pokinder

## Description

Pokinder is a website based on the game [Pokemon Infinite Fusion](https://infinitefusion.fandom.com/wiki/Pok%C3%A9mon_Infinite_Fusion_Wiki), a pokemon fan game with a huge community allowing to fuse two pokemons together to create a new species. At the beginning, these fusions was automatically generated and was odds, you can have examples [here](https://japeal.com/pkm/). Nowadays, many of these fusions are made by the community, over 100 000 fusions. 

This website was specifically designed to empower users to vote for their preferred sprites. It offers a seamless platform not only to cast votes but also to curate and save a personal collection of favorite sprites. Additionally, users can easily discover the sprites that have garnered the highest favor among the community members to help them build the ultimate team.

If you are intested, you can check the result [here](https://pokinder.com/).

## How to

First you need to undestand how to [contribute to a community project](https://docs.github.com/en/get-started/exploring-projects-on-github/contributing-to-a-project).

### add a new language

Here are the steps to follow:
- In `pokinder-frontend/src/lang` you will find the language data files.
    - Copy one of them and rename it based on the [iso](https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes) of your targeted language.
    - Fill the right texts with the traductions (for pokemons name, you need to check the `fr.json` file to have the full list).
- In `pokinder-frontend/src/context/internationalization.js` you will find the configuration.
    - You need to add the import to your file such as `import frTranslation from "../lang/fr.json";`
    - You need to add the description such as `{ iso: "fr", lang: "Français", translation: frTranslation },`

Now congratulation, You can make a pull request !

### add a new theme

First of all, themes are based on [balls available in the game](https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9_Ball).

Here are the steps to follow:
- Find a new ball, or improve an existing one.
- In `pokinder-frontend/src/index.css`, copy `:root[theme="pokeball"]` with your theme name
- In `pokinder-frontend/public`, you should add the ball svg in 32x32 in `ball` folder and the corresponding favicon in `icon` folder.
- In `pokinder-frontend/data/themes.js`, you should add your theme in `themes` object and update the `isThemeLight` function.

## Contact

Don't hesitate to contact me, raising [an issue](https://github.com/dylandoamaral/pokinder/issues) if you have any problem !