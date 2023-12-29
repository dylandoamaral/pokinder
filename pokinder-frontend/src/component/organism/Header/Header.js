import { useTranslation } from "react-i18next";
import { FaArrowRightFromBracket } from "react-icons/fa6";

import { useAuthentication } from "../../../hook/useAuthentication";
import useToggle from "../../../hook/useToggle";

import { navlinks } from "../../../data/navlinks";

import Button from "../../atom/Button/Button";
import Logo from "../../atom/Logo/Logo";
import NavLink from "../../atom/Navlink/NavLink";
import Sidebar from "../../molecule/Sidebar/Sidebar";
import styles from "./Header.module.css";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";

function Header() {
  const { t } = useTranslation();
  const { isUser, username, disconnect } = useAuthentication();

  const [showSignupModal, toggleSignupModal] = useToggle();
  const [showLoginModal, toggleLoginModal] = useToggle();
  const [showSidebar, toggleSidebar] = useToggle();

  function renderAccount() {
    if (isUser)
      return (
        <div className={styles.user}>
          <span className={styles.username}>{username}</span>
          <FaArrowRightFromBracket className={styles.quit} onClick={disconnect} />
        </div>
      );
    else return <Button title={t("Log In")} onClick={toggleLoginModal} />;
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
            {navlinks(t).map((link, index) => (
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
      <SignupModal
        isVisible={showSignupModal}
        onClose={toggleSignupModal}
        openLogin={toggleLoginModal}
      />
      <LoginModal
        isVisible={showLoginModal}
        onClose={toggleLoginModal}
        openSignup={toggleSignupModal}
      />
      <Sidebar
        isVisible={showSidebar}
        onClose={toggleSidebar}
        toggleLoginModal={toggleLoginModal}
      />
    </>
  );
}

export default Header;
