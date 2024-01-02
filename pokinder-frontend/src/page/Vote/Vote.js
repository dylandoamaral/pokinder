import { motion } from "framer-motion";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery } from "react-query";

import { addVote, drawFusions } from "../../api/pokinder";

import VoteButton from "../../component/atom/VoteButton/VoteButton";
import Page from "../../component/organism/Page/Page";

import LoadingVoteCard from "./LoadingVoteCard";
import styles from "./Vote.module.css";
import VoteCard from "./VoteCard";

function Vote() {
  // The number of fusions fetched from the API.
  const AMOUNT_FETCH_NEW_FUSIONS = 30;
  // The number of fusions left before trigerring the API.
  const TRIGGER_FETCH_NEW_FUSIONS = 20;
  // The number of fusions rendered.
  const CACHED_FUSIONS = 5;
  // The duration of the swipe animation.
  const SWIPE_DURATION = 0.2;
  // The space between two wards.
  const CARD_SPACE = 290 + 16;
  // The space between two wards.
  const MILLISECONDS_BETWEEN_VOTES = 250;

  const { t } = useTranslation();

  const [lastVoteTime, setLastVoteTime] = useState(new Date().getTime());
  const [voteType, setVoteType] = useState(0);
  const [absoluteIndex, setAbsoluteIndex] = useState(CACHED_FUSIONS - 1);
  const [relativeIndex, setRelativeIndex] = useState(0);
  const [carouselFusions, setCarouselFusions] = useState([]);
  const [fusions, setFusions] = useState([]);

  // Init the carousel when the component is first rendered.
  function initCarouselFusions(fusions) {
    var queue = new Array(CACHED_FUSIONS - 1).fill({});

    for (const fusion of fusions.slice(0, CACHED_FUSIONS)) {
      queue.push(fusion);
    }

    return queue;
  }

  // Call the Pokinder API to fecth more fusions.
  async function drawNewFusions() {
    const data = await drawFusions(AMOUNT_FETCH_NEW_FUSIONS);
    const newFusions = data || [];

    if (newFusions.length > 0) {
      // First time, we fill the carousel with both data and empty objects.
      if (carouselFusions.length === 0) {
        const newCarouselFusions = initCarouselFusions(newFusions);
        setCarouselFusions(newCarouselFusions);
        setFusions(newFusions.slice(CACHED_FUSIONS, newFusions.length));
      }
      // We fetched new sprite, should fill the fusions but not the carousel.
      else {
        // We need to slice the first fusion moved to the carousel in onVote.
        setFusions([...fusions.slice(1), ...newFusions]);
      }
    }
  }

  // Apply vote when animation is complete.
  async function onVote() {
    const previousFusion = carouselFusions[absoluteIndex - 1 - relativeIndex];

    setCarouselFusions([...carouselFusions.slice(1), fusions[0]]);
    setRelativeIndex(relativeIndex + 1);

    storeVote({ fusionId: previousFusion.id, voteType: voteType });

    if (fusions.length < TRIGGER_FETCH_NEW_FUSIONS && !isFetching) {
      await refetchFusions();
    } else {
      setFusions(fusions.slice(1));
    }
  }

  // Swipe the card and select the correct vote type.
  function vote(newVoteType) {
    const now = new Date().getTime();
    if (now - lastVoteTime > MILLISECONDS_BETWEEN_VOTES) {
      setLastVoteTime(new Date().getTime());
      setVoteType(newVoteType);
      setAbsoluteIndex(absoluteIndex + 1);
      return true;
    } else {
      return false;
    }
  }

  const {
    refetch: refetchFusions,
    isFetching,
    isLoading,
    isError,
  } = useQuery(["fusions"], drawNewFusions, { refetchOnWindowFocus: false });

  const { mutate: storeVote } = useMutation(async ({ fusionId, voteType }) => {
    addVote(fusionId, voteType);
  });

  const transition = {
    duration: SWIPE_DURATION,
    ease: "easeInOut",
  };

  // Animated offset to move cards.
  const absoluteOffset = (absoluteIndex - CACHED_FUSIONS + 1) * CARD_SPACE;
  // Non animated offest to move cards back during unstacking.
  const relativeOffset = -1 * relativeIndex * CARD_SPACE;

  function renderContent() {
    if (isError) {
      return <p>{t("The API is down for the moment, sorry for the inconvenience.")}</p>;
    }

    if (isLoading) {
      return (
        <div className={`${styles.container} ${styles.loading}`}>
          <div className={styles.votes}>
            <LoadingVoteCard hidden />
            <LoadingVoteCard hidden />
            <LoadingVoteCard hidden />
            <LoadingVoteCard hasFocus />
            <LoadingVoteCard />
            <LoadingVoteCard />
            <LoadingVoteCard />
          </div>
          <div className={styles.buttons}>
            <VoteButton variant="downvote" disabled />
            <VoteButton variant="favorite" disabled />
            <VoteButton variant="upvote" disabled />
          </div>
        </div>
      );
    }

    return (
      <div className={styles.container}>
        <div style={{ transform: `translateX(${relativeOffset}px)` }}>
          <motion.div
            initial={false}
            animate={{ x: absoluteOffset }}
            transition={transition}
            className={styles.votes}
            onAnimationComplete={onVote}
          >
            {carouselFusions.map((fusion, key) => (
              <VoteCard
                key={fusion.path || key}
                fusion={fusion}
                transition={transition}
                hasFocus={fusion.path === carouselFusions[absoluteIndex - relativeIndex]?.path}
              />
            ))}
          </motion.div>
        </div>
        <div className={styles.buttons}>
          <VoteButton variant="downvote" onClick={() => vote(1)} />
          <VoteButton variant="favorite" onClick={() => vote(2)} />
          <VoteButton variant="upvote" onClick={() => vote(0)} />
        </div>
      </div>
    );
  }

  return <Page>{renderContent()}</Page>;
}

export default Vote;
