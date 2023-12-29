import { motion } from "framer-motion";

import styles from "./FilterChoice.module.css";

function FilterChoice({ category, operator, value, onClick }) {
  return (
    <motion.button
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.15 }}
      className={styles.container}
      onClick={onClick}
    >
      {category} {operator} {value} X
    </motion.button>
  );
}

export default FilterChoice;
