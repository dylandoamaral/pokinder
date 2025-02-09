import { motion } from "motion/react";

import styles from "./Modal.module.css";

function Modal({ children, isVisible, onClose, className }) {
  if (!isVisible) return;

  return (
    <div className={styles.container} onClick={onClose}>
      <motion.div
        initial={{ y: -200, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, mass: 0.5 }}
        className={`${styles.modal} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </div>
  );
}

export default Modal;
