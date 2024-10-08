import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { addReferenceFamily } from "../../api/pokinder";

import Button from "../../component/atom/Button/Button";
import Input from "../../component/atom/Input/Input";
import Modal from "../../component/atom/Modal/Modal";
import Panel from "../../component/atom/Panel/Panel";
import Title from "../../component/atom/Title/Title";

import styles from "./AdminCreateReferenceFamilyModal.module.css";

function AdminCreateReferenceFamilyModal({ isVisible, onClose }) {
  const { t } = useTranslation();

  const [name, setName] = useState(undefined);

  const createButtonDisabled = name === undefined;

  return (
    <Modal className={styles.container} isVisible={isVisible} onClose={onClose}>
      <Title title={t("A new reference family has been discovered ?")} textAlign="left" />
      <Panel title={t("Name")}>
        <Input onChange={setName} />
      </Panel>
      <div className={styles.buttons}>
        <Button
          title={t("Cancel")}
          variant="text"
          foreground
          onClick={() => {
            setName(undefined);
            onClose();
          }}
        />
        <Button
          title={t("Create reference family")}
          foreground
          disabled={createButtonDisabled}
          onClick={() => {
            addReferenceFamily(name);
            setName(undefined);
            toast.success("Reference family created successfully !");
            onClose();
          }}
        />
      </div>
    </Modal>
  );
}

export default AdminCreateReferenceFamilyModal;
