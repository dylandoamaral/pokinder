import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "react-query";
import { Link, Navigate } from "react-router-dom";
import { toast } from "react-toastify";

import { useAuthentication } from "../../hook/useAuthentication";

import { resetPassword } from "../../api/pokinder";

import Button, { VARIANT_FILLED_BACKGROUND } from "../../component/atom/Button/Button";
import Heading from "../../component/atom/Heading/Heading";
import Input from "../../component/atom/Input/Input";
import { InputValidator, validateEmail } from "../../component/atom/Input/Input";
import Page from "../../component/organism/Page/Page";

import styles from "../../shared/style/Identification.module.css";

function ForgotPassword() {
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
            <Heading>{t("Forgot password ?")}</Heading>
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
            variant={VARIANT_FILLED_BACKGROUND}
            disabled={!isFormValid}
            onClick={submit}
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
