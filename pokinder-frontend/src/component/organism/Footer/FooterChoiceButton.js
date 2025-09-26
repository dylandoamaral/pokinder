import Popup from "reactjs-popup";

import FooterButton from "./FooterButton";
import styles from "./FooterChoiceButton.module.css";

function FooterChoiceButton({ children, name, choices, current, onClick, show = true }) {
  return (
    <Popup
      trigger={
        <FooterButton name={name} show={show}>
          {children}
        </FooterButton>
      }
      closeOnDocumentClick
      position="top right"
    >
      <div className={styles.menu}>
        {choices.map((choice, index) => (
          <div
            key={index}
            className={`${styles.item} ${choice === current ? styles.selected : ""}`}
            onClick={() => onClick(choice)}
          >
            {choice}
          </div>
        ))}
      </div>
    </Popup>
  );
}

export default FooterChoiceButton;
