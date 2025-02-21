import styles from "./Separator.module.css";

function Separator({ transparent = false }) {
  return <div className={styles.separator} style={{ opacity: transparent ? 0.2 : 1 }} />;
}

export default Separator;
