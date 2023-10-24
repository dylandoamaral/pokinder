import { useState } from "react";
import styles from "./CheckField.module.css";

function CheckField({ title, onChange, isChecked = false }) {
  const [checked, setChecked] = useState(isChecked);

  const toggleChecked = () => {
    setChecked(!checked);
    onChange();
  };

  return (
    <div className={styles.container} onClick={toggleChecked}>
      <input
        className={styles.checkbox}
        type="checkbox"
        checked={checked}
        onChange={toggleChecked}
      />
      <span className={styles.label}>{title}</span>
    </div>
  );
}

export default CheckField;
