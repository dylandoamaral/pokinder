import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "react-query";

import { useAuthentication } from "../../../hook/useAuthentication";

import { login } from "../../../api/pokinder";

import Button from "../../atom/Button/Button";
import Input, { InputType } from "../../atom/Input/Input";
import Modal from "../../atom/Modal/Modal";
import Title from "../../atom/Title/Title";
import styles from "./HeaderModal.module.css";

function LoginModal({ isVisible, onClose, openSignup }) {
  const { t } = useTranslation();
  const { setToken, setRefreshToken } = useAuthentication();

  const [usernameOrEmail, setUsernameOrEmail] = useState(undefined);
  const [password, setPassword] = useState(undefined);

  const isFormValid = usernameOrEmail !== undefined && password !== undefined;

  const { mutate: submit } = useMutation(async () => {
    const tokens = await login(usernameOrEmail, password);
    setToken(tokens.token);
    setRefreshToken(tokens.refresh);
    onClose();
  });

  function toggleSignup() {
    onClose();
    openSignup();
  }

  return (
    <Modal className={styles.container} isVisible={isVisible} onClose={onClose}>
      <div className={styles.form}>
        <Title title={t("Log In")} />
        <div className={styles.inputs}>
          <Input
            title={t("Username") + " / " + t("Email")}
            onChange={setUsernameOrEmail}
            forceSpacer
          />
          <Input
            title={t("Password")}
            type={InputType.Password}
            onChange={setPassword}
            forceSpacer
          />
        </div>
        <Button
          title={t("Log In")}
          disabled={!isFormValid}
          onClick={submit}
          foreground
          variant="filled"
        />
        <span>
          {t("New here ?")}{" "}
          <span className={styles.action} onClick={toggleSignup}>
            {t("Sign Up")}
          </span>
        </span>
      </div>
    </Modal>
  );
}

export default LoginModal;
