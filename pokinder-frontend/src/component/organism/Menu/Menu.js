import { AnimatePresence, motion } from "motion/react";
import { forwardRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  MdOutlineHowToVote,
  MdOutlineLanguage,
  MdOutlineLogin,
  MdOutlineLogout,
  MdOutlinePalette,
  MdOutlineSettings,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";

import { useAuthentication } from "../../../hook/useAuthentication";
import useToggle from "../../../hook/useToggle";

import Avatar from "../../atom/Avatar/Avatar";
import styles from "./Menu.module.css";
import MenuItem from "./MenuItem";
import MenuSeparator from "./MenuSeparator";
import MenuSubMenuLanguage from "./MenuSubMenuLanguage";
import MenuSubMenuTheme from "./MenuSubMenuTheme";

const Menu = forwardRef(function Menu({ onClose }, ref) {
  const { t } = useTranslation();
  const { isUser, username, disconnect } = useAuthentication();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);

  const [showLanguageMenu, toggleShowLanguageMenu] = useToggle(false);
  const [showThemeMenu, toggleShowThemeMenu] = useToggle(false);

  function MenuHeader() {
    return (
      <div className={styles.header}>
        <Avatar />
        <div>
          <div className={styles.headerText}>{t("Connected as")}</div>
          <div className={styles.headerUsername}>{isUser ? username : t("Guest")}</div>
        </div>
      </div>
    );
  }

  function MenuItemLanguage() {
    return (
      <MenuItem
        name={t("Language")}
        icon={<MdOutlineLanguage />}
        hasChevron={true}
        onClick={() => toggleShowLanguageMenu()}
      />
    );
  }

  function MenuItemTheme() {
    return (
      <MenuItem
        name={t("Theme")}
        icon={<MdOutlinePalette />}
        hasChevron={true}
        onClick={() => toggleShowThemeMenu()}
      />
    );
  }

  function MenuContainer({ children }) {
    const variants = {
      hidden: { height: 0 },
      visible: { height: "auto" },
    };

    return (
      <motion.div
        className={styles.container}
        key="menu"
        ref={ref}
        variants={variants}
        initial={isOpen ? "visible" : "hidden"}
        animate="visible"
        transition={{ duration: 0.2, ease: "easeIn" }}
        onAnimationComplete={() => setIsOpen(true)}
      >
        <MenuHeader />
        <MenuSeparator />
        {children}
        {/* NOTE: Animation on exit don't work for an obscure reason. */}
        <AnimatePresence>
          {showLanguageMenu && (
            <MenuSubMenuLanguage key="submenu-language" onClose={toggleShowLanguageMenu} />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showThemeMenu && <MenuSubMenuTheme key="submenu-theme" onClose={toggleShowThemeMenu} />}
        </AnimatePresence>
      </motion.div>
    );
  }

  function renderGuestMenu() {
    return (
      <MenuContainer>
        <MenuItemLanguage />
        <MenuItemTheme />
        <MenuSeparator />
        <MenuItem name={t("Log In")} icon={<MdOutlineLogin />} onClick={() => navigate("/login")} />
      </MenuContainer>
    );
  }

  function renderUserMenu() {
    return (
      <MenuContainer>
        <MenuItem
          name={t("Settings")}
          icon={<MdOutlineSettings />}
          onClick={() => navigate("/settings")}
        />
        <MenuItem name={t("Proposals")} icon={<MdOutlineHowToVote />} />
        <MenuSeparator />
        <MenuItemLanguage />
        <MenuItemTheme />
        <MenuSeparator />
        <MenuItem
          name={t("Log Out")}
          icon={<MdOutlineLogout />}
          onClick={() => {
            disconnect();
            onClose();
            navigate("/");
          }}
        />
      </MenuContainer>
    );
  }

  return (
    <>
      <motion.div
        className={styles.background}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 0.1, ease: "easeIn" }}
      />
      <div className={styles.positioner}>{isUser ? renderUserMenu() : renderGuestMenu()}</div>
    </>
  );
});

export default Menu;
