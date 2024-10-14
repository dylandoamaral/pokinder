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

function AdminAcceptReferenceProposalModal({
  isVisible,
  onClose,
  referenceProposal,
  refreshProposals,
}) {
  const { t } = useTranslation();

  const defaultForm = {
    family: undefined,
    reference: undefined
  }

  const [form, setForm] = useState(defaultForm)

  const setFamily = (family) => setForm({ ...form, family: family })
  const setReference = (reference) => setForm({ ...form, reference: reference })


  function familyToSelect(family) {
    return { value: family.id, label: family.name };
  }

  function referenceToSelect(reference) {
    return { value: reference.id, label: reference.name };
  }

  const proposeButtonDisabled = form.family === undefined && form.reference === undefined;

  if (referenceProposal === undefined) return <></>;

  return (
    <Modal className={styles.container} isVisible={isVisible} onClose={onClose}>
      <Title title={t("Reference validation title")} textAlign="left" />
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
            form.family === undefined ? [] : await listReferences(form.family.value, undefined)
          }
          valueToOption={referenceToSelect}
          onChange={setReference}
          updateKey={form.family} // NOTE: trick to force rerendering when family change.
        />
      </Panel>
      <div className={styles.buttons}>
        <Button
          title={t("Cancel")}
          variant="text"
          foreground
          onClick={() => {
            setForm(defaultForm);
            onClose();
          }}
        />
        <Button
          title={t("Reference validation action")}
          foreground
          disabled={proposeButtonDisabled}
          onClick={async () => {
            await acceptReferenceProposal(
              referenceProposal.fusion.id,
              form.reference.value,
              referenceProposal.id,
            );
            setForm(defaultForm);
            toast.success(t("Reference validation success"));
            refreshProposals();
            onClose();
          }}
        />
      </div>
    </Modal>
  );
}

export default AdminAcceptReferenceProposalModal;
