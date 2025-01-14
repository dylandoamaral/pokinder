import { useTranslation } from "react-i18next";
import { FaTimes } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import { useAuthentication } from "../../../hook/useAuthentication";

import { authorizedNavlinks } from "../../../data/navlinks";

import Button, { VARIANT_CALL_TO_ACTION, VARIANT_FILLED_HEADER } from "../../atom/Button/Button";
import styles from "./Sidebar.module.css";

function Sidebar({ isVisible, onClose }) {
  const { t } = useTranslation();
  const { isUser, isAdmin, username, disconnect } = useAuthentication();
  const navigate = useNavigate();

  function disconnectAndClose() {
    onClose();
    disconnect();
  }

  function renderNavLink(link, index) {
    return (
      <NavLink
        to={link.path}
        className={(navData) =>
          navData.isActive ? `${styles.navlink} ${styles.navlink_active}` : `${styles.navlink}`
        }
        key={index}
        reloadDocument
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
          <Button
            title={t("Sign Out")}
            variant={VARIANT_FILLED_HEADER}
            onClick={disconnectAndClose}
          />
        </div>
      );
    } else {
      return (
        <div className={styles.profile}>
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
  }

  return (
    <div className={isVisible ? `${styles.container} ${styles.active}` : styles.container}>
      <FaTimes className={styles.close} onClick={onClose} />
      <nav className={styles.nav}>
        <div className={styles.navlinks}>
          {authorizedNavlinks(t, isAdmin).map((link, index) => renderNavLink(link, index))}
        </div>
        {renderAccount()}
      </nav>
    </div>
  );
}

export default Sidebar;
