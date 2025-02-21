import useToggle from "../../hook/useToggle";

import styles from "./SettingsPanel.module.css";

function SettingsPanel({ title, subtitleClose, subtitleOpen, action, children }) {
  const [isOpen, toggleOpen] = useToggle(false);

  return (
    <div className={styles.container}>
      <div className={styles.display}>
        <div className={styles.header}>
          <div className={styles.title}>{title}</div>
          <button className={styles.action} onClick={toggleOpen}>
            {action}
          </button>
        </div>
        <div className={styles.subtitle}>{isOpen ? subtitleOpen : subtitleClose}</div>
      </div>
      {isOpen && children}
    </div>
  );
}

export default SettingsPanel;
