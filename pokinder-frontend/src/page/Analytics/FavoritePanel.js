import { useTranslation } from "react-i18next";

import { getDaenaLinkArtists } from "../../utils/website";

import Sprite from "../../component/atom/Sprite/Sprite";

import styles from "./FavoritePanel.module.css";

function FavoritePanel({ title, data, type, isUser, isHead, isLoading }) {
  const { t } = useTranslation();

  function getSpriteHref() {
    const page = isUser ? "history" : "ranking";
    if (type === "fusion") return getDaenaLinkArtists(data.name);
    else if (isHead) return `/${page}?headNameOrCategory=${data.name}`;
    else return `/${page}?bodyNameOrCategory=${data.name}`;
  }

  if (isLoading)
    return (
      <div className={`${styles.container} loading`}>
        <div className={styles.information}>
          <div className={styles.head}>
            <span className={styles.title}>{t(title)}</span>
            <div className={styles.loadingName} />
          </div>
          <div className={styles.loadingScore} />
        </div>
        <div className={styles.loadingSprite} />
      </div>
    );

  if (data === null || data === undefined)
    return (
      <div className={styles.container}>
        <div className={styles.information}>
          <div className={styles.head}>
            <span className={styles.title}>{t(title)}</span>
            <span className={styles.name}>{t("Not enough data")}</span>
          </div>
          <span className={styles.score}>{t("Average score")} : ???%</span>
        </div>
      </div>
    );

  return (
    <div className={styles.container}>
      <div className={styles.information}>
        <div className={styles.head}>
          <span className={styles.title}>{t(title)}</span>
          <span className={styles.name}>{t(data.name)}</span>
        </div>
        <span className={styles.score}>
          {t("Average score")} : {data.average_score}%
        </span>
      </div>
      <Sprite type={type} filename={data.filename} href={getSpriteHref()} size={144} />
    </div>
  );
}

export default FavoritePanel;
