import { memo } from "react";

import styles from "./LoadingRankingCard.module.css";

const LoadingRankingCard = memo(function LoadingRankingCard() {
  return (
    <div className={styles.container}>
      <div className={styles.rank} />
      <div className={styles.title}>
        <div className={styles.name} />
        <div className={styles.path} />
      </div>
      <div className={styles.data}>
        <div className={styles.score} />
        <div className={styles.count} />
      </div>
      <div className={styles.sprite}>
        <div />
      </div>
    </div>
  );
});

export default LoadingRankingCard;
