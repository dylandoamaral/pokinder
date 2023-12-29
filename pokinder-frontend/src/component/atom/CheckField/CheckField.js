import styles from "./CheckField.module.css";

function CheckField({ title, onChange, isChecked = false }) {
  return (
    <label className={styles.container}>
      <input
        className={styles.checkbox}
        type="checkbox"
        onChange={onChange}
        checked={isChecked}
      />
      <div className={styles.checkmark}>
        <div className={styles.checked} />
      </div>
      {title}
    </label>
  );
}

export default CheckField;
