import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "react-query";
import { useNavigate, Navigate } from "react-router-dom";
import { useTheme } from "../../hook/useTheme";

import { useAuthentication } from "../../hook/useAuthentication";

import { signup } from "../../api/pokinder";

import Button from "../../component/atom/Button/Button";
import Input from "../../component/atom/Input/Input";
import { InputType } from "../../component/atom/Input/Input";
import { InputValidator } from "../../component/atom/Input/Input";
import Title from "../../component/atom/Title/Title";
import Page from "../../component/organism/Page/Page";

import styles from "./SignUp.module.css";

function Signup() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { isUser, accountId, setToken, setRefreshToken } = useAuthentication();
  const navigate = useNavigate();

  const defaultForm = {
    username: undefined,
    email: undefined,
    password: undefined,
  };

  const [form, setForm] = useState(defaultForm);

  const setUsername = (username) => setForm({ ...form, username: username });
  const setEmail = (email) => setForm({ ...form, email: email });
  const setPassword = (password) => setForm({ ...form, password: password });

  const [isUsernameValid, setIsUsernameValid] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(false);

  const isFormValid = isUsernameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid;

  const { mutate: submit } = useMutation(async () => {
    const tokens = await signup(accountId, form.username, form.email, form.password);
    setToken(tokens.token);
    setRefreshToken(tokens.refresh);
  });

  function validateEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  return (
    <Page name={t("Log In")}>
      {isUser && (<Navigate to=".." relative="path"></Navigate>)}
      <div className={styles.container}>
        <div className={styles.form}>
          <Title title={t("Sign Up")} />
          <div className={styles.inputs}>
            <Input
              title={t("Username")}
              placeholder={t("Ash")}
              validators={[
                new InputValidator((input) => input.length > 3, t("Username is too short")),
                new InputValidator((input) => input.length < 10, t("Username is too long")),
              ]}
              setIsValid={setIsUsernameValid}
              onChange={setUsername}
              foreground={false}
            />
            <Input
              title={t("Email")}
              placeholder={t("ash@pokemon.com")}
              validators={[new InputValidator(validateEmail, t("Email is invalid"))]}
              setIsValid={setIsEmailValid}
              onChange={setEmail}
              foreground={false}
            />
            <Input
              title={t("Password")}
              type={InputType.Password}
              validators={[
                new InputValidator((input) => input.length > 6, t("Password is too short")),
                new InputValidator((input) => input.length < 20, t("Password is too long")),
                new InputValidator(
                  (input) => /(?=.*[a-z])/.test(input),
                  t("Password must contain at least one lowercase letter"),
                ),
                new InputValidator(
                  (input) => /(?=.*[A-Z])/.test(input),
                  t("Password must contain at least one uppercase letter"),
                ),
                new InputValidator(
                  (input) => /(?=.*\d)/.test(input),
                  t("Password must contain at least one number"),
                ),
                new InputValidator(
                  (input) => /(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?-])/.test(input),
                  t("Password must contain at least one special character"),
                ),
              ]}
              setIsValid={setIsPasswordValid}
              onChange={setPassword}
              foreground={false}
            />
            <Input
              title={t("Confirm Password")}
              type={InputType.Secret}
              validators={[
                new InputValidator(
                  (input) => form.password === input,
                  t("Both passwords are different"),
                ),
              ]}
              setIsValid={setIsConfirmPasswordValid}
              foreground={false}
            />
          </div>
          <Button
            title={t("Become a trainer !")}
            disabled={!isFormValid}
            onClick={submit}
            foreground={theme !== "pokeball"}
            variant="filled"
          />
          <span>
            {t("Already trainer ?")}{" "}
            <span className={styles.action} onClick={() => navigate("/login")}>
              {t("Log In")}
            </span>
          </span>
        </div>
      </div>
    </Page>
  );
}

export default Signup;
