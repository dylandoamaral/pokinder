import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { addReference, listReferenceFamilies } from "../../api/pokinder";

import Button from "../../component/atom/Button/Button";
import Input from "../../component/atom/Input/Input";
import Modal from "../../component/atom/Modal/Modal";
import Panel from "../../component/atom/Panel/Panel";
import FutureSelect from "../../component/atom/Select/FutureSelect";
import Title from "../../component/atom/Title/Title";

import styles from "./AdminCreateReferenceModal.module.css";

function AdminCreateReferenceModal({ isVisible, onClose }) {
  const { t } = useTranslation();

  const [name, setName] = useState(undefined);
  const [source, setSource] = useState(undefined);
  const [family, setFamily] = useState(undefined);

  function familyToSelect(family) {
    return { value: family.id, label: family.name };
  }

  const createButtonDisabled = name === undefined || source === undefined || family === undefined;

  return (
    <Modal className={styles.container} isVisible={isVisible} onClose={onClose}>
      <Title title={t("Reference creation title")} textAlign="left" />
      <Panel title={t("Name")}>
        <Input onChange={setName} />
      </Panel>
      <Panel title={t("Source")}>
        <Input onChange={setSource} />
      </Panel>
      <Panel title={t("Family")}>
        <FutureSelect
          futureValues={listReferenceFamilies}
          valueToOption={familyToSelect}
          onChange={setFamily}
        />
      </Panel>
      <div className={styles.buttons}>
        <Button
          title={t("Cancel")}
          variant="text"
          foreground
          onClick={() => {
            setName(undefined);
            setSource(undefined);
            setFamily(undefined);
            onClose();
          }}
        />
        <Button
          title={t("Create a reference")}
          foreground
          disabled={createButtonDisabled}
          onClick={() => {
            addReference(name, source, family.value);
            setName(undefined);
            setSource(undefined);
            setFamily(undefined);
            toast.success(t("Reference creation success"));
            onClose();
          }}
        />
      </div>
    </Modal>
  );
}

export default AdminCreateReferenceModal;
