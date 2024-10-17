import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "react-query";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

import { useAuthentication } from "../../hook/useAuthentication";
import { useTheme } from "../../hook/useTheme";

import { changePassword } from "../../api/pokinder";

import Button from "../../component/atom/Button/Button";
import Input from "../../component/atom/Input/Input";
import { InputValidator } from "../../component/atom/Input/Input";
import { InputType } from "../../component/atom/Input/Input";
import Title from "../../component/atom/Title/Title";
import Page from "../../component/organism/Page/Page";

import styles from "../../shared/style/Identification.module.css";

function NewPassword() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { isUser } = useAuthentication();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState();

  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(false);

  const isFormValid = isPasswordValid && isConfirmPasswordValid;

  const { mutate: submit } = useMutation(
    async () => {
      await changePassword(token, password);
    },
    {
      onSuccess: () => {
        toast.success(t("The password is changed"));
        navigate("/login");
      },
    },
  );

  return (
    <Page name={t("New Password")}>
      {token === null && <Navigate to=".." relative="path"></Navigate>}
      {isUser && <Navigate to=".." relative="path"></Navigate>}
      <div className={styles.container}>
        <div className={styles.form}>
          <Title title={t("Change your password")} />
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
              new InputValidator((input) => password === input, t("Both passwords are different")),
            ]}
            setIsValid={setIsConfirmPasswordValid}
            foreground={false}
          />
          <Button
            title={t("Change password")}
            disabled={!isFormValid}
            onClick={submit}
            foreground={theme !== "pokeball"}
            variant="filled"
          />
          <span className={styles.footer}>
            {t("Don't need a new password ?")}{" "}
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

export default NewPassword;