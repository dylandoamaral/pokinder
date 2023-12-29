import styles from "./VoteButton.module.css";

import { motion, useAnimate } from "framer-motion";

import {
  FaRegSquareCaretLeft,
  FaRegSquareCaretUp,
  FaRegSquareCaretRight,
  FaStar,
} from "react-icons/fa6";

import { FaCheck, FaTimes } from "react-icons/fa";

import { useTranslation } from "react-i18next";
import useEventListener from "../../../hook/useEventListener";

function VoteButton({ variant, onClick }) {
  const { t } = useTranslation();
  const [scope, animate] = useAnimate();

  const variants = {
    downvote: {
      buttonIcon: <FaTimes className={styles.downvote} />,
      keyboardIcon: <FaRegSquareCaretLeft />,
      keyboardKey: "ArrowLeft",
    },
    favorite: {
      buttonIcon: <FaStar className={styles.favorite} />,
      keyboardIcon: <FaRegSquareCaretUp />,
      keyboardKey: "ArrowUp",
    },
    upvote: {
      buttonIcon: <FaCheck className={styles.upvote} />,
      keyboardIcon: <FaRegSquareCaretRight />,
      keyboardKey: "ArrowRight",
    },
  };

  const animations = {
    rest: { scale: 1, y: 0 },
    hover: { scale: 1.1, y: -4 },
    tap: { scale: 0.9, y: 4 },
  };

  const transition = { duration: 0.15 };

  const configuration = variants[variant];

  useEventListener("keydown", async ({ key }) => {
    if (key === configuration.keyboardKey) {
      const voted = onClick();

      if (voted) {
        await animate(scope.current, animations.tap, transition);
        await animate(scope.current, animations.rest, transition);
      }
    }
  });

  return (
    <div className={styles.container}>
      <motion.button
        ref={scope}
        variants={animations}
        initial="rest"
        whileTap="tap"
        whileHover="hover"
        transition={transition}
        className={styles.button}
        onClick={onClick}
      >
        {configuration.buttonIcon}
      </motion.button>
      <div className={styles.information}>
        <span className={styles.or}>{t("Or")} </span>
        {configuration.keyboardIcon}
      </div>
    </div>
  );
}

export default VoteButton;
