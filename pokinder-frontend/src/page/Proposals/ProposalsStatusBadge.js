import { useTranslation } from "react-i18next";

import styles from "./ProposalsStatusBadge.module.css";

function ProposalsStatusBadge({ status }) {
  const { t } = useTranslation();

  const STATUS_LABELS = {
    0: "pending",
    1: "validated",
    2: "refused",
  };

  const STATUS_CLASSES = {
    0: styles.pending,
    1: styles.validated,
    2: styles.refused,
  };

  return (
    <div className={`${styles.badge} ${STATUS_CLASSES[status]}`}>{t(STATUS_LABELS[status])}</div>
  );
}

export default ProposalsStatusBadge;
