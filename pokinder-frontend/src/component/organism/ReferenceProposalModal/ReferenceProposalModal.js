import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "react-query";
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

  const defaultForm = {
    name: undefined,
    family: undefined,
  };

  const [form, setForm] = useState(defaultForm);

  const setName = (name) => setForm({ ...form, name: name });
  const setFamily = (family) => setForm({ ...form, family: family });

  const { mutate: submit } = useMutation(
    async () => {
      await addReferenceProposal(fusion.id, form.name, form.family);
    },
    {
      onSuccess: () => {
        toast.success(t("Reference proposal success"));
        setForm(defaultForm);
        onClose();
      },
    },
  );

  const proposeButtonDisabled = form.name === undefined || form.family === undefined;

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
          onClick={submit}
        />
      </div>
    </Modal>
  );
}

export default ReferenceProposalModal;
