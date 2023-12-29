import { FaCheck, FaTimes } from "react-icons/fa";
import { FaStar } from "react-icons/fa6";

import styles from "./PokedexCardButton.module.css";

function PokedexCardButton({ variant, onClick, filled = false }) {
  const variants = {
    downvote: {
      icon: <FaTimes />,
      style: styles.downvote,
    },
    favorite: {
      icon: <FaStar />,
      style: styles.favorite,
    },
    upvote: {
      icon: <FaCheck />,
      style: styles.upvote,
    },
  };

  const configuration = variants[variant];
  const className = filled ? configuration.style : styles.empty;

  return (
    <button className={`${styles.container} ${className}`} onClick={onClick}>
      {filled ? configuration.icon : null}
    </button>
  );
}

export default PokedexCardButton;
