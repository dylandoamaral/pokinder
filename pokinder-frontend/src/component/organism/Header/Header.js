import styles from "./Header.module.css";
import Logo from "../../atom/Logo/Logo";
import NavLink from "../../atom/Navlink/NavLink";
import Button from "../../atom/Button/Button";
import useToggle from "../../../hook/useToggle";
import SignupModal from "./SignupModal";
import { useAuthentication } from "../../../hook/useAuthentication";
import LoginModal from "./LoginModal";
import { FaArrowRightFromBracket } from "react-icons/fa6";
import Sidebar from "../../molecule/Sidebar/Sidebar";
import { navlinks } from "../../../data/navlinks";

function Header() {
  const { isUser, username, disconnect } = useAuthentication();

  const [showSignupModal, toggleSignupModal] = useToggle();
  const [showLoginModal, toggleLoginModal] = useToggle();
  const [showSidebar, toggleSidebar] = useToggle();

  function renderAccount() {
    if (isUser)
      return (
        <div className={styles.user}>
          <span className={styles.username}>{username}</span>
          <FaArrowRightFromBracket
            className={styles.quit}
            onClick={disconnect}
          />
        </div>
      );
    else return <Button title="Log In" onClick={toggleLoginModal} />;
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
            {navlinks.map((link) => (
              <NavLink link={link} />
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
