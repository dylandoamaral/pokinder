import { useTranslation } from "react-i18next";
import Creatable from "react-select/creatable";

import styles from "./Select.module.css";

function CreatableSelect({ options, onChange, defaultValue }) {
  const { t } = useTranslation();

  function getTranslatedOptions() {
    return options.map((option) => ({
      label: t(option.label),
      value: option.value,
    }));
  }

  const translatedOptions = getTranslatedOptions();
  const translatedDefaultValue = defaultValue
    ? { label: t(defaultValue.label), value: defaultValue.value }
    : null;

  return (
    <Creatable
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
      isClearable
    />
  );
}

export default CreatableSelect;
