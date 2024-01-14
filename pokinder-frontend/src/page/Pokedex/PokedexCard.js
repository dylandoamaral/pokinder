import moment from "moment";
import "moment/locale/fr";
import { memo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "react-query";

import { useAfterEffect } from "../../hook/useAfterEffect";

import { addVote } from "../../api/pokinder";

import Sprite from "../../component/atom/Sprite/Sprite";

import styles from "./PokedexCard.module.css";
import PokedexCardButton from "./PokedexCardButton";

const PokedexVote = memo(function PokedexVote({ vote }) {
  const { t, i18n } = useTranslation();

  const [currentVoteType, setCurrentVoteType] = useState(vote.vote_type);

  const { mutate } = useMutation(async () => {
    addVote(vote.fusion.id, currentVoteType);
  });

  useAfterEffect(() => {
    mutate();
  }, [currentVoteType, mutate]);

  function storeVote(newVoteType) {
    if (currentVoteType !== newVoteType) {
      setCurrentVoteType(newVoteType);
    }
  }

  const drawPokedexCardButtons = () => {
    return (
      <div className={styles.buttons}>
        <PokedexCardButton
          variant="downvote"
          filled={currentVoteType === 1}
          onClick={() => storeVote(1)}
        />
        <PokedexCardButton
          variant="favorite"
          filled={currentVoteType === 2}
          onClick={() => storeVote(2)}
        />
        <PokedexCardButton
          variant="upvote"
          filled={currentVoteType === 0}
          onClick={() => storeVote(0)}
        />
      </div>
    );
  };

  return (
    <div className={styles.container} key={vote.fusion.path}>
      <div className={styles.content}>
        <Sprite className={styles.sprite} filename={vote.fusion.id} path={vote.fusion.path} size={144} type="fusion" />
        <div className={styles.panel}>
          {drawPokedexCardButtons()}
          <span className={styles.moment}>
            {t("Voted")} {moment(vote.created_at).locale(i18n.language).fromNow()}
          </span>
        </div>
        <div className={styles.background}></div>
      </div>
    </div>
  );
});

export default PokedexVote;
