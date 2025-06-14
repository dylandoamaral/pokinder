import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaPlus } from "react-icons/fa";

import { useAuthentication } from "../../hook/useAuthentication";
import useIsMobile from "../../hook/useIsMobile";

import { getName, getTypes } from "../../utils/pokemon";
import { getDaenaLink } from "../../utils/website";

import Sprite from "../../component/atom/Sprite/Sprite";
import Tooltip from "../../component/atom/Tooltip/Tooltip";
import Type from "../../component/atom/Type/Type";

import styles from "./VoteCard.module.css";
import VoteCardReference from "./VoteCardReference";

function VoteCard({ fusion, transition, onReferenceButtonClick, hasFocus = false }) {
  const { t } = useTranslation();
  const { isUser } = useAuthentication();

  const MOBILE_RATIO = 0.75;

  const [isMobile] = useIsMobile();

  const defaultOpacity = hasFocus ? 1 : 0.3;
  // NOTE: The mobile moving part is images taking 432px.
  const defaultHeight = isMobile ? 617 - 432 + 432 * MOBILE_RATIO : 617;

  const defaultBackgroundWidthDesktop = hasFocus ? 380 : 290;
  const defaultBackgroundWidthMobile = defaultBackgroundWidthDesktop - 40;
  const defaultBackgroundWidth = isMobile
    ? defaultBackgroundWidthMobile
    : defaultBackgroundWidthDesktop;

  const defaultBackgroundHeightDesktop = hasFocus ? 490 : 370;
  const defaultBackgroundHeightMobile = defaultBackgroundHeightDesktop * MOBILE_RATIO;
  const defaultBackgroundHeight = isMobile
    ? defaultBackgroundHeightMobile
    : defaultBackgroundHeightDesktop;

  const defaultFusionSizeDesktop = hasFocus ? 288 : 216;
  const defaultFusionSizeMobile = defaultFusionSizeDesktop * MOBILE_RATIO;
  const defaultFusionSize = isMobile ? defaultFusionSizeMobile : defaultFusionSizeDesktop;

  const defaultPokemonSizeDesktop = hasFocus ? 144 : 72;
  const defaultPokemonSizeMobile = defaultPokemonSizeDesktop * MOBILE_RATIO;
  const defaultPokemonSize = isMobile ? defaultPokemonSizeMobile : defaultPokemonSizeDesktop;

  const defaultReferenceTopPosition = isMobile ? 150 : 144;
  const defaultReferenceLeftPosition = isMobile
    ? defaultBackgroundWidthMobile - 24
    : defaultBackgroundWidthDesktop - 16;

  const [opacity, setOpacity] = useState(defaultOpacity);
  const [backgroundWidth, setBackgroundWidth] = useState(defaultBackgroundWidth);
  const [width, setWidth] = useState(defaultBackgroundWidthDesktop);
  const [backgroundHeight, setBackgroundHeight] = useState(defaultBackgroundHeight);
  const [height, setHeight] = useState(defaultHeight);
  const [fusionSize, setFusionSize] = useState(defaultFusionSize);
  const [pokemonSize, setPokemonSize] = useState(defaultPokemonSize);
  const [referenceTopPosition, setReferenceTopPosition] = useState(defaultReferenceTopPosition);
  const [referenceLeftPosition, setReferenceLeftPosition] = useState(defaultReferenceLeftPosition);

  useEffect(() => {
    setOpacity(defaultOpacity);
    setHeight(defaultHeight);
    setBackgroundWidth(defaultBackgroundWidth);
    setWidth(defaultBackgroundWidthDesktop);
    setBackgroundHeight(defaultBackgroundHeight);
    setFusionSize(defaultFusionSize);
    setPokemonSize(defaultPokemonSize);
    setReferenceTopPosition(defaultReferenceTopPosition);
    setReferenceLeftPosition(defaultReferenceLeftPosition);
  }, [
    hasFocus,
    defaultOpacity,
    defaultHeight,
    defaultBackgroundWidth,
    defaultBackgroundWidthDesktop,
    defaultBackgroundHeight,
    defaultFusionSize,
    defaultPokemonSize,
    defaultReferenceTopPosition,
    defaultReferenceLeftPosition,
  ]);

  const cardWidth = hasFocus ? 380 : 290;

  if (Object.keys(fusion).length === 0) {
    return <div style={{ width: cardWidth }} />;
  }

  function renderReference(reference, key) {
    if (isMobile) return <></>;

    return <VoteCardReference key={key} reference={reference} />;
  }

  function renderReferenceButton() {
    if (!isUser) {
      return (
        <Tooltip text={t("Connect to propose a reference")}>
          <div className={`${styles.referenceButton} ${styles.referenceButtonLocked}`}>
            <FaPlus className={styles.referenceButtonIcon} />
          </div>
        </Tooltip>
      );
    } else {
      return (
        <div
          className={`${styles.referenceButton} ${styles.referenceButtonUnlocked}`}
          onClick={() => onReferenceButtonClick()}
        >
          <FaPlus className={styles.referenceButtonIcon} />
        </div>
      );
    }
  }

  function renderReferences(references) {
    if (!hasFocus) return <></>;

    return (
      <motion.div
        className={styles.references}
        style={{ left: referenceLeftPosition, top: referenceTopPosition, opacity: opacity }}
        animate={{
          left: referenceLeftPosition,
          top: referenceTopPosition,
          opacity: opacity,
        }}
        transition={transition}
      >
        {references.map((reference, key) => renderReference(reference, key))}
        {renderReferenceButton()}
      </motion.div>
    );
  }

  function renderTitle(fusion) {
    const LITTLE_LENGTH = 17;
    const MEDIUM_LENGTH = 10;

    const name = getName(
      fusion.head.name,
      fusion.head.name_separator_index,
      fusion.body.name,
      fusion.body.name_separator_index,
    );

    return (
      <div className={styles.title}>
        <span
          className={
            name.length > LITTLE_LENGTH
              ? styles.littlename
              : name.length > MEDIUM_LENGTH
                ? styles.mediumname
                : styles.name
          }
        >
          {name}
        </span>
        <span
          className={
            name.length > LITTLE_LENGTH
              ? styles.littlepath
              : name.length > MEDIUM_LENGTH
                ? styles.mediumpath
                : styles.path
          }
        >
          #{fusion.path}
        </span>
      </div>
    );
  }

  return (
    <>
      <motion.div
        style={{ width: width, height: height, opacity: opacity }}
        animate={{ width: width, height: height, opacity: opacity }}
        transition={transition}
        className={styles.container}
      >
        <div className={styles.content}>
          <motion.div
            style={{ width: fusionSize, height: fusionSize }}
            animate={{ width: fusionSize, height: fusionSize }}
            transition={transition}
          >
            <Sprite
              type="fusion"
              filename={fusion.id}
              href={hasFocus ? getDaenaLink(fusion.path) : null}
              alt={`Fusion sprite from ${fusion.body.name} and ${fusion.head.name}`}
            />
          </motion.div>
          <div className={styles.header}>
            {renderTitle(fusion)}
            <div className={styles.types}>
              {getTypes(
                fusion.head.type_1,
                fusion.head.type_2,
                fusion.body.type_1,
                fusion.body.type_2,
              ).map((type, index) => (
                <Type type={type} key={index} />
              ))}
            </div>
          </div>
          <div className={styles.parents}>
            <div className={styles.parent}>
              <span className={styles.parentName}>{t("Head")}</span>
              <motion.div
                style={{ width: pokemonSize, height: pokemonSize }}
                animate={{
                  width: pokemonSize,
                  height: pokemonSize,
                }}
                transition={transition}
              >
                <Sprite
                  type="pokemon"
                  filename={fusion.head.pokedex_id}
                  href={hasFocus ? getDaenaLink(fusion.head.pokedex_id) : null}
                  alt={`Pokemon sprite of ${fusion.head.name}`}
                />
              </motion.div>
            </div>
            <div className={styles.parent}>
              <span className={styles.parentName}>{t("Body")}</span>
              <motion.div
                style={{ width: pokemonSize, height: pokemonSize }}
                animate={{
                  width: pokemonSize,
                  height: pokemonSize,
                }}
                transition={transition}
              >
                <Sprite
                  type="pokemon"
                  filename={fusion.body.pokedex_id}
                  href={hasFocus ? getDaenaLink(fusion.body.pokedex_id) : null}
                  alt={`Pokemon sprite of ${fusion.body.name}`}
                />
              </motion.div>
            </div>
          </div>
          <p className={styles.credit}>
            {t("Art by", { creator: fusion.creators.map((creator) => creator.name).join(" & ") })}
          </p>
          {renderReferences(fusion.references)}
        </div>
        <motion.div
          style={{ width: backgroundWidth, height: backgroundHeight }}
          animate={{ width: backgroundWidth, height: backgroundHeight }}
          transition={transition}
          className={styles.background}
        />
      </motion.div>
    </>
  );
}

export default VoteCard;
