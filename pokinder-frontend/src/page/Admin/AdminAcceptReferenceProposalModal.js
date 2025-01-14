import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "react-query";
import { toast } from "react-toastify";

import {
  acceptReferenceProposal,
  acceptReferenceProposalAndCreateReference,
  acceptReferenceProposalAndCreateReferenceAndFamily,
  listReferenceFamilies,
  listReferences,
} from "../../api/pokinder";

import { getDaenaLink } from "../../utils/website";

import Button, {
  VARIANT_FILLED_FOREGROUND,
  VARIANT_TEXT,
} from "../../component/atom/Button/Button";
import Input from "../../component/atom/Input/Input";
import Modal from "../../component/atom/Modal/Modal";
import Panel from "../../component/atom/Panel/Panel";
import FutureCreatableSelect from "../../component/atom/Select/FutureCreatableSelect";
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
    source: undefined,
    reference: undefined,
  };

  const [form, setForm] = useState(defaultForm);

  const setFamily = (family) =>
    setForm({ ...form, family: family, reference: undefined, source: undefined });
  const setReference = (reference) => setForm({ ...form, reference: reference, source: undefined });
  const setSource = (source) => setForm({ ...form, source: source });

  const { mutate: submit } = useMutation(
    async () => {
      if (form.family.__isNew__) {
        await acceptReferenceProposalAndCreateReferenceAndFamily(
          referenceProposal.fusion.id,
          form.family.value, // NOTE: this is a label.
          form.reference.value, // NOTE: this is a label.
          form.source,
          referenceProposal.id,
        );
      } else if (form.reference.__isNew__) {
        // NOTE: the family is already existing but we add a new reference.
        await acceptReferenceProposalAndCreateReference(
          referenceProposal.fusion.id,
          form.family.value, // NOTE: this is an id.
          form.reference.value, // NOTE: this is a label.
          form.source,
          referenceProposal.id,
        );
      } else {
        await acceptReferenceProposal(
          referenceProposal.fusion.id,
          form.reference.value, // NOTE: this is an id.
          referenceProposal.id,
        );
      }
    },
    {
      onSuccess: () => {
        setForm(defaultForm);
        toast.success(t("Reference validation success"));
        refreshProposals();
        onClose();
      },
    },
  );

  function renderSource() {
    if (form.reference === undefined) return <></>;
    if (form.reference.__isNew__ !== true) return <></>;

    return (
      <Panel title={t("Source")}>
        <Input onChange={setSource} />
      </Panel>
    );
  }

  function renderExistingReferences() {
    if (referenceProposal.fusion.references.length === 0) return <></>;

    return (
      <Panel title={t("Existing references")}>
        <ul>
          {referenceProposal.fusion.references.map((reference, key) => (
            <li key={key}>{`${reference.family.name} - ${reference.name}`}</li>
          ))}
        </ul>
      </Panel>
    );
  }

  function optionify(value) {
    return { value: value.id, label: value.name };
  }

  function isActionDisabled() {
    if (form.family === undefined) return true;
    if (form.reference === undefined) return true;
    if (form.reference.__isNew__ && form.source === undefined) return true;

    return false;
  }

  async function fetchReferences() {
    if (form.family === undefined) return [];
    if (form.family.__isNew__ === true) return [];

    return await listReferences(form.family.value, undefined);
  }

  const proposeButtonDisabled = isActionDisabled();

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
      {renderExistingReferences()}
      <Panel title={t("Matching reference family")}>
        <FutureCreatableSelect
          futureValues={listReferenceFamilies}
          valueToOption={optionify}
          onChange={setFamily}
        />
      </Panel>
      <Panel title={t("Matching reference")}>
        <FutureCreatableSelect
          futureValues={fetchReferences}
          valueToOption={optionify}
          onChange={setReference}
          updateKey={form.family} // NOTE: trick to force rerendering when family change.
        />
      </Panel>
      {renderSource()}
      <div className={styles.buttons}>
        <Button
          title={t("Cancel")}
          variant={VARIANT_TEXT}
          onClick={() => {
            setForm(defaultForm);
            onClose();
          }}
        />
        <Button
          title={t("Reference validation action")}
          variant={VARIANT_FILLED_FOREGROUND}
          disabled={proposeButtonDisabled}
          onClick={submit}
        />
      </div>
    </Modal>
  );
}

export default AdminAcceptReferenceProposalModal;
