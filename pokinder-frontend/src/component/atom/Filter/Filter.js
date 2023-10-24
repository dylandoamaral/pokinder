import styles from "./Filter.module.css";

function Filter({ title, children }) {
  return (
    <div className={styles.container}>
      <span className={styles.title}>{title}</span>
      {children}
    </div>
  );
}

export default Filter;
