import styles from "./HeaderModal.module.css";
import Modal from "../../atom/Modal/Modal";
import Button from "../../atom/Button/Button";
import Title from "../../atom/Title/Title";
import { useAuthentication } from "../../../hook/useAuthentication";
import Input, { InputValidator, InputType } from "../../atom/Input/Input";
import { useState } from "react";
import { signup } from "../../../api/pokinder";
import { useMutation } from "react-query";

function SignupModal({ isVisible, onClose, openLogin }) {
  const { accountId, setToken } = useAuthentication();

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
    const token = await signup(accountId, username, email, password);
    setToken(token);
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
        <Title title="Sign Up" />
        <div className={styles.inputs}>
          <Input
            title="Username"
            placeholder="Ash"
            validators={[
              new InputValidator(
                (input) => input.length > 3,
                "Username is too short"
              ),
              new InputValidator(
                (input) => input.length < 10,
                "Username is too long"
              ),
            ]}
            setIsValid={setIsUsernameValid}
            onChange={setUsername}
          />
          <Input
            title="Email"
            placeholder="ash@gmail.com"
            validators={[new InputValidator(validateEmail, "Email is invalid")]}
            setIsValid={setIsEmailValid}
            onChange={setEmail}
          />
          <Input
            title="Password"
            type={InputType.Password}
            validators={[
              new InputValidator(
                (input) => input.length > 6,
                "Password is too short"
              ),
              new InputValidator(
                (input) => input.length < 20,
                "Password is too long"
              ),
              new InputValidator(
                (input) => /(?=.*[a-z])/.test(input),
                "Password must contain at least one lowercase letter"
              ),
              new InputValidator(
                (input) => /(?=.*[A-Z])/.test(input),
                "Password must contain at least one uppercase letter"
              ),
              new InputValidator(
                (input) => /(?=.*\d)/.test(input),
                "Password must contain at least one number"
              ),
              new InputValidator(
                (input) =>
                  /(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?-])/.test(input),
                "Password must contain at least one special character"
              ),
            ]}
            setIsValid={setIsPasswordValid}
            onChange={setPassword}
          />
          <Input
            title="Confirm Password"
            type={InputType.Secret}
            validators={[
              new InputValidator(
                (input) => password === input,
                "Both passwords are different"
              ),
            ]}
            setIsValid={setIsConfirmPasswordValid}
          />
        </div>
        <Button
          title="Become a dresser !"
          disabled={!isFormValid}
          onClick={submit}
        />
        <span>
          Already member ?{" "}
          <span className={styles.action} onClick={toggleLogin}>
            Login
          </span>
        </span>
      </div>
    </Modal>
  );
}

export default SignupModal;
