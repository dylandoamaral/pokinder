import moment from "moment";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "react-query";

import { useAfterEffect } from "../../../hook/useAfterEffect";

import { addVote } from "../../../api/pokinder";

import ExploreCard from "../ExploreCard";
import styles from "./ExploreHistoryCard.module.css";
import ExploreHistoryCardButton from "./ExploreHistoryCardButton";

export default function ExploreHistoryCard({
  fusionId,
  fusionPath,
  fusionName,
  fusionVoteType,
  fusionVoteAt,
}) {
  const { t, i18n } = useTranslation();

  const [currentVoteType, setCurrentVoteType] = useState(fusionVoteType);

  const { mutate } = useMutation(async () => {
    addVote(fusionId, currentVoteType);
  });

  useAfterEffect(() => {
    mutate();
  }, [currentVoteType, mutate]);

  function storeVote(newVoteType) {
    if (currentVoteType === newVoteType) return;
    setCurrentVoteType(newVoteType);
  }

  return (
    <ExploreCard fusionId={fusionId} fusionPath={fusionPath} fusionName={fusionName}>
      <div className={styles.details}>
        <ExploreHistoryCardButton
          variant="downvote"
          filled={currentVoteType === 1}
          onClick={() => storeVote(1)}
        />
        <ExploreHistoryCardButton
          variant="favorite"
          filled={currentVoteType === 2}
          onClick={() => storeVote(2)}
        />
        <ExploreHistoryCardButton
          variant="upvote"
          filled={currentVoteType === 0}
          onClick={() => storeVote(0)}
        />
      </div>
      <div className={styles.credit}>
        {t("Voted")} {moment(fusionVoteAt).locale(i18n.language).fromNow()}
      </div>
    </ExploreCard>
  );
}
