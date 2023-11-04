import styles from "./FooterAccountIdModal.module.css";
import Modal from "../../atom/Modal/Modal";
import useAccountId from "../../../hook/useAccountId";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { FiRepeat } from "react-icons/fi";
import { RiCloseCircleFill, RiCheckboxCircleFill } from "react-icons/ri";
import { IconContext } from "react-icons";
import Button from "../../atom/Button/Button";

function FooterAccountIdModal({ isVisible, onClose }) {
  const [accountId, setAccountId] = useAccountId();

  const [inputValue, setInputValue] = useState(accountId);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const onSave = () => {
    setAccountId(inputValue);
    onClose();
  };

  const onGenerateMessage =
    "Before generating a new account ID, please be aware that this action will result in the loss of all your current progression. Are you sure you want to proceed?";

  const onGenerate = () => {
    if (window.confirm(onGenerateMessage)) {
      setInputValue(uuidv4());
    }
  };

  const checkIsUUIDv4 = (str) => {
    const uuidv4Regex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidv4Regex.test(str);
  };

  const isUUIDv4 = checkIsUUIDv4(inputValue);

  return (
    <Modal className={styles.container} isVisible={isVisible} onClose={onClose}>
      <h2 className={styles.title}>Account ID</h2>
      <div>
        <p>
          An 'account ID' is like a special code that gets randomly created
          whenever someone visits our website using their web browser. It helps
          us remember and keep track of when they visited our site. It's a bit
          like a unique ticket that helps us organize things on our website.
        </p>
        <p>
          You have the option to generate a new account ID if you want to
          restart the Pokinder experience. Alternatively, you can also copy an
          existing one if you need to sync two devices.
        </p>
      </div>
      <div className={styles.inputWrapper}>
        <div className={styles.inputContainer}>
          <input
            className={styles.input}
            value={inputValue}
            onChange={handleInputChange}
          />
          <div className={styles.inputValidator}>
            {isUUIDv4 ? (
              <IconContext.Provider value={{ size: 20 }}>
                <RiCheckboxCircleFill className={styles.inputValidatorOk} />
              </IconContext.Provider>
            ) : (
              <IconContext.Provider value={{ size: 20 }}>
                <RiCloseCircleFill className={styles.inputValidatorKo} />
              </IconContext.Provider>
            )}
          </div>
        </div>
        <button className={styles.generateButton} onClick={onGenerate}>
          <IconContext.Provider value={{ size: 16 }}>
            <FiRepeat />
          </IconContext.Provider>
        </button>
      </div>
      <Button
        className={styles.saveButton}
        onClick={onSave}
        disabled={!isUUIDv4}
        title="Save the new account id"
      />
    </Modal>
  );
}

export default FooterAccountIdModal;
