import styles from "./Box.module.css";

function Box({ title, children }) {
  return (
    <div className={styles.container}>
      <span className={styles.title}>{title}</span>
      {children}
    </div>
  );
}

export default Box;
