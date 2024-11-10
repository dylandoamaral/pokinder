import { useTranslation } from "react-i18next";

import { randomDeterministicBetween } from "../../utils/random";

import styles from "./InformationPanel.module.css";

function InformationPanel({ title, value, isLoading }) {
  const { t } = useTranslation();

  if (isLoading)
    return (
      <div className={`${styles.container} loading`}>
        <span className={styles.title}>{t(title)}</span>
        <div
          className={styles.loadingValue}
          style={{ width: randomDeterministicBetween(title, 80, 150) }}
        />
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
