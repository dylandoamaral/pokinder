import styles from "./NavLink.module.css";
import { NavLink as BaseNavLink } from "react-router-dom";

function NavLink({ link }) {
  return (
    <BaseNavLink
      to={link.path}
      className={(navData) =>
        navData.isActive
          ? `${styles.container}`
          : `${styles.container} ${styles.inactive}`
      }
    >
      {link.title}
    </BaseNavLink>
  );
}

export default NavLink;
