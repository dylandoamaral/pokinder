import styles from "./Select.module.css";
import BaseSelect from "react-select";
import { useTranslation } from "react-i18next";

function Select({ options, onChange, defaultValue }) {
  const { t } = useTranslation();

  function getTranslatedOptions() {
    return options.map((option) => ({
      label: t(option.label),
      options: option.options.map((subOption) => ({
        label: t(subOption.label),
        value: subOption.value,
      })),
    }));
  }

  const translatedOptions = getTranslatedOptions();

  return (
    <BaseSelect
      className={styles.container}
      options={translatedOptions}
      onChange={onChange}
      defaultValue={defaultValue || translatedOptions[0].options[0]}
    />
  );
}

export default Select;
