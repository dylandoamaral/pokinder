import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { addReferenceProposal } from "../../../api/pokinder";

import { getDaenaLink } from "../../../utils/website";

import Button from "../../atom/Button/Button";
import Input from "../../atom/Input/Input";
import Modal from "../../atom/Modal/Modal";
import Panel from "../../atom/Panel/Panel";
import Sprite from "../../atom/Sprite/Sprite";
import Title from "../../atom/Title/Title";
import styles from "./ReferenceProposalModal.module.css";

function ReferenceProposalModal({ isVisible, onClose, fusion }) {
  const { t } = useTranslation();

  const [name, setName] = useState(undefined);
  const [family, setFamily] = useState(undefined);

  const proposeButtonDisabled = name === undefined || family === undefined;

  return (
    <Modal className={styles.container} isVisible={isVisible} onClose={onClose}>
      <div>
        <Title title={t("Reference proposal title")} textAlign="left" />
        <p>{t("Reference proposal description")}</p>
      </div>
      <Panel title={t("Fusion")}>
        <Sprite
          className={styles.sprite}
          filename={fusion.id}
          href={getDaenaLink(fusion.path)}
          size={144}
          type="fusion"
          alt={`Fusion sprite ${fusion.body.name} and ${fusion.head.name}`}
        />
      </Panel>
      <Panel title={t("Name")}>
        <Input placeholder="Monkey D. Luffy" onChange={setName} />
      </Panel>
      <Panel title={t("Family")}>
        <Input placeholder="One Piece" onChange={setFamily} />
      </Panel>
      <div className={styles.buttons}>
        <Button title={t("Cancel")} variant="text" foreground onClick={onClose} />
        <Button
          title={t("Reference proposal action")}
          foreground
          disabled={proposeButtonDisabled}
          onClick={() => {
            addReferenceProposal(fusion.id, name, family);
            toast.success(t("Reference proposal success"));
            setName(undefined);
            setFamily(undefined);
            onClose();
          }}
        />
      </div>
    </Modal>
  );
}

export default ReferenceProposalModal;
