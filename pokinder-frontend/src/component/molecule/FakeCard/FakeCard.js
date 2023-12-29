import React from "react";

import styles from "./FakeCard.module.css";

function FakeCard() {
  return (
    <div className={styles.container}>
      <div className={styles.sprite}></div>
      <div>
        <div className={styles.header}>
          <div className={styles.name}></div>
          <div className={styles.path}></div>
        </div>
        <div className={styles.types}>
          <div className={styles.type}></div>
          <div className={styles.type}></div>
        </div>
        <div className={styles.body}>
          <div className={styles.parent}>
            <div className={styles.parentName}></div>
            <div className={styles.parentSprite}></div>
          </div>
          <div className={styles.parent}>
            <div className={styles.parentName}></div>
            <div className={styles.parentSprite}></div>
          </div>
        </div>
        <p className={styles.credit}></p>
      </div>
    </div>
  );
}

export default FakeCard;
