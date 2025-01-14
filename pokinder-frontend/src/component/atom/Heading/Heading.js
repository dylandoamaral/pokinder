import styles from "./Heading.module.css";

function Heading({ children, align = "center" }) {
  return (
    <h1 className={styles.heading} style={{ textAlign: align }}>
      {children}
    </h1>
  );
}

export default Heading;
