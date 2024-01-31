import { useTranslation } from "react-i18next";

import Sprite from "../../component/atom/Sprite/Sprite";

import styles from "./FavoritePanel.module.css";

function FavoritePanel({ title, data, type, isUser, isHead, isLoading }) {
  const { t } = useTranslation();

  function getSpriteHref() {
    const page = isUser ? "history" : "ranking";
    if (type === "fusion") return `/${page}?creatorName=${encodeURIComponent(data.name)}`;
    else if (isHead) return `/${page}?headNameOrCategory=${encodeURIComponent(data.name)}`;
    else return `/${page}?bodyNameOrCategory=${encodeURIComponent(data.name)}`;
  }

  function getFontSizeAndLineHeight(name) {
    if (name.length < 12) {
      return {
        fontSize: "32px",
        lineHeight: "1.5",
      };
    } else {
      const fontSize = `${24 - (name.length - 12)}px`;
      const lineHeight = `${1.4 + (name.length - 12) * 0.1}`;
      return {
        fontSize,
        lineHeight,
      };
    }
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
            <span className={styles.name} style={getFontSizeAndLineHeight("")}>
              {t("Not enough data")}
            </span>
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
          <span className={styles.name} style={getFontSizeAndLineHeight(data.name)}>
            {t(data.name)}
          </span>
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
