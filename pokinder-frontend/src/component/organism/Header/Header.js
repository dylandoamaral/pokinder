import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { useAuthentication } from "../../../hook/useAuthentication";

import { authorizedNavlinks } from "../../../data/navlinks";

import Avatar from "../../atom/Avatar/Avatar";
import Button, { VARIANT_CALL_TO_ACTION, VARIANT_FILLED_HEADER } from "../../atom/Button/Button";
import Logo from "../../atom/Logo/Logo";
import NavLink from "../../atom/Navlink/NavLink";
import Menu from "../Menu/Menu";
import styles from "./Header.module.css";

function Header() {
  const { t } = useTranslation();
  const { isUser, isAdmin } = useAuthentication();
  const navigate = useNavigate();

  const menuRef = useRef();
  const [showMenu, setShowMenu] = useState(false);

  // NOTE: close menu when clicking outside the menu
  useEffect(() => {
    let handler = (e) => {
      if (showMenu && !menuRef.current?.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => document.removeEventListener("mousedown", handler);
  });

  function renderAvatar() {
    return (
      <div className={styles.avatar}>
        <Avatar onClick={() => setShowMenu(true)} />
        {showMenu && <Menu ref={menuRef} onClose={() => setShowMenu(false)} />}
      </div>
    );
  }

  function renderAccount() {
    if (isUser) return <div className={styles.user}>{renderAvatar()}</div>;
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
          {renderAvatar()}
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
        <div className={styles.right}>{renderAccount()}</div>
      </header>
    </>
  );
}

export default Header;
