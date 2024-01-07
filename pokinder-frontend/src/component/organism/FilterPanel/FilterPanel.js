import { useTranslation } from "react-i18next";
import { FaFilter } from "react-icons/fa6";

import useToggle from "../../../hook/useToggle";

import FilterChoices from "../../molecule/FilterChoices/FilterChoices";
import FilterModal from "./FilterModal";
import styles from "./FilterPanel.module.css";

function FilterPanel({ defaultFilters, currentFilters, setFilters }) {
  const { t } = useTranslation();
  const [showModal, toggleModal] = useToggle();

  return (
    <>
      <div className={styles.container}>
        <FilterChoices
          defaultFilters={defaultFilters}
          currentFilters={currentFilters}
          setFilters={setFilters}
        />
        <button className={styles.button} onClick={toggleModal}>
          <FaFilter className={styles.icon} />
          {t("Filter")}
        </button>
      </div>
      <FilterModal
        defaultFilters={defaultFilters}
        currentFilters={currentFilters}
        setFilters={setFilters}
        isVisible={showModal}
        onClose={toggleModal}
      />
    </>
  );
}

export default FilterPanel;
