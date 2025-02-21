import { useTranslation } from "react-i18next";
import { Navigate } from "react-router-dom";

import { useAuthentication } from "../../hook/useAuthentication";

import Heading from "../../component/atom/Heading/Heading";
import Separator from "../../component/atom/Separator/Separator";
import Page from "../../component/organism/Page/Page";

import styles from "./Settings.module.css";
import SettingsPanelPassword from "./SettingsPanelPassword";

function Settings() {
  const { t } = useTranslation();
  const { isUser } = useAuthentication();

  return (
    <Page name={t("Settings")} description="Manage your account." overflow={"scroll"}>
      {!isUser && <Navigate to=".." relative="path"></Navigate>}
      <div className={styles.container}>
        <Heading>{t("Settings")}</Heading>
        <div className={styles.panels}>
          <SettingsPanelPassword />
          <Separator />
        </div>
      </div>
    </Page>
  );
}

export default Settings;
