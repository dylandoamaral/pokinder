import { MultiSelect as BaseMultiSelect } from "react-multi-select-component";
import styles from "./MultiSelect.module.css";

function MultiSelect({ options, value, onChange }) {
  return (
    <BaseMultiSelect
      className={styles.container}
      options={options}
      value={value}
      onChange={onChange}
      labelledBy="Select"
    />
  );
}

export default MultiSelect;
