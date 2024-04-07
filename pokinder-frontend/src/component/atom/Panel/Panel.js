import styles from "./Panel.module.css";

function Panel({ title, children }) {
  return (
    <div className={styles.container}>
      {title === undefined ? <></> : <span className={styles.title}>{title}</span>}
      {children}
    </div>
  );
}

export default Panel;
