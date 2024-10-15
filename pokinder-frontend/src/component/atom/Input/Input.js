import { useState } from "react";
import { IconContext } from "react-icons";
import { FaCheck, FaTimes } from "react-icons/fa";

import Panel from "../Panel/Panel";
import styles from "./Input.module.css";

function Input({
  title = undefined,
  placeholder = undefined,
  defaultValue = undefined,
  foreground = true,
  type = InputType.Text,
  required = true,
  validators = [],
  setIsValid = (_) => { },
  onChange = () => { },
  forceSpacer = false,
}) {
  const [inputValue, setInputValue] = useState(defaultValue);

  const handleInputChange = (e) => {
    const value = e.target.value === "" ? undefined : e.target.value;
    setInputValue(value);
    setIsValid(retrieveUnresolvedValidator(value) === undefined);
    onChange(value);
  };

  const inputType = type === InputType.Text ? "text" : "password";

  function retrieveUnresolvedValidator(input) {
    if (input === undefined) return undefined;

    for (const validator of validators) {
      if (!validator.isValid(input)) {
        return validator;
      }
    }

    return undefined;
  }

  function renderValidator() {
    if (validators.length === 0 || inputValue === undefined) return;

    if (retrieveUnresolvedValidator(inputValue) === undefined) {
      return (
        <IconContext.Provider value={{ size: 16 }}>
          <FaCheck className={styles.ok} />
        </IconContext.Provider>
      );
    } else {
      return (
        <IconContext.Provider value={{ size: 16 }}>
          <FaTimes className={styles.ko} />
        </IconContext.Provider>
      );
    }
  }

  function renderErrorMessage() {
    if (validators.length === 0 && !forceSpacer) return;

    if (inputValue === undefined) {
      return <div className={styles.errorSpacer} />;
    }

    const validator = retrieveUnresolvedValidator(inputValue);

    if (validator === undefined) {
      return <div className={styles.errorSpacer} />;
    }

    return <div className={styles.error}>{validator.message}</div>;
  }

  return (
    <Panel title={title} foreground={foreground}>
      <div className={styles.box}>
        <input
          className={styles.input}
          value={defaultValue}
          onChange={handleInputChange}
          required={required}
          placeholder={placeholder}
          type={inputType}
        />
        {renderValidator()}
      </div>
      {renderErrorMessage()}
    </Panel>
  );
}

export const InputType = {
  Text: 0,
  Secret: 1,
  Password: 2,
};

export class InputValidator {
  constructor(predicate, message) {
    this.predicate = predicate;
    this.message = message;
  }

  isValid(input) {
    return this.predicate(input);
  }
}

export default Input;
