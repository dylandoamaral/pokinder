import { useState } from "react";
import AsyncSelect from "react-select/async";
import { useTranslation } from "react-i18next";

import styles from "./Select.module.css";

function FutureSelect({ onChange, futureValues, valueToOption, defaultValue, updateKey, allOption = false }) {
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
        if (allOption) newOptions.unshift({ value: "All", label: t("All") })

        setOptions(newOptions);
        setOldUpdateKey(updateKey);
        callback(filterOptions(inputValue, newOptions));
      });
    } else {
      return callback(filterOptions(inputValue, options));
    }
  }

  return (
    <AsyncSelect
      className={styles.container}
      onChange={onChange}
      loadOptions={loadOptions}
      defaultOptions={true}
      defaultValue={defaultValue}
      classNamePrefix="select"
      key={JSON.stringify(updateKey)}
    />
  );
}

export default FutureSelect;
