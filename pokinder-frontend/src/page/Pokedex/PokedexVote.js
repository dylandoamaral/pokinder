import IconLike from "../../component/atom/icon/IconLike";
import IconDislike from "../../component/atom/icon/IconDislike";
import IconStar from "../../component/atom/icon/IconStar";
import Sprite from "../../component/atom/Sprite/Sprite";
import { addVote } from "../../api/pokinder";
import moment from "moment";
import { getDaenaLink } from "../../utils/website";

import styles from "./PokedexVote.module.css";
import { useState, memo } from "react";
import { useMutation } from "react-query";

import { useAfterEffect } from "../../hook/useAfterEffect";
import { useTranslation } from "react-i18next";

import "moment/locale/fr";

const PokedexVote = memo(function PokedexVote({ vote }) {
  const { t, i18n } = useTranslation();

  const [currentVoteType, setCurrentVoteType] = useState(vote.vote_type);

  const { mutate } = useMutation(async () => {
    addVote(vote.fusion.id, currentVoteType);
  });

  useAfterEffect(() => {
    mutate();
  }, [currentVoteType, mutate]);

  const drawVoteType = (voteType) => {
    if (voteType === 0)
      return (
        <div className={styles.buttonContainer}>
          <div
            className={styles.buttonDisable}
            onClick={() => setCurrentVoteType(1)}
          />
          <div
            className={styles.buttonDisable}
            onClick={() => setCurrentVoteType(2)}
          />
          <IconLike className={styles.buttonLike} />
        </div>
      );
    else if (voteType === 1)
      return (
        <div className={styles.buttonContainer}>
          <IconDislike className={styles.buttonDislike} />
          <div
            className={styles.buttonDisable}
            onClick={() => setCurrentVoteType(2)}
          />
          <div
            className={styles.buttonDisable}
            onClick={() => setCurrentVoteType(0)}
          />
        </div>
      );
    else
      return (
        <div className={styles.buttonContainer}>
          <div
            className={styles.buttonDisable}
            onClick={() => setCurrentVoteType(1)}
          />
          <IconStar className={styles.buttonFavorite} />
          <div
            className={styles.buttonDisable}
            onClick={() => setCurrentVoteType(0)}
          />
        </div>
      );
  };

  return (
    <div className={styles.container} key={vote.fusion.path}>
      <a
        className={styles.link}
        href={getDaenaLink(vote.fusion.path)}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Sprite
          className={styles.sprite}
          path={vote.fusion.path}
          size={144}
          type="fusion"
        />
      </a>
      <div className={styles.panel}>
        {drawVoteType(currentVoteType)}
        <span className={styles.moment}>
          {t("Voted")} {moment(vote.created_at).locale(i18n.language).fromNow()}
        </span>
      </div>
    </div>
  );
});

export default PokedexVote;
