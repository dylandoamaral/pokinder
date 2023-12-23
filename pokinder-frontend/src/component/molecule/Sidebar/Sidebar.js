import styles from "./Sidebar.module.css";
import { FaTimes } from "react-icons/fa";
import { navlinks } from "../../../data/navlinks";
import { NavLink } from "react-router-dom";
import Button from "../../atom/Button/Button";
import { useAuthentication } from "../../../hook/useAuthentication";
import { useTranslation } from "react-i18next";

function Sidebar({ isVisible, onClose, toggleLoginModal }) {
  const { t } = useTranslation();
  const { isUser, username, disconnect } = useAuthentication();

  function disconnectAndClose() {
    onClose();
    disconnect();
  }

  function loginAndClose() {
    onClose();
    toggleLoginModal();
  }

  function renderNavLink(link, index) {
    return (
      <NavLink
        to={link.path}
        className={(navData) =>
          navData.isActive
            ? `${styles.navlink} ${styles.navlink_active}`
            : `${styles.navlink}`
        }
        key={index}
      >
        {link.title}
      </NavLink>
    );
  }

  function renderAccount() {
    if (isUser) {
      return (
        <div className={styles.profile}>
          <span>{t("Connected as", { username: username })}</span>
          <Button title={t("Sign Out")} onClick={disconnectAndClose} />
        </div>
      );
    } else {
      return <Button title={t("Log In")} onClick={loginAndClose} />;
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
          {navlinks(t).map((link, index) => renderNavLink(link, index))}
        </div>
        {renderAccount()}
      </nav>
    </div>
  );
}

export default Sidebar;
