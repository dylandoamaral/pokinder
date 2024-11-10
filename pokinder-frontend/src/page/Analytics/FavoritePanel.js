import { useTranslation } from "react-i18next";

import { getScore } from "../../utils/pokemon";
import { randomDeterministicBetween } from "../../utils/random";

import Sprite from "../../component/atom/Sprite/Sprite";

import styles from "./FavoritePanel.module.css";

function FavoritePanel({ title, data, type, isUser, isHead, isLoading }) {
  const { t } = useTranslation();

  function getSpriteHref() {
    const mode = isUser ? "history" : "ranking";
    if (type === "fusion")
      return `/explore?mode=${mode}&creatorName=${encodeURIComponent(data.name)}`;
    else if (isHead)
      return `/explore?mode=${mode}&headNameOrCategory=${encodeURIComponent(data.name)}`;
    else return `/explore?mode=${mode}&bodyNameOrCategory=${encodeURIComponent(data.name)}`;
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
            <div className={styles.title}>{t(title)}</div>
            <div
              className={styles.loadingName}
              style={{ width: randomDeterministicBetween(title, 80, 150) }}
            />
          </div>
          <div className={styles.loadingScore} />
        </div>
        <span className={styles.loadingSprite} />
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
          <span className={styles.score}>{t("Average score")} : ???/100</span>
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
          {t("Average score")} : {getScore(data.average_score)}/100
        </span>
      </div>
      <Sprite type={type} filename={data.filename} href={getSpriteHref()} size={144} />
    </div>
  );
}

export default FavoritePanel;
