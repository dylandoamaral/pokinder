import { FaLock } from "react-icons/fa";

import Sprite from "../../component/atom/Sprite/Sprite";

import {
  CARD_BORDER_WIDTH,
  CARD_GAP,
  CARD_HEIGHT,
  CARD_PADDING_HEIGHT,
  CARD_PADDING_WIDTH,
  CARD_WIDTH,
} from "./ExploreCard";
import styles from "./ExploreCard.module.css";

export default function ExploreCardLocked({ fusionId }) {
  return (
    <div
      className={styles.container}
      style={{
        "--card-padding-width": CARD_PADDING_WIDTH + "px",
        "--card-padding-height": CARD_PADDING_HEIGHT + "px",
        "--card-border-width": CARD_BORDER_WIDTH + "px",
        "--card-width": CARD_WIDTH + "px",
        "--card-height": CARD_HEIGHT + "px",
        "--card-gap": CARD_GAP + "px",
        "--card-clickable": 0,
      }}
    >
      <div className={styles.front}>
        <div className={styles.illustration}>
          <Sprite
            className={styles.lockSprite}
            filename={fusionId}
            size={144}
            type="fusion"
            alt={`Fusion sprite locked`}
          />
        </div>
        <div className={styles.lockContainer}>
          <FaLock />
        </div>
      </div>
    </div>
  );
}
