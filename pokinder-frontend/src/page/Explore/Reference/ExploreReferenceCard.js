import { useTranslation } from "react-i18next";

import ExploreCard from "../ExploreCard";
import styles from "./ExploreReferenceCard.module.css";

export default function ExploreReferenceCard({
  fusionId,
  fusionPath,
  fusionName,
  fusionReferenceName,
  fusionReferenceLink,
  fusionReferenceProposer,
}) {
  const { t } = useTranslation();

  return (
    <ExploreCard fusionId={fusionId} fusionPath={fusionPath} fusionName={fusionName}>
      <div className={styles.details}>
        <a
          className={styles.reference}
          style={{ "--font-size-local": fusionReferenceName.length < 24 ? "1rem" : "0.75rem" }}
          href={fusionReferenceLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          {fusionReferenceName}
        </a>
      </div>
      <div className={styles.credit}>
        {t("Discovered by", { proposer: fusionReferenceProposer })}
      </div>
    </ExploreCard>
  );
}
