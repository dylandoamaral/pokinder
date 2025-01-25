import styles from "./Tooltip.module.css";

function Tooltip({ children, text }) {
  return (
    <div className={styles.container}>
      {children}
      <div className={styles.tooltip}>{text}</div>
    </div>
  );
}

export default Tooltip;
