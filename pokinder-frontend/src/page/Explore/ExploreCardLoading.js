import {
  CARD_BORDER_WIDTH,
  CARD_HEIGHT,
  CARD_PADDING_HEIGHT,
  CARD_PADDING_WIDTH,
  CARD_WIDTH,
} from "./ExploreCard";
import styles from "./ExploreCard.module.css";

export default function ExploreCardLoading() {
  return (
    <div
      className={`${styles.container} loading`}
      style={{
        "--card-padding-width": CARD_PADDING_WIDTH + "px",
        "--card-padding-height": CARD_PADDING_HEIGHT + "px",
        "--card-border-width": CARD_BORDER_WIDTH + "px",
        "--card-width": CARD_WIDTH + "px",
        "--card-height": CARD_HEIGHT + "px",
        "--card-clickable": 0,
      }}
    >
      <div className={styles.front}>
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
    </div>
  );
}
