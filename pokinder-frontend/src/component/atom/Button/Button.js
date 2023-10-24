import styles from "./Button.module.css";

function Button({ onClick, disabled, title }) {
  return (
    <button className={styles.container} onClick={onClick} disabled={disabled}>
      {title}
    </button>
  );
}

export default Button;
