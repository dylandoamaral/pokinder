import { memo } from "react";
import { useTranslation } from "react-i18next";

import { getName } from "../../utils/pokemon";

import Sprite from "../../component/atom/Sprite/Sprite";

import styles from "./RankingCard.module.css";

const RankingCard = memo(function RankingCard({ ranking }) {
  const { t } = useTranslation();

  function getIndicator(rank) {
    switch (rank) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        if (rank < 1000) {
          return "th";
        } else {
          return "";
        }
    }
  }

  const rank = ranking.rank;
  const indicator = getIndicator(rank);

  function rankNumberAdditionalStyle(rank) {
    const length = rank.toString().length;

    switch (length) {
      case 1:
        return { fontSize: "20px" };
      case 2:
        return { fontSize: "18px" };
      case 3:
        return { fontSize: "14px" };
      default:
        let fontSize = 14 - (length - 3) * 2;
        if (fontSize < 7) {
          fontSize = 7;
        }
        return { fontSize: `${fontSize}px` };
    }
  }

  const rankStyle = rankNumberAdditionalStyle(rank);

  return (
    <div className={styles.container}>
      <div className={styles.rank}>
        <div className={styles.rank_title}>
          <span style={rankStyle} className={styles.rank_number}>
            {rank}
          </span>
          <span className={styles.rank_indicator}>{indicator}</span>
        </div>
      </div>
      <div className={styles.title}>
        <h2 className={styles.name}>
          {getName(
            ranking.fusion.head.name,
            ranking.fusion.head.name_separator_index,
            ranking.fusion.body.name,
            ranking.fusion.body.name_separator_index,
          )}
        </h2>
        <span className={styles.path}>#{ranking.fusion.path}</span>
      </div>
      <div className={styles.data}>
        <h2 className={styles.score}>{ranking.score}%</h2>
        <span className={styles.count}>{t("N Vote", { count: ranking.count })}</span>
      </div>
      <Sprite
        className={styles.sprite}
        path={ranking.fusion.path}
        size={144}
        type="fusion"
        alt={`Fusion sprite from ${ranking.fusion.body.name} and ${ranking.fusion.head.name}`}
      />
    </div>
  );
});

export default RankingCard;
