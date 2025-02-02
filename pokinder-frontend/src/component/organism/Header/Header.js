import { useTranslation } from "react-i18next";
import { FaArrowRightFromBracket } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

import { useAuthentication } from "../../../hook/useAuthentication";
import useToggle from "../../../hook/useToggle";

import { authorizedNavlinks } from "../../../data/navlinks";

import Button, { VARIANT_CALL_TO_ACTION, VARIANT_FILLED_HEADER } from "../../atom/Button/Button";
import Logo from "../../atom/Logo/Logo";
import NavLink from "../../atom/Navlink/NavLink";
import Sidebar from "../../molecule/Sidebar/Sidebar";
import styles from "./Header.module.css";

function Header() {
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
        <div className={styles.guest}>
          <Button
            title={t("Log In")}
            variant={VARIANT_FILLED_HEADER}
            onClick={() => navigate("/login")}
          />
          <Button
            title={t("Sign Up")}
            variant={VARIANT_CALL_TO_ACTION}
            onClick={() => navigate("/signup")}
          />
        </div>
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
