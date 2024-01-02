import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

import styles from "./FilterChoice.module.css";

function FilterChoice({ category, operator, value, onClick }) {
  const { t } = useTranslation();

  return (
    <motion.button
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.15 }}
      className={styles.container}
      onClick={onClick}
    >
      {t(category)} {operator} {t(value)} X
    </motion.button>
  );
}

export default FilterChoice;
