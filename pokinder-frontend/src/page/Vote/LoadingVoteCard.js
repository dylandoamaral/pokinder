import { useEffect, useState } from "react";

import styles from "./LoadingVoteCard.module.css";

function LoadingVoteCard({ hasFocus = false, hidden = false }) {
  const MOBILE_RATIO = 0.75;

  const [isMobile, setIsMobile] = useState(window.innerWidth < 400 || window.innerHeight < 850);

  const defaultOpacity = hasFocus ? 1 : hidden ? 0 : 0.3;
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

  return (
    <div style={{ width: width, height: height, opacity: opacity }} className={styles.container}>
      <div className={styles.content}>
        <div className={styles.image} style={{ width: fusionSize, height: fusionSize }}>
          <div />
        </div>
        <div className={styles.header}>
          <div className={styles.title}>
            <div className={styles.name} />
            <div className={styles.path} />
          </div>
          <div className={styles.types}>
            <div className={styles.type} />
            <div className={styles.type} />
          </div>
        </div>
        <div className={styles.parents}>
          <div className={styles.parent}>
            <div className={styles.parentName} />
            <div className={styles.image} style={{ width: pokemonSize, height: pokemonSize }}>
              <div />
            </div>
          </div>
          <div className={styles.parent}>
            <div className={styles.parentName} />
            <div className={styles.image} style={{ width: pokemonSize, height: pokemonSize }}>
              <div />
            </div>
          </div>
        </div>
        <div className={styles.credit} />
      </div>
      <div
        style={{ width: backgroundWidth, height: backgroundHeight }}
        className={styles.background}
      />
    </div>
  );
}

export default LoadingVoteCard;
