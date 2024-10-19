import { useTranslation } from "react-i18next";
import { CgPokemon } from "react-icons/cg";
import { DiGitBranch } from "react-icons/di";
import { FaPalette, FaDiscord } from "react-icons/fa";
import { IoLanguageOutline } from "react-icons/io5";
import { LiaGithub } from "react-icons/lia";

import { useTheme } from "../../../hook/useTheme";

import { themes } from "../../../data/themes";

import {
  findLanguageIso,
  findLanguageName,
  languages,
} from "../../../context/internationalization";
import styles from "./Footer.module.css";
import FooterButton from "./FooterButton";
import FooterChoiceButton from "./FooterChoiceButton";

function Footer() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();

  function changeLanguage(lang) {
    const iso = findLanguageIso(lang);
    localStorage.setItem("pokinderLang", iso);
    i18n.changeLanguage(iso);
  }

  function changeTheme(theme) {
    localStorage.setItem("pokinderTheme", theme);
    setTheme(theme);
  }

  return (
    <footer>
      <div className={styles.container}>
        <div className={styles.left}>
          <FooterButton name="Github" link="https://github.com/dylandoamaral/pokinder">
            <LiaGithub />
          </FooterButton>
          <FooterButton
            name={t("Game")}
            link="https://infinitefusion.fandom.com/wiki/Pok%C3%A9mon_Infinite_Fusion_Wiki"
          >
            <CgPokemon />
          </FooterButton>
          <FooterButton name="Discord" link="https://discord.gg/mH2YkzR6">
            <FaDiscord />
          </FooterButton>
        </div>
        <div className={styles.right}>
          <FooterChoiceButton
            name={t("theme")}
            choices={themes}
            current={theme}
            onClick={changeTheme}
          >
            <FaPalette />
          </FooterChoiceButton>
          <FooterChoiceButton
            name={findLanguageName(i18n.language)}
            choices={languages.map((language) => language.lang)}
            current={findLanguageName(i18n.language)}
            onClick={changeLanguage}
          >
            <IoLanguageOutline />
          </FooterChoiceButton>
          <FooterButton
            name={`v${process.env.REACT_APP_VERSION}`}
            link={`https://github.com/dylandoamaral/pokinder/releases/tag/v${process.env.REACT_APP_VERSION}`}
          >
            <DiGitBranch />
          </FooterButton>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
