import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "react-query";
import { Link, Navigate } from "react-router-dom";

import { useAuthentication } from "../../hook/useAuthentication";

import { login } from "../../api/pokinder";

import Button, { VARIANT_FILLED_BACKGROUND } from "../../component/atom/Button/Button";
import Heading from "../../component/atom/Heading/Heading";
import Input from "../../component/atom/Input/Input";
import { InputType } from "../../component/atom/Input/Input";
import Page from "../../component/organism/Page/Page";

import styles from "../../shared/style/Identification.module.css";

function LogIn() {
  const { t } = useTranslation();
  const { isUser, setTokens } = useAuthentication();

  const defaultForm = {
    usernameOrEmail: undefined,
    password: undefined,
  };

  const [form, setForm] = useState(defaultForm);

  const setUsernameOrEmail = (usernameOrEmail) =>
    setForm({ ...form, usernameOrEmail: usernameOrEmail });
  const setPassword = (password) => setForm({ ...form, password: password });

  const isFormValid = form.usernameOrEmail !== undefined && form.password !== undefined;

  const { mutate: submit } = useMutation(async () => {
    const tokens = await login(form.usernameOrEmail, form.password);
    setTokens({ token: tokens.token, refreshToken: tokens.refresh });
  });

  return (
    <Page name={t("Log In")}>
      {isUser && <Navigate to=".." relative="path"></Navigate>}
      <div className={styles.container}>
        <div className={styles.form}>
          <Heading>{t("Welcome back !")}</Heading>
          <div className={styles.inputs}>
            <Input
              title={t("Username") + " / " + t("Email")}
              onChange={setUsernameOrEmail}
              foreground={false}
              forceSpacer
            />
            <Input
              title={t("Password")}
              type={InputType.Password}
              onChange={setPassword}
              foreground={false}
            />
            <Link className={styles.forgot} to="/forgotpassword">
              {" "}
              {t("Forgot password ?")}
            </Link>
          </div>
          <Button
            title={t("Log In")}
            variant={VARIANT_FILLED_BACKGROUND}
            disabled={!isFormValid}
            onClick={submit}
          />
          <span className={styles.footer}>
            {t("New here ?")}{" "}
            <Link className={styles.action} to="/signup">
              {" "}
              {t("Sign Up")}
            </Link>
          </span>
        </div>
      </div>
    </Page>
  );
}

export default LogIn;
