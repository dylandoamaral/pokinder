import styles from "./Panel.module.css";

function Panel({ title, children, foreground = true }) {
  const titleClassName = foreground ? styles.title_foreground : styles.title_background

  return (
    <div className={styles.container}>
      {title === undefined ? <></> : <span className={`${styles.title} ${titleClassName}`}>{title}</span>}
      {children}
    </div>
  );
}

export default Panel;
