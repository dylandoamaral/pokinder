import { getDaenaLink } from "../../utils/website";

import Sprite from "../../component/atom/Sprite/Sprite";

import styles from "./ExploreCard.module.css";

export const CARD_PADDING = 8;
export const CARD_WIDTH = 160 + CARD_PADDING * 2;
export const CARD_HEIGHT = 250 + CARD_PADDING * 2;
export const CARD_GAP = 16;

export function calculateCardsPerRow(width, cardPlaced = 0) {
  if (cardPlaced === 0) {
    if (width < CARD_WIDTH) return 0;
    else return calculateCardsPerRow(width - CARD_WIDTH, 1);
  } else {
    if (width < CARD_WIDTH + CARD_GAP) return cardPlaced;
    else return calculateCardsPerRow(width - CARD_WIDTH - CARD_GAP, cardPlaced + 1);
  }
}

export default function ExploreCard({ fusionId, fusionPath, fusionName, children }) {
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
          filename={fusionId}
          href={getDaenaLink(fusionPath)}
          size={144}
          type="fusion"
          alt={`Fusion sprite ${fusionPath}`}
        />
      </div>
      <div className={styles.title}>
        <div className={styles.name}>{fusionName}</div>
        <div className={styles.path}>{fusionPath}</div>
      </div>
      {children}
    </div>
  );
}
