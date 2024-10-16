import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "react-query";
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

function AdminRefuseReferenceProposalModal({
  isVisible,
  onClose,
  referenceProposal,
  refreshProposals,
}) {
  const { t } = useTranslation();

  const [reason, setReason] = useState(undefined);

  const { mutate: submit } = useMutation(
    async () => {
      await refuseReferenceProposal(referenceProposal.id, reason);
    },
    {
      onSuccess: () => {
        setReason(undefined);
        toast.success(t("Reference cancellation success"));
        refreshProposals();
        onClose();
      },
    },
  );

  const proposeButtonDisabled = reason === undefined;

  if (referenceProposal === undefined) return <></>;

  return (
    <Modal className={styles.container} isVisible={isVisible} onClose={onClose}>
      <Title title={t("Reference cancellation title")} textAlign="left" />
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
      <Panel title={t("Existing references")}>
        <ul>
          {referenceProposal.fusion.references.map((reference, key) => (
            <li key={key}>{`${reference.family.name} - ${reference.name}`}</li>
          ))}
        </ul>
      </Panel>
      <Panel title={t("Reason")}>
        <Input onChange={setReason} />
      </Panel>
      <div className={styles.buttons}>
        <Button title={t("Cancel")} variant="text" foreground onClick={onClose} />
        <Button
          title={t("Reference cancellation action")}
          foreground
          disabled={proposeButtonDisabled}
          onClick={submit}
        />
      </div>
    </Modal>
  );
}

export default AdminRefuseReferenceProposalModal;
