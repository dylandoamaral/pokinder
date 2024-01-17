import { useTranslation } from "react-i18next";

import styles from "./InformationPanel.module.css";

function InformationPanel({ title, value, isLoading }) {
  const { t } = useTranslation();

  if (isLoading)
    return (
      <div className={`${styles.container} loading`}>
        <span className={styles.title}>{t(title)}</span>
        <div className={styles.loadingValue} />
      </div>
    );

  return (
    <div className={styles.container}>
      <span className={styles.title}>{t(title)}</span>
      <span className={styles.value}>{t(value)}</span>
    </div>
  );
}

export default InformationPanel;
