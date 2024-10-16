import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "react-query";
import { Link, Navigate } from "react-router-dom";
import { toast } from "react-toastify";

import { useAuthentication } from "../../hook/useAuthentication";
import { useTheme } from "../../hook/useTheme";

import { resetPassword } from "../../api/pokinder";

import Button from "../../component/atom/Button/Button";
import Input from "../../component/atom/Input/Input";
import { InputValidator, validateEmail } from "../../component/atom/Input/Input";
import Title from "../../component/atom/Title/Title";
import Page from "../../component/organism/Page/Page";

import styles from "../../shared/style/Identification.module.css";

function ForgotPassword() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { isUser } = useAuthentication();

  const [isEmailValid, setIsEmailValid] = useState(false);
  const [email, setEmail] = useState();

  const isFormValid = isEmailValid;

  const { mutate: submit } = useMutation(
    async () => {
      await resetPassword(email);
    },
    {
      onSuccess: () => {
        toast.success(t("An email has been sent"));
      },
    },
  );

  return (
    <Page name={t("Forgot Password")}>
      {isUser && <Navigate to=".." relative="path"></Navigate>}
      <div className={styles.container}>
        <div className={styles.form}>
          <div>
            <Title title={t("Forgot password ?")} />
            <div className={styles.header}>
              {t("No worries, we'll send you reset instructions.")}
            </div>
          </div>
          <div className={styles.inputs}>
            <Input
              title={t("Email")}
              onChange={setEmail}
              validators={[new InputValidator(validateEmail, t("Email is invalid"))]}
              setIsValid={setIsEmailValid}
              foreground={false}
            />
          </div>
          <Button
            title={t("Reset password")}
            disabled={!isFormValid}
            onClick={submit}
            foreground={theme !== "pokeball"}
            variant="filled"
          />
          <span className={styles.footer}>
            {t("Remember your password ?")}{" "}
            <Link className={styles.action} to="/login">
              {" "}
              {t("Log In")}
            </Link>
          </span>
        </div>
      </div>
    </Page>
  );
}

export default ForgotPassword;
