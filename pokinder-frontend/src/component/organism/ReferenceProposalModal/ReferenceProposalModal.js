import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "react-query";
import { toast } from "react-toastify";

import { addReferenceProposal } from "../../../api/pokinder";

import { levenshtein } from "../../../utils/string";
import { getDaenaLink } from "../../../utils/website";

import Button, { VARIANT_FILLED_FOREGROUND, VARIANT_TEXT } from "../../atom/Button/Button";
import Heading from "../../atom/Heading/Heading";
import Input from "../../atom/Input/Input";
import Modal from "../../atom/Modal/Modal";
import Panel from "../../atom/Panel/Panel";
import Sprite from "../../atom/Sprite/Sprite";
import styles from "./ReferenceProposalModal.module.css";

function ReferenceProposalModal({ isVisible, onClose, fusion }) {
  const { t } = useTranslation();

  const defaultForm = {
    family: undefined,
    name: undefined,
  };

  const [form, setForm] = useState(defaultForm);

  const setFamily = (family) => setForm({ ...form, family: family });
  const setName = (name) => setForm({ ...form, name: name });

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

  function isReferenceExists() {
    if (form.family === undefined) return false;
    if (form.name === undefined) return false;

    for (const reference of fusion.references) {
      const isSameFamily = levenshtein(reference.family.name, form.family) < 3;
      const isSameName = levenshtein(reference.name, form.name) < 3;
      if (isSameFamily && isSameName) {
        return true;
      }
    }

    return false;
  }

  function isActionDisabled() {
    if (form.family === undefined) return true;
    if (form.name === undefined) return true;

    return isReferenceExists();
  }

  function renderExistingReferences() {
    if (fusion.references.length === 0) return <></>;

    return (
      <Panel title={t("Existing references")}>
        <ul>
          {fusion.references.map((reference, key) => (
            <li key={key}>{`${reference.family.name} - ${reference.name}`}</li>
          ))}
        </ul>
      </Panel>
    );
  }

  function renderReferenceExists() {
    if (!isReferenceExists()) return <></>;

    return <div className={styles.warning}>{t("Reference proposal warning")}</div>;
  }

  const proposeButtonDisabled = isActionDisabled();

  return (
    <Modal className={styles.container} isVisible={isVisible} onClose={onClose}>
      <div>
        <Heading align="left">{t("Reference proposal title")}</Heading>
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
      {renderExistingReferences()}
      <Panel title={t("Name")}>
        <Input placeholder="Monkey D. Luffy" onChange={setName} />
      </Panel>
      <Panel title={t("Family")}>
        <Input placeholder="One Piece" onChange={setFamily} />
      </Panel>
      {renderReferenceExists()}
      <div className={styles.buttons}>
        <Button title={t("Cancel")} variant={VARIANT_TEXT} foreground onClick={onClose} />
        <Button
          title={t("Reference proposal action")}
          variant={VARIANT_FILLED_FOREGROUND}
          disabled={proposeButtonDisabled}
          onClick={submit}
        />
      </div>
    </Modal>
  );
}

export default ReferenceProposalModal;
