import { useState } from "react";
import { useTranslation } from "react-i18next";
import AsyncCreatableSelect from "react-select/async-creatable";

import styles from "./Select.module.css";

function FutureCreatableSelect({
  onChange,
  futureValues,
  valueToOption,
  defaultValue,
  updateKey,
  allOption = false,
}) {
  const { t } = useTranslation();

  const [options, setOptions] = useState([]);
  const [oldUpdateKey, setOldUpdateKey] = useState(updateKey);

  function filterOptions(inputValue, options) {
    return options.filter((i) => i.label.toLowerCase().includes(inputValue.toLowerCase()));
  }

  function loadOptions(inputValue, callback) {
    if (options.length === 0 || oldUpdateKey !== updateKey) {
      futureValues().then((newValues) => {
        const newOptions = newValues.map((value) => valueToOption(value));
        if (allOption) newOptions.unshift({ value: "All", label: t("All") });

        setOptions(newOptions);
        setOldUpdateKey(updateKey);
        callback(filterOptions(inputValue, newOptions));
      });
    } else {
      return callback(filterOptions(inputValue, options));
    }
  }

  return (
    <AsyncCreatableSelect
      className={styles.container}
      onChange={onChange}
      loadOptions={loadOptions}
      defaultOptions={true}
      defaultValue={defaultValue}
      classNamePrefix="select"
      // NOTE: allow the select to overflow from modal.
      menuPortalTarget={document.body}
      styles={{
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
      }}
      // END
      key={JSON.stringify(updateKey)}
    />
  );
}

export default FutureCreatableSelect;
