import { TiChevronLeft } from "react-icons/ti";

import MenuSeparator from "./MenuSeparator";
import styles from "./MenuSubMenu.module.css";

function MenuSubMenu({ title, icon, children, onClose }) {
  return (
    <div className={styles.container}>
      <div className={styles.header} onClick={() => onClose()}>
        <TiChevronLeft className={styles.chevron} />
        {icon}
        {title}
      </div>
      <MenuSeparator />
      {children}
    </div>
  );
}

export default MenuSubMenu;
