import { useTranslation } from "react-i18next";
import { MdOpenInNew } from "react-icons/md";

import ExploreCard from "../ExploreCard";
import styles from "./ExploreReferenceCard.module.css";

export default function ExploreReferenceCard({
  fusionId,
  fusionPath,
  fusionIsRemoved,
  fusionName,
  fusionReferences,
  fusionReferenceName,
  fusionReferenceLink,
  fusionReferenceProposer,
}) {
  const { t } = useTranslation();

  function onClick(e) {
    e.stopPropagation();
    window.open(fusionReferenceLink, "_blank", "noopener,noreferrer");
  }

  function getReferenceFontSize(name) {
    const wordCount = name.trim().split(/\s+/).length;
    const nameLength = name.length;

    const maxCharacterPerWords = 15;

    if (nameLength > 30) return "0.75rem";

    if (nameLength > wordCount * maxCharacterPerWords) return "0.75rem";
    else return "1rem";
  }

  return (
    <ExploreCard
      fusionId={fusionId}
      fusionPath={fusionPath}
      fusionIsRemoved={fusionIsRemoved}
      fusionName={fusionName}
      fusionReferences={fusionReferences}
    >
      <div className={styles.details}>
        <span
          className={styles.reference}
          style={{ "--font-size-local": getReferenceFontSize(fusionReferenceName) }}
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
