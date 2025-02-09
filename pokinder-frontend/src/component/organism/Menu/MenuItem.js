import { TiChevronRight } from "react-icons/ti";

import styles from "./MenuItem.module.css";

function MenuItem({ name, icon, onClick, hasChevron = false }) {
  return (
    <div className={styles.container} onClick={onClick}>
      <div className={styles.label}>
        {icon}
        {name}
      </div>
      {hasChevron && <TiChevronRight className={styles.chevron} />}
    </div>
  );
}

export default MenuItem;
