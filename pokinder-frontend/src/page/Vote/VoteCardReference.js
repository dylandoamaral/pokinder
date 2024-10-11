import useHover from "../../hook/useHover";

import styles from "./VoteCardReference.module.css";

function VoteCardReference({ reference }) {
  const [isHover, events] = useHover();

  return (
    <a
      style={{ textDecoration: "none" }}
      href={reference.source}
      target="_blank"
      rel="noopener noreferrer"
      className={isHover ? styles.referenceHover : styles.reference}
      {...events}
    >
      <span className={styles.referenceOtherLetters}>
        {isHover ? `${reference.family.name} - ${reference.name}` : reference.family.name[0]}
      </span>
    </a>
  );
}

export default VoteCardReference;
