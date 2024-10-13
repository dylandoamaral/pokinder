import { useTranslation } from "react-i18next";
import BaseSelect from "react-select";

import styles from "./Select.module.css";

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
  const translatedDefaultValue = defaultValue
    ? { label: t(defaultValue.label), value: defaultValue.value }
    : null;

  return (
    <BaseSelect
      className={styles.container}
      options={translatedOptions}
      onChange={onChange}
      defaultValue={translatedDefaultValue}
      // NOTE: allow the select to overflow from modal.
      menuPortalTarget={document.body}
      styles={{
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
      }}
      // END
      classNamePrefix="select"
    />
  );
}

export default Select;
