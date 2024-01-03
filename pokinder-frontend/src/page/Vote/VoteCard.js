import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { getName, getTypes } from "../../utils/pokemon";

import Sprite from "../../component/atom/Sprite/Sprite";
import Type from "../../component/atom/Type/Type";

import styles from "./VoteCard.module.css";

function VoteCard({ fusion, transition, hasFocus = false }) {
  const { t } = useTranslation();

  const MOBILE_RATIO = 0.75;

  const [isMobile, setIsMobile] = useState(window.innerWidth < 400 || window.innerHeight < 850);

  const defaultOpacity = hasFocus ? 1 : 0.3;
  // The mobile moving part is images taking 432px.
  const defaultHeight = isMobile ? 617 - 432 + 432 * MOBILE_RATIO : 617;

  const defaultBackgroundWidthDesktop = hasFocus ? 380 : 290;
  const defaultBackgroundWidthMobile = defaultBackgroundWidthDesktop - 40;
  const defaultBackgroundWidth = isMobile
    ? defaultBackgroundWidthMobile
    : defaultBackgroundWidthDesktop;

  const defaultBackroundHeightDesktop = hasFocus ? 490 : 370;
  const defaultBackroundHeightMobile = defaultBackroundHeightDesktop * MOBILE_RATIO;
  const defaultBackroundHeight = isMobile
    ? defaultBackroundHeightMobile
    : defaultBackroundHeightDesktop;

  const defaultFusionSizeDesktop = hasFocus ? 288 : 216;
  const defaultFusionSizeMobile = defaultFusionSizeDesktop * MOBILE_RATIO;
  const defaultFusionSize = isMobile ? defaultFusionSizeMobile : defaultFusionSizeDesktop;

  const defaultPokemonSizeDesktop = hasFocus ? 144 : 72;
  const defaultPokemonSizeMobile = defaultPokemonSizeDesktop * MOBILE_RATIO;
  const defaultPokemonSize = isMobile ? defaultPokemonSizeMobile : defaultPokemonSizeDesktop;

  const [opacity, setOpacity] = useState(defaultOpacity);
  const [backgroundWidth, setBackgroundWidth] = useState(defaultBackgroundWidth);
  const [width, setWidth] = useState(defaultBackgroundWidthDesktop);
  const [backgroundHeight, setBackgroundHeight] = useState(defaultBackroundHeight);
  const [height, setHeight] = useState(defaultHeight);
  const [fusionSize, setFusionSize] = useState(defaultFusionSize);
  const [pokemonSize, setPokemonSize] = useState(defaultPokemonSize);

  useEffect(() => {
    setOpacity(defaultOpacity);
    setHeight(defaultHeight);
    setBackgroundWidth(defaultBackgroundWidth);
    setWidth(defaultBackgroundWidthDesktop);
    setBackgroundHeight(defaultBackroundHeight);
    setFusionSize(defaultFusionSize);
    setPokemonSize(defaultPokemonSize);
    setPokemonSize(defaultPokemonSize);
  }, [
    hasFocus,
    defaultOpacity,
    defaultHeight,
    defaultBackgroundWidth,
    defaultBackgroundWidthDesktop,
    defaultBackroundHeight,
    defaultFusionSize,
    defaultPokemonSize,
  ]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 400 || window.innerHeight < 850);
    };

    window.addEventListener("resize", handleResize);
  });

  const cardWidth = hasFocus ? 380 : 290;

  if (Object.keys(fusion).length === 0) {
    return <div style={{ width: cardWidth }} />;
  }

  return (
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
            path={fusion.path}
            alt={`Fusion sprite from ${fusion.body.name} and ${fusion.head.name}`}
          />
        </motion.div>
        <div className={styles.header}>
          <div className={styles.title}>
            <span className={styles.name}>
              {getName(
                fusion.head.name,
                fusion.head.name_separator_index,
                fusion.body.name,
                fusion.body.name_separator_index,
              )}
            </span>
            <span className={styles.path}>#{fusion.path}</span>
          </div>
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
                path={fusion.head.pokedex_id}
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
                path={fusion.body.pokedex_id}
                alt={`Pokemon sprite of ${fusion.body.name}`}
              />
            </motion.div>
          </div>
        </div>
        <p className={styles.credit}>{t("Art by", { artist: fusion.creator.name })}</p>
      </div>
      <motion.div
        style={{ width: backgroundWidth, height: backgroundHeight }}
        animate={{ width: backgroundWidth, height: backgroundHeight }}
        transition={transition}
        className={styles.background}
      />
    </motion.div>
  );
}

export default VoteCard;
