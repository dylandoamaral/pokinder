import { memo } from "react";
import { useTranslation } from "react-i18next";

import useIsMobile from "../../hook/useIsMobile";
import useToggle from "../../hook/useToggle";

import { getDaenaLink } from "../../utils/website";

import Button, { VARIANT_FILLED_FOREGROUND } from "../../component/atom/Button/Button";
import Sprite from "../../component/atom/Sprite/Sprite";
import ReferenceProposalModal from "../../component/organism/ReferenceProposalModal/ReferenceProposalModal";

import styles from "./ExploreCard.module.css";

export const CARD_PADDING_WIDTH = 6;
export const CARD_PADDING_HEIGHT = 6;
export const CARD_BORDER_WIDTH = 6;
export const CARD_WIDTH = 160 + CARD_PADDING_WIDTH * 2 + CARD_BORDER_WIDTH * 2;
export const CARD_HEIGHT = 250 + CARD_PADDING_HEIGHT * 2 + CARD_BORDER_WIDTH * 2;
export const CARD_GAP = 16;
export const CARD_GAP_MOBILE = 4;

export function calculateCardsPerRow(width, cardPlaced = 0, isMobile) {
  const cardGap = isMobile ? CARD_GAP_MOBILE : CARD_GAP;

  if (cardPlaced === 0) {
    if (width < CARD_WIDTH) return 0;
    else return calculateCardsPerRow(width - CARD_WIDTH, 1, isMobile);
  } else {
    if (width < CARD_WIDTH + cardGap) return cardPlaced;
    else return calculateCardsPerRow(width - CARD_WIDTH - cardGap, cardPlaced + 1, isMobile);
  }
}

export const ExploreCard = memo(function ExploreCard({
  fusionId,
  fusionPath,
  fusionIsRemoved,
  fusionName,
  fusionReferences,
  children,
}) {
  const { t } = useTranslation();
  const [flipped, toggleFlipped] = useToggle(false);
  const [showReferenceProposalModal, toggleReferenceProposalModal] = useToggle(false);
  const [isMobile] = useIsMobile();

  const formattedFusionPath = fusionIsRemoved
    ? `${fusionPath.slice(0, -1)} (${t("Old")})`
    : fusionPath;
  const useMini = fusionName.length >= 18;

  function getDaenaSpriteLink(fusionPath, fusionIsRemoved) {
    if (fusionIsRemoved) return getDaenaLink(fusionPath.slice(0, -1));
    return getDaenaLink(fusionPath);
  }

  return (
    <>
      <div className={styles["card-wrapper"]}>
        <div
          className={`${styles.container} ${flipped ? styles.flipped : ""}`}
          style={{
            "--card-padding-width": CARD_PADDING_WIDTH + "px",
            "--card-padding-height": CARD_PADDING_HEIGHT + "px",
            "--card-border-width": CARD_BORDER_WIDTH + "px",
            "--card-width": CARD_WIDTH + "px",
            "--card-height": CARD_HEIGHT + "px",
            "--card-clickable": 1,
            boxShadow: isMobile ? "none" : "0px 4px 5px 2px #00000033",
          }}
          onClick={toggleFlipped}
        >
          <div className={styles.front}>
            <div className={styles.illustration}>
              <Sprite
                filename={fusionId}
                size={144}
                type="fusion"
                alt={`Fusion sprite ${fusionPath}`}
              />
            </div>
            <div className={styles.title}>
              <div className={useMini ? styles.nameMini : styles.name}>{fusionName}</div>
              <div className={useMini ? styles.pathMini : styles.path}>{formattedFusionPath}</div>
            </div>
            {children}
          </div>

          <div className={styles.back}>
            <div className={styles.buttons}>
              <Button
                title={t("More information")}
                variant={VARIANT_FILLED_FOREGROUND}
                onClick={() =>
                  window.open(
                    getDaenaSpriteLink(fusionPath, fusionIsRemoved),
                    "_blank",
                    "noopener,noreferrer",
                  )
                }
                noPadding
                fullWidth
              />
              <Button
                title={t("Propose reference")}
                variant={VARIANT_FILLED_FOREGROUND}
                onClick={toggleReferenceProposalModal}
                noPadding
                fullWidth
              />
            </div>
          </div>
        </div>
      </div>
      <ReferenceProposalModal
        isVisible={showReferenceProposalModal}
        onClose={toggleReferenceProposalModal}
        fusionId={fusionId}
        fusionPath={fusionPath}
        fusionReferences={fusionReferences}
      />
    </>
  );
});

export default ExploreCard;
