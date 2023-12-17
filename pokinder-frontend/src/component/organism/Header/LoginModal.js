import styles from "./HeaderModal.module.css";
import Modal from "../../atom/Modal/Modal";
import Button from "../../atom/Button/Button";
import Title from "../../atom/Title/Title";
import Input, { InputType } from "../../atom/Input/Input";
import { useState } from "react";
import { login } from "../../../api/pokinder";
import { useMutation } from "react-query";
import { useAuthentication } from "../../../hook/useAuthentication";

function LoginModal({ isVisible, onClose, openSignup }) {
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
        <Title title="Log In" />
        <div className={styles.inputs}>
          <Input
            title="Username / Email"
            onChange={setUsernameOrEmail}
            forceSpacer
          />
          <Input
            title="Password"
            type={InputType.Password}
            onChange={setPassword}
            forceSpacer
          />
        </div>
        <Button title="Log In" disabled={!isFormValid} onClick={submit} />
        <span>
          New here ?{" "}
          <span className={styles.action} onClick={toggleSignup}>
            Register
          </span>
        </span>
      </div>
    </Modal>
  );
}

export default LoginModal;
