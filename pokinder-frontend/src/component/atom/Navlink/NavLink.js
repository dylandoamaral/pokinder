import { NavLink as BaseNavLink } from "react-router-dom";

import styles from "./NavLink.module.css";

function NavLink({ link }) {
  return (
    <BaseNavLink
      to={link.path}
      className={(navData) =>
        navData.isActive ? `${styles.container}` : `${styles.container} ${styles.inactive}`
      }
      reloadDocument
    >
      {link.title}
    </BaseNavLink>
  );
}

export default NavLink;
