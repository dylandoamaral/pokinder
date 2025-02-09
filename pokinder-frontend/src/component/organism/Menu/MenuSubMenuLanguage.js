import { useTranslation } from "react-i18next";

import { languages } from "../../../context/internationalization";
import MenuItem from "./MenuItem";
import MenuSubMenu from "./MenuSubMenu";

function MenuSubMenuLanguage({ onClose, onAnimationComplete, isOpen }) {
  const { t, i18n } = useTranslation();

  function changeLanguage(iso) {
    localStorage.setItem("pokinderLang", iso);
    i18n.changeLanguage(iso);
  }

  function findLanguageFlag(iso) {
    for (const language of languages) {
      if (language.iso === iso) return language.flag;
    }

    return "gb";
  }

  function languageSrc(flag) {
    return `https://hatscripts.github.io/circle-flags/flags/${flag}.svg`;
  }

  return (
    <MenuSubMenu
      title={t("Language")}
      icon={<img alt="United States" src={languageSrc(findLanguageFlag(i18n.language))} />}
      onClose={onClose}
      onAnimationComplete={onAnimationComplete}
      isOpen={isOpen}
    >
      {languages.map((language) => (
        <MenuItem
          key={language.lang}
          name={t(language.lang)}
          icon={<img alt="United States" src={languageSrc(language.flag)} />}
          onClick={() => changeLanguage(language.iso)}
        />
      ))}
    </MenuSubMenu>
  );
}

export default MenuSubMenuLanguage;
