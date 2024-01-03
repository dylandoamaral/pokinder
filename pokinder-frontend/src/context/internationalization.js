import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enTranslation from "../lang/en.json";
import frTranslation from "../lang/fr.json";

export const languages = [
  { iso: "en", lang: "English", translation: enTranslation },
  { iso: "fr", lang: "Français", translation: frTranslation },
];

const loadResources = () => {
  const resources = {};

  for (const language of languages) {
    resources[language.iso] = {
      translation: language.translation,
    };
  }

  return resources;
};

export const findLanguageName = (iso) => {
  for (const language of languages) {
    if (language.iso === iso) return language.lang;
  }

  return "English";
};

export const findLanguageIso = (lang) => {
  for (const language of languages) {
    if (language.lang === lang) return language.iso;
  }

  return "en";
};


export const initInternationalization = () => {
  const resources = loadResources();

  i18n.use(initReactI18next).init({
    resources,
    lng: localStorage.getItem("pokinderLang"),
    fallbackLng: languages[0].iso,
    interpolation: {
      escapeValue: false,
    },
  });
};
