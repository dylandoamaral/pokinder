import { memo } from "react";

import styles from "./LoadingPokedexCard.module.css";

const LoadingPokedexCard = memo(function LoadingPokedexCard() {
  const drawPokedexCardButtons = () => {
    return (
      <div className={styles.buttons}>
        <div className={styles.button} />
        <div className={styles.button} />
        <div className={styles.button} />
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.sprite}>
          <div />
        </div>
        <div className={styles.panel}>
          {drawPokedexCardButtons()}
          <span className={styles.moment} />
        </div>
        <div className={styles.background}></div>
      </div>
    </div>
  );
});

export default LoadingPokedexCard;
