import { CARD_GAP, CARD_HEIGHT, CARD_PADDING, CARD_WIDTH } from "./ExploreCard";
import styles from "./ExploreCard.module.css";

export default function ExploreCardLoading() {
  return (
    <div
      className={`${styles.container} loading`}
      style={{
        "--card-padding": CARD_PADDING,
        "--card-width": CARD_WIDTH,
        "--card-height": CARD_HEIGHT,
        "--card-gap": CARD_GAP,
      }}
    >
      <div className={styles.loadingIllustration} />
      <div className={styles.title}>
        <div className={styles.loadingName} />
        <div className={styles.loadingPath} />
      </div>
      <div className={styles.loadingDetails}>
        <div className={styles.loadingDetail} />
        <div className={styles.loadingDetail} />
        <div className={styles.loadingDetail} />
      </div>
    </div>
  );
}
