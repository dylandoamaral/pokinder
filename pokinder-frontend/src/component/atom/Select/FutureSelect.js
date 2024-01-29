import { useState } from "react";
import AsyncSelect from "react-select/async";

import styles from "./Select.module.css";

function FutureSelect({ onChange, futureValues, valueToOption, defaultValue }) {
  const [options, setOptions] = useState([]);

  function filterOptions(inputValue, options) {
    console.log(options);
    return options.filter((i) => i.label.toLowerCase().includes(inputValue.toLowerCase()));
  }

  function loadOptions(inputValue, callback) {
    console.log(options);
    if (options.length === 0) {
      futureValues().then((newValues) => {
        const newOptions = newValues.map((value) => valueToOption(value));
        setOptions(newOptions);
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
    />
  );
}

export default FutureSelect;
