import styles from "./Select.module.css";
import BaseSelect from "react-select";

function Select({ options, value, onChange }) {
  return (
    <BaseSelect
      className={styles.container}
      options={options}
      onChange={onChange}
      defaultValue={value}
    />
  );
}

export default Select;
