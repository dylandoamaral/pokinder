import { useTranslation } from "react-i18next";

import { capitalize } from "../../../utils/string";

import ExploreCard from "../ExploreCard";
import styles from "./ExplorePokedexCard.module.css";

export default function ExplorePokedexCard({
  fusionId,
  fusionPath,
  fusionName,
  fusionType1,
  fusionType2,
  fusionWeight,
  fusionHeight,
}) {
  const { t } = useTranslation();

  function renderType(type) {
    if (type === undefined) return <></>;

    return (
      <img
        src={`/type/${type.toLowerCase()}.png`}
        alt={`Type ${capitalize(type)}`}
        width={16}
        height={16}
        title={capitalize(type)}
      />
    );
  }

  return (
    <ExploreCard fusionId={fusionId} fusionPath={fusionPath} fusionName={fusionName}>
      <div className={styles.details}>
        <div className={styles.detail}>
          <div className={styles.key}>{t("Types")}</div>
          <div className={styles.types}>
            {renderType(fusionType1)}
            {renderType(fusionType2)}
          </div>
        </div>
        <div className={styles.detail}>
          <div className={styles.key}>{t("Weight")}</div>
          <div className={styles.value}>{fusionWeight} kg</div>
        </div>
        <div className={styles.detail}>
          <div className={styles.key}>{t("Height")}</div>
          <div className={styles.value}>{fusionHeight} cm</div>
        </div>
      </div>
    </ExploreCard>
  );
}
