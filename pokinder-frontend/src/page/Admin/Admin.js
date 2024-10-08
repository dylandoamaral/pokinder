import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useInfiniteQuery } from "react-query";

import { listReferenceProposal } from "../../api/pokinder";

import Button from "../../component/atom/Button/Button";
import Sprite from "../../component/atom/Sprite/Sprite";
import Page from "../../component/organism/Page/Page";
import AdminRefuseReferenceProposalModal from "./AdminRefuseReferenceProposalModal";
import AdminCreateReferenceModal from "./AdminCreateReferenceModal";
import AdminCreateReferenceFamilyModal from "./AdminCreateReferenceFamilyModal";

import styles from "./Admin.module.css";
import { getDaenaLink } from "../../utils/website";
import useToggle from "../../hook/useToggle";
// Add "Create Reference Family button"
// Add "Create Reference button"
// Not appear when not correct user + not appear when no user logged
// Accept a proposal
// Update the table when refuse or accept

// https://stackoverflow.com/questions/73892333/react-table-v8-how-to-render-custom-cell-content

const REFERENCE_PROPOSAL_LIMIT = 20;

function Admin() {
  const { t } = useTranslation();

  const [showAdminRefuseReferenceProposalModal, toggleAdminRefuseReferenceProposalModal] = useToggle();
  const [showAdminCreateReferenceModal, toggleAdminCreateReferenceModal] = useToggle();
  const [showAdminCreateReferenceFamilyModal, toggleAdminCreateReferenceFamilyModal] = useToggle();

  const [focusedProposal, setFocusedProposal] = useState();

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper();

    return [
      columnHelper.accessor("fusion", {
        header: t("Fusion"),
        cell: (props) => (
          <div className={styles.rowSprite}>
            <Sprite
              filename={props.getValue().id}
              size={72}
              href={getDaenaLink(props.getValue().path)}
              type="fusion"
              alt={`Fusion sprite ${props.getValue().path}`}
            />
          </div>
        ),
      }),
      columnHelper.accessor("proposer.username", {
        header: t("Proposer"),
        cell: (props) => <div className={styles.rowText}>{props.getValue()}</div>,
      }),
      columnHelper.accessor("reference_name", {
        header: t("Reference"),
        cell: (props) => <div className={styles.rowText}>{props.getValue()}</div>,
      }),
      columnHelper.accessor("reference_family_name", {
        header: t("Reference family"),
        cell: (props) => <div className={styles.rowText}>{props.getValue()}</div>,
      }),
      columnHelper.display({
        header: t("Actions"),
        cell: (props) => (
          <div className={styles.rowButtons}>
            <Button title={t("Accept")} foreground variant="filled" onClick={() => {
              setFocusedProposal(props.getValue())
              toggleAdminRefuseReferenceProposalModal()
            }} />
            <Button title={t("Refuse")} foreground variant="filled" onClick={() => {
              setFocusedProposal(props.row.original)
              toggleAdminRefuseReferenceProposalModal()
            }} />
          </div>
        ),
      }),
    ]
  }, [t, toggleAdminRefuseReferenceProposalModal]);

  const {
    data
  } = useInfiniteQuery({
    queryKey: ["history"],
    queryFn: ({ pageParam }) => {
      const offset = pageParam || 0;
      return listReferenceProposal(REFERENCE_PROPOSAL_LIMIT, offset);
    },
    getNextPageParam: (lastPage) => {
      return lastPage.previousOffset + REFERENCE_PROPOSAL_LIMIT;
    },
    staleTime: 10 * 60 * 1000,
    cacheTime: 0,
  });

  const [proposals, setProposals] = useState(() => []);

  useEffect(() => {
    setProposals(data?.pages.map((page) => page.records).flat() || []);
  }, [data]);

  const table = useReactTable({
    columns: columns,
    data: proposals,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <Page name={t("Admin")} overflow={"scroll"}>
        <div className={styles.buttons}>
          <Button title={t("Create a reference")} foreground variant="filled" onClick={toggleAdminCreateReferenceModal} />
          <Button title={t("Create a reference family")} foreground variant="filled" onClick={toggleAdminCreateReferenceFamilyModal} />
        </div>
        <table className={styles.table}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className={styles.th}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className={styles.td}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Page>
      <AdminCreateReferenceModal
        isVisible={showAdminCreateReferenceModal}
        onClose={toggleAdminCreateReferenceModal}
      />
      <AdminCreateReferenceFamilyModal
        isVisible={showAdminCreateReferenceFamilyModal}
        onClose={toggleAdminCreateReferenceFamilyModal}
      />
      <AdminRefuseReferenceProposalModal
        isVisible={showAdminRefuseReferenceProposalModal}
        onClose={toggleAdminRefuseReferenceProposalModal}
        referenceProposal={focusedProposal}
      />
    </>
  );
}

export default Admin;
