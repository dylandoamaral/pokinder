import styles from "./Sidebar.module.css";
import { FaTimes } from "react-icons/fa";
import { navlinks } from "../../../data/navlinks";
import { NavLink } from "react-router-dom";
import Button from "../../atom/Button/Button";
import { useAuthentication } from "../../../hook/useAuthentication";

function Sidebar({ isVisible, onClose, toggleLoginModal }) {
  const { isUser, username, disconnect } = useAuthentication();

  function disconnectAndClose() {
    onClose();
    disconnect();
  }

  function loginAndClose() {
    onClose();
    toggleLoginModal();
  }

  function renderNavLink(link) {
    return (
      <NavLink
        to={link.path}
        className={(navData) =>
          navData.isActive
            ? `${styles.navlink} ${styles.navlink_active}`
            : `${styles.navlink}`
        }
      >
        {link.title}
      </NavLink>
    );
  }

  function renderAccount() {
    if (isUser) {
      return (
        <div className={styles.profile}>
          <span>Connected as {username}</span>
          <Button title="Sign out" onClick={disconnectAndClose} />
        </div>
      );
    } else {
      return <Button title="Log In" onClick={loginAndClose} />;
    }
  }

  return (
    <div
      className={
        isVisible ? `${styles.container} ${styles.active}` : styles.container
      }
    >
      <FaTimes className={styles.close} onClick={onClose} />
      <nav className={styles.nav}>
        <div className={styles.navlinks}>
          {navlinks.map((link) => renderNavLink(link))}
        </div>
        {renderAccount()}
      </nav>
    </div>
  );
}

export default Sidebar;
