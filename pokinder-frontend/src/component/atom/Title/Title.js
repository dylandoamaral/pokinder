import styles from "./Title.module.css";

function Title({ title, textAlign = "center" }) {
  return (
    <h2 className={styles.title} style={{ textAlign: textAlign }}>
      {title}
    </h2>
  );
}

export default Title;
