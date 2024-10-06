import styles from "./ReferenceProposalModal.module.css";
import { useTranslation } from "react-i18next";
import Modal from "../../atom/Modal/Modal";

import Title from "../../atom/Title/Title";
import Sprite from "../../atom/Sprite/Sprite";
import { getDaenaLink } from "../../../utils/website";
import Button from "../../atom/Button/Button";
import Panel from "../../atom/Panel/Panel";
import Input from "../../atom/Input/Input";
import { useState } from "react";
import { addReferenceProposal } from "../../../api/pokinder";
import { toast } from "react-toastify";

function ReferenceProposalModal({ isVisible, onClose, fusion }) {
    const { t } = useTranslation();

    const [name, setName] = useState(undefined);
    const [family, setFamily] = useState(undefined);

    const proposeButtonDisabled = name === undefined || family === undefined

    return (
        <Modal className={styles.container} isVisible={isVisible} onClose={onClose}>
            <div>
                <Title title={t("What inspired this fusion ?")} textAlign="left" />
                <p>{t("Enhance our reference system by suggesting a reference for this fusion, enriching the community's knowledge base.")}</p>
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
                <Input
                    placeholder="Monkey D. Luffy"
                    onChange={setName}
                />
            </Panel>
            <Panel title={t("Family")}>
                <Input
                    placeholder="One Piece"
                    onChange={setFamily}
                />
            </Panel>
            <div className={styles.buttons}>
                <Button title={t("Cancel")} variant="text" foreground onClick={onClose} />
                <Button
                    title={t("Propose a reference")}
                    foreground
                    disabled={proposeButtonDisabled}
                    onClick={() => {
                        addReferenceProposal(fusion.id, name, family)
                        toast.success("Proposal sent successfully !")
                        setName(undefined)
                        setFamily(undefined)
                        onClose()
                    }}
                />
            </div>
        </Modal>
    )
}

export default ReferenceProposalModal