import { FaLock } from "react-icons/fa";

import Sprite from "../../component/atom/Sprite/Sprite";

import { CARD_GAP, CARD_HEIGHT, CARD_PADDING, CARD_WIDTH } from "./ExploreCard";
import styles from "./ExploreCard.module.css";

export default function ExploreCardLocked({ fusionId }) {
  return (
    <div
      className={styles.container}
      style={{
        "--card-padding": CARD_PADDING,
        "--card-width": CARD_WIDTH,
        "--card-height": CARD_HEIGHT,
        "--card-gap": CARD_GAP,
      }}
    >
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
  );
}
