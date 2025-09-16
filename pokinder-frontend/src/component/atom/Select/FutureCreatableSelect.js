import { useState } from "react";
import { useTranslation } from "react-i18next";
import AsyncCreatableSelect from "react-select/async-creatable";

import styles from "./Select.module.css";

function FutureCreatableSelect({
  onChange,
  futureValues,
  valueToOption,
  defaultLabel,
  updateKey,
  allOption = false,
}) {
  const { t } = useTranslation();

  const [state, setState] = useState({
    options: [],
    oldUpdateKey: updateKey,
    currentValue: null,
  });

  function filterOptions(inputValue, options) {
    return options.filter((i) => i.label.toLowerCase().includes(inputValue.toLowerCase()));
  }

  function loadOptions(inputValue, callback) {
    if (state.options.length === 0 || state.oldUpdateKey !== updateKey) {
      futureValues().then((newValues) => {
        const newOptions = newValues.map((value) => valueToOption(value));

        if (allOption) newOptions.unshift({ value: "All", label: t("All") });

        let defaultValue = state.currentValue;

        if (defaultLabel && !defaultValue) {
          const match = newOptions.find((opt) => opt.label === defaultLabel);
          if (match) {
            defaultValue = match;
            onChange(match);
          }
        }

        setState({
          options: newOptions,
          oldUpdateKey: updateKey,
          currentValue: defaultValue,
        });

        callback(filterOptions(inputValue, newOptions));
      });
    } else {
      return callback(filterOptions(inputValue, state.options));
    }
  }

  function handleItemSelectChange(option) {
    onChange(option);
    setState({ ...state, currentValue: option });
  }

  return (
    <AsyncCreatableSelect
      className={styles.container}
      loadOptions={loadOptions}
      defaultOptions={true}
      onChange={handleItemSelectChange}
      value={state.currentValue}
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
