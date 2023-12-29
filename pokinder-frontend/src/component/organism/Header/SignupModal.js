import styles from "./HeaderModal.module.css";
import Modal from "../../atom/Modal/Modal";
import Button from "../../atom/Button/Button";
import Title from "../../atom/Title/Title";
import { useAuthentication } from "../../../hook/useAuthentication";
import Input, { InputValidator, InputType } from "../../atom/Input/Input";
import { useState } from "react";
import { signup } from "../../../api/pokinder";
import { useMutation } from "react-query";
import { useTranslation } from "react-i18next";

function SignupModal({ isVisible, onClose, openLogin }) {
  const { t } = useTranslation();
  const { accountId, setToken, setRefreshToken } = useAuthentication();

  const [isUsernameValid, setIsUsernameValid] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(false);

  const [username, setUsername] = useState(undefined);
  const [email, setEmail] = useState(undefined);
  const [password, setPassword] = useState(undefined);

  const isFormValid =
    isUsernameValid &&
    isEmailValid &&
    isPasswordValid &&
    isConfirmPasswordValid;

  const { mutate: submit } = useMutation(async () => {
    const tokens = await signup(accountId, username, email, password);
    setToken(tokens.token);
    setRefreshToken(tokens.refresh);
    onClose();
  });

  function validateEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  function toggleLogin() {
    onClose();
    openLogin();
  }

  return (
    <Modal className={styles.container} isVisible={isVisible} onClose={onClose}>
      <div className={styles.form}>
        <Title title={t("Sign Up")} />
        <div className={styles.inputs}>
          <Input
            title={t("Username")}
            placeholder={t("Ash")}
            validators={[
              new InputValidator(
                (input) => input.length > 3,
                t("Username is too short")
              ),
              new InputValidator(
                (input) => input.length < 10,
                t("Username is too long")
              ),
            ]}
            setIsValid={setIsUsernameValid}
            onChange={setUsername}
          />
          <Input
            title={t("Email")}
            placeholder={t("ash@pokemon.com")}
            validators={[
              new InputValidator(validateEmail, t("Email is invalid")),
            ]}
            setIsValid={setIsEmailValid}
            onChange={setEmail}
          />
          <Input
            title={t("Password")}
            type={InputType.Password}
            validators={[
              new InputValidator(
                (input) => input.length > 6,
                t("Password is too short")
              ),
              new InputValidator(
                (input) => input.length < 20,
                t("Password is too long")
              ),
              new InputValidator(
                (input) => /(?=.*[a-z])/.test(input),
                t("Password must contain at least one lowercase letter")
              ),
              new InputValidator(
                (input) => /(?=.*[A-Z])/.test(input),
                t("Password must contain at least one uppercase letter")
              ),
              new InputValidator(
                (input) => /(?=.*\d)/.test(input),
                t("Password must contain at least one number")
              ),
              new InputValidator(
                (input) =>
                  /(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?-])/.test(input),
                t("Password must contain at least one special character")
              ),
            ]}
            setIsValid={setIsPasswordValid}
            onChange={setPassword}
          />
          <Input
            title={t("Confirm Password")}
            type={InputType.Secret}
            validators={[
              new InputValidator(
                (input) => password === input,
                t("Both passwords are different")
              ),
            ]}
            setIsValid={setIsConfirmPasswordValid}
          />
        </div>
        <Button
          title={t("Become a trainer !")}
          disabled={!isFormValid}
          onClick={submit}
          foreground
          variant="filled"
        />
        <span>
          {t("Already trainer ?")}{" "}
          <span className={styles.action} onClick={toggleLogin}>
            {t("Log In")}
          </span>
        </span>
      </div>
    </Modal>
  );
}

export default SignupModal;
