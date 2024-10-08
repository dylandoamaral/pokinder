import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { acceptReferenceProposal, listReferenceFamilies, listReferences } from "../../api/pokinder";

import { getDaenaLink } from "../../utils/website";

import Button from "../../component/atom/Button/Button";
import Modal from "../../component/atom/Modal/Modal";
import Panel from "../../component/atom/Panel/Panel";
import FutureSelect from "../../component/atom/Select/FutureSelect";
import Sprite from "../../component/atom/Sprite/Sprite";
import Title from "../../component/atom/Title/Title";

import styles from "./AdminAcceptReferenceProposalModal.module.css";

function AdminAcceptReferenceProposalModal({ isVisible, onClose, referenceProposal }) {
  const { t } = useTranslation();

  const [family, setFamily] = useState(undefined);
  const [reference, setReference] = useState(undefined);

  function familyToSelect(family) {
    return { value: family.id, label: family.name };
  }

  function referenceToSelect(reference) {
    return { value: reference.id, label: reference.name };
  }

  const proposeButtonDisabled = family === undefined && reference === undefined;

  if (referenceProposal === undefined) return <></>;

  return (
    <Modal className={styles.container} isVisible={isVisible} onClose={onClose}>
      <Title title={t("The proposal is relevant ?")} textAlign="left" />
      <Panel title={t("Fusion")}>
        <Sprite
          className={styles.sprite}
          filename={referenceProposal.fusion.id}
          href={getDaenaLink(referenceProposal.fusion.path)}
          size={144}
          type="fusion"
          alt={`Fusion sprite ${referenceProposal.fusion.path}`}
        />
      </Panel>
      <Panel title={t("Proposed reference family")}>
        <span>{referenceProposal.reference_family_name}</span>
      </Panel>
      <Panel title={t("Proposed reference")}>
        <span>{referenceProposal.reference_name}</span>
      </Panel>
      <Panel title={t("Matching reference family")}>
        <FutureSelect
          futureValues={listReferenceFamilies}
          valueToOption={familyToSelect}
          onChange={setFamily}
        />
      </Panel>
      <Panel title={t("Matching reference")}>
        <FutureSelect
          futureValues={async () =>
            family === undefined ? [] : await listReferences(family.value)
          }
          valueToOption={referenceToSelect}
          onChange={setReference}
          key={family} // NOTE: trick to force rerendering when family change.
        />
      </Panel>
      <div className={styles.buttons}>
        <Button
          title={t("Cancel")}
          variant="text"
          foreground
          onClick={() => {
            setFamily(undefined);
            setReference(undefined);
            onClose();
          }}
        />
        <Button
          title={t("Accept proposal")}
          foreground
          disabled={proposeButtonDisabled}
          onClick={() => {
            acceptReferenceProposal(
              referenceProposal.fusion.id,
              reference.value,
              referenceProposal.id,
            );
            setFamily(undefined);
            setReference(undefined);
            toast.success("Proposal accepted successfully !");
            onClose();
          }}
        />
      </div>
    </Modal>
  );
}

export default AdminAcceptReferenceProposalModal;
