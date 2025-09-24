import { AnimatePresence, motion } from "motion/react";
import { forwardRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  MdOutlineAdminPanelSettings,
  MdOutlineAnalytics,
  // MdOutlineHowToVote,
  MdOutlineLanguage,
  MdOutlineLogin,
  MdOutlineLogout,
  MdOutlinePalette,
  MdOutlineSettings,
  MdOutlineStyle,
  MdOutlineViewCarousel,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";

import { useAuthentication } from "../../../hook/useAuthentication";
import useToggle from "../../../hook/useToggle";

import Avatar from "../../atom/Avatar/Avatar";
import Separator from "../../atom/Separator/Separator";
import styles from "./Menu.module.css";
import MenuItem from "./MenuItem";
import MenuSubMenuLanguage from "./MenuSubMenuLanguage";
import MenuSubMenuTheme from "./MenuSubMenuTheme";

const Menu = forwardRef(function Menu({ onClose }, ref) {
  const { t } = useTranslation();
  const { isUser, isAdmin, username, disconnect } = useAuthentication();
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
        <Separator transparent />
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

  function renderNavigationItems() {
    return (
      <>
        <MenuItem name={t("Vote")} icon={<MdOutlineViewCarousel />} onClick={() => navigate("/")} />
        <MenuItem
          name={t("Explore")}
          icon={<MdOutlineStyle />}
          onClick={() => navigate("/explore")}
        />
        <MenuItem
          name={t("Analytics")}
          icon={<MdOutlineAnalytics />}
          onClick={() => navigate("/analytics")}
        />
        <MenuItem
          name={t("Admin")}
          icon={<MdOutlineAdminPanelSettings />}
          onClick={() => navigate("/admin")}
          show={isAdmin}
        />
        <Separator transparent />
      </>
    );
  }

  function renderGuestMenu() {
    return (
      <MenuContainer>
        {renderNavigationItems()}
        <MenuItemLanguage />
        <MenuItemTheme />
        <Separator transparent />
        <MenuItem name={t("Log In")} icon={<MdOutlineLogin />} onClick={() => navigate("/login")} />
      </MenuContainer>
    );
  }

  // TODO: Implement proposals menu.
  // <MenuItem name={t("Proposals")} icon={<MdOutlineHowToVote />} />

  function renderUserMenu() {
    return (
      <MenuContainer>
        {renderNavigationItems()}
        <MenuItem
          name={t("Settings")}
          icon={<MdOutlineSettings />}
          onClick={() => navigate("/settings")}
        />
        <Separator transparent />
        <MenuItemLanguage />
        <MenuItemTheme />
        <Separator transparent />
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
