import styles from "./FooterLangButton.module.css";

import Popup from "reactjs-popup";
import FooterButton from "./FooterButton";
import { IoLanguageOutline } from "react-icons/io5";

import { useTranslation } from "react-i18next";
import {
  findLanguageName,
  languages,
} from "../../../context/internationalization";

function FooterLangButton() {
  const { i18n } = useTranslation();

  function changeLanguage(iso) {
    localStorage.setItem("pokinderLang", iso);
    i18n.changeLanguage(iso);
  }

  return (
    <Popup
      trigger={
        <FooterButton name={findLanguageName(i18n.language)}>
          <IoLanguageOutline />
        </FooterButton>
      }
      closeOnDocumentClick
      position="top right"
    >
      <div className={styles.menu}>
        {languages.map((language, index) => (
          <div
            key={index}
            className={`${styles.item} ${
              i18n.language === language.iso ? styles.selected : ""
            }`}
            onClick={() => changeLanguage(language.iso)}
          >
            {language.lang}
          </div>
        ))}
      </div>
    </Popup>
  );
}

export default FooterLangButton;
