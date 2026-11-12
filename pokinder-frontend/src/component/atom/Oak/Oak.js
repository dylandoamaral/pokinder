import { oak } from "../../../asset";

import styles from "./Oak.module.css";

function Oak({ children }) {
  return (
    <div className={styles.container}>
      <img src={oak} alt="Professor Oak" />
      <div className={styles.content}>{children}</div>
    </div>
  );
}

export default Oak;
