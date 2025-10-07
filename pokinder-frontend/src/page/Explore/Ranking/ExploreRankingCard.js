import { useTranslation } from "react-i18next";

import ExploreCard from "../ExploreCard";
import styles from "./ExploreRankingCard.module.css";

export default function ExploreRankingCard({
  fusionId,
  fusionPath,
  fusionIsRemoved,
  fusionName,
  fusionRank,
  fusionScore,
  fusionVoteCount,
}) {
  const { t } = useTranslation();

  function addSuffix(rank) {
    switch (rank) {
      case 1:
        return "1st";
      case 2:
        return "2nd";
      case 3:
        return "3rd";
      default:
        if (rank < 1000) {
          return `${rank}th`;
        } else {
          return rank;
        }
    }
  }

  function getRankFontSize(rank) {
    const length = rank.toString().length;

    switch (length) {
      case 1:
        return { fontSize: "20px" };
      case 2:
        return { fontSize: "18px" };
      case 3:
        return { fontSize: "14px" };
      default:
        let fontSize = 17 - (length - 3) * 2;
        if (fontSize < 7) {
          fontSize = 7;
        }
        return { fontSize: `${fontSize}px` };
    }
  }

  return (
    <ExploreCard fusionId={fusionId} fusionPath={fusionPath} fusionIsRemoved={fusionIsRemoved} fusionName={fusionName}>
      <div className={styles.container}>
        <div className={styles.details}>
          <div className={styles.rank} style={getRankFontSize(fusionRank)}>
            {addSuffix(fusionRank)}
          </div>
          <div className={styles.information}>
            <div className={styles.score}>{`${fusionScore}/100`}</div>
            <div className={styles.vote}>{t("N Vote", { count: fusionVoteCount })}</div>
          </div>
        </div>
      </div>
    </ExploreCard>
  );
}
