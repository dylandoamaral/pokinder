import { useTranslation } from "react-i18next";
import { FaArrowRightFromBracket } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

import { useAuthentication } from "../../../hook/useAuthentication";
import { useTheme } from "../../../hook/useTheme";
import useToggle from "../../../hook/useToggle";

import { authorizedNavlinks } from "../../../data/navlinks";

import Button from "../../atom/Button/Button";
import Logo from "../../atom/Logo/Logo";
import NavLink from "../../atom/Navlink/NavLink";
import Sidebar from "../../molecule/Sidebar/Sidebar";
import styles from "./Header.module.css";

function Header() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { isUser, isAdmin, username, disconnect } = useAuthentication();
  const navigate = useNavigate();

  const [showSidebar, toggleSidebar] = useToggle();

  function renderAccount() {
    if (isUser)
      return (
        <div className={styles.user}>
          <span className={styles.username}>{username}</span>
          <FaArrowRightFromBracket className={styles.quit} onClick={disconnect} />
        </div>
      );
    else
      return (
        <Button
          foreground={theme !== "pokeball"}
          title={t("Log In")}
          onClick={() => navigate("/login")}
        />
      );
  }

  return (
    <>
      <header className={styles.container}>
        <div className={styles.left}>
          <a href="/" className={styles.logo}>
            <Logo />
            <h1 className={styles.title}>Pokinder</h1>
          </a>
        </div>
        <div className={`${styles.center} pc_only`}>
          <nav className={styles.nav}>
            {authorizedNavlinks(t, isAdmin).map((link, index) => (
              <NavLink link={link} key={index} />
            ))}
          </nav>
        </div>
        <div className={styles.right}>
          <div className="phone_only">
            <div className={styles.hamburger} onClick={toggleSidebar}>
              <div className={styles.ham} />
              <div className={styles.ham} />
              <div className={styles.ham} />
            </div>
          </div>
          <div className="pc_only">{renderAccount()}</div>
        </div>
      </header>
      <Sidebar isVisible={showSidebar} onClose={toggleSidebar} toggleLoginModal={() => {}} />
    </>
  );
}

export default Header;
