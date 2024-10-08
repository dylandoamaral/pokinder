import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { refuseReferenceProposal } from "../../api/pokinder";

import { getDaenaLink } from "../../utils/website";

import Button from "../../component/atom/Button/Button";
import Input from "../../component/atom/Input/Input";
import Modal from "../../component/atom/Modal/Modal";
import Panel from "../../component/atom/Panel/Panel";
import Sprite from "../../component/atom/Sprite/Sprite";
import Title from "../../component/atom/Title/Title";

import styles from "./AdminRefuseReferenceProposalModal.module.css";

function AdminRefuseReferenceProposalModal({ isVisible, onClose, referenceProposal }) {
  const { t } = useTranslation();

  const [reason, setReason] = useState(undefined);

  const proposeButtonDisabled = reason === undefined;

  if (referenceProposal === undefined) return <></>;

  return (
    <Modal className={styles.container} isVisible={isVisible} onClose={onClose}>
      <Title title={t("The proposal is not appropriated ?")} textAlign="left" />
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
      <Panel title={t("Reason")}>
        <Input onChange={setReason} />
      </Panel>
      <div className={styles.buttons}>
        <Button title={t("Cancel")} variant="text" foreground onClick={onClose} />
        <Button
          title={t("Refuse proposal")}
          foreground
          disabled={proposeButtonDisabled}
          onClick={() => {
            refuseReferenceProposal(referenceProposal.id, reason);
            setReason(undefined);
            toast.success("Proposal refused successfully !");
            onClose();
          }}
        />
      </div>
    </Modal>
  );
}

export default AdminRefuseReferenceProposalModal;
