import { useTranslation } from "react-i18next";
import { MdOpenInNew } from "react-icons/md";

import ExploreCard from "../ExploreCard";
import styles from "./ExploreReferenceCard.module.css";

export default function ExploreReferenceCard({
  fusionId,
  fusionPath,
  fusionIsRemoved,
  fusionName,
  fusionReferenceName,
  fusionReferenceLink,
  fusionReferenceProposer,
}) {
  const { t } = useTranslation();

  function onClick(e) {
    e.stopPropagation();
    window.open(fusionReferenceLink, "_blank", "noopener,noreferrer");
  }

  return (
    <ExploreCard fusionId={fusionId} fusionPath={fusionPath} fusionName={fusionName}>
      <div className={styles.details}>
        <span
          className={styles.reference}
          style={{ "--font-size-local": fusionReferenceName.length < 20 ? "1rem" : "0.75rem" }}
          onClick={onClick}
        >
          {fusionReferenceName} <MdOpenInNew className={styles.icon} />
        </span>
      </div>
      <div className={styles.credit}>
        {t("Discovered by", { proposer: fusionReferenceProposer })}
      </div>
    </ExploreCard>
  );
}
