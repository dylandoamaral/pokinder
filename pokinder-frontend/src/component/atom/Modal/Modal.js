import styles from "./Modal.module.css";

function Modal({ children, isVisible, onClose, className }) {
  if (!isVisible) return;

  return (
    <div className={styles.container} onClick={onClose}>
      <div className={`${styles.modal} ${className}`} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export default Modal;
