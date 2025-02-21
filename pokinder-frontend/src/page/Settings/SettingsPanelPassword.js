import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "react-query";
import { toast } from "react-toastify";

import { resetPassword } from "../../api/pokinder";

import Button, { VARIANT_FILLED_BACKGROUND } from "../../component/atom/Button/Button";
import Input, { InputValidator, validateEmail } from "../../component/atom/Input/Input";

import SettingsPanel from "./SettingsPanel";

function SettingsPanelPassword() {
  const { t } = useTranslation();

  const [isEmailValid, setIsEmailValid] = useState(false);
  const [email, setEmail] = useState();

  const { mutate: submit } = useMutation(
    async () => {
      await resetPassword(email);
    },
    {
      onSuccess: () => {
        toast.success(t("An email has been sent if it is the correct email address"));
      },
    },
  );

  return (
    <SettingsPanel
      title={t("Password")}
      subtitleClose={t("Last updated 10 years ago")}
      subtitleOpen={t("Receive by email the instruction to reset your password.")}
      action={t("Edit")}
    >
      <div>
        <Input
          title={t("Email")}
          onChange={setEmail}
          validators={[new InputValidator(validateEmail, t("Email is invalid"))]}
          setIsValid={setIsEmailValid}
          foreground={false}
        />
        <Button
          title={t("Change password")}
          variant={VARIANT_FILLED_BACKGROUND}
          disabled={!isEmailValid}
          onClick={submit}
        />
      </div>
    </SettingsPanel>
  );
}

export default SettingsPanelPassword;
