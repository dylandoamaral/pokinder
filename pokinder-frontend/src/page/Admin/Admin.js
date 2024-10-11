import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useInfiniteQuery } from "react-query";

import useToggle from "../../hook/useToggle";

import { listReferenceProposals } from "../../api/pokinder";

import { getDaenaLink } from "../../utils/website";

import Button from "../../component/atom/Button/Button";
import Sprite from "../../component/atom/Sprite/Sprite";
import Page from "../../component/organism/Page/Page";

import styles from "./Admin.module.css";
import AdminAcceptReferenceProposalModal from "./AdminAcceptReferenceProposalModal";
import AdminCreateReferenceFamilyModal from "./AdminCreateReferenceFamilyModal";
import AdminCreateReferenceModal from "./AdminCreateReferenceModal";
import AdminRefuseReferenceProposalModal from "./AdminRefuseReferenceProposalModal";
import { useAuthentication } from "../../hook/useAuthentication";
import NotFound from "../NotFound/NotFound";

const REFERENCE_PROPOSAL_LIMIT = 20;

function Admin() {
  const { t } = useTranslation();
  const { isAdmin } = useAuthentication();

  const [showAdminCreateReferenceModal, toggleAdminCreateReferenceModal] = useToggle();
  const [showAdminCreateReferenceFamilyModal, toggleAdminCreateReferenceFamilyModal] = useToggle();
  const [showAdminAcceptReferenceProposalModal, toggleAdminAcceptReferenceProposalModal] =
    useToggle();
  const [showAdminRefuseReferenceProposalModal, toggleAdminRefuseReferenceProposalModal] =
    useToggle();

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
            <Button
              title={t("Accept")}
              foreground
              variant="filled"
              onClick={() => {
                setFocusedProposal(props.row.original);
                toggleAdminAcceptReferenceProposalModal();
              }}
            />
            <Button
              title={t("Refuse")}
              foreground
              variant="filled"
              onClick={() => {
                setFocusedProposal(props.row.original);
                toggleAdminRefuseReferenceProposalModal();
              }}
            />
          </div>
        ),
      }),
    ];
  }, [t, toggleAdminAcceptReferenceProposalModal, toggleAdminRefuseReferenceProposalModal]);

  const { data, refetch } = useInfiniteQuery({
    queryKey: ["reference_proposals"],
    queryFn: ({ pageParam }) => {
      const offset = pageParam || 0;
      return listReferenceProposals(REFERENCE_PROPOSAL_LIMIT, offset);
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

  if (!isAdmin) {
    return <NotFound />
  }

  return (
    <>
      <Page name={t("Admin")} overflow={"scroll"}>
        <div className={styles.buttons}>
          <Button
            title={t("Create a reference")}
            foreground
            variant="filled"
            onClick={toggleAdminCreateReferenceModal}
          />
          <Button
            title={t("Create a reference family")}
            foreground
            variant="filled"
            onClick={toggleAdminCreateReferenceFamilyModal}
          />
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
      <AdminAcceptReferenceProposalModal
        isVisible={showAdminAcceptReferenceProposalModal}
        onClose={toggleAdminAcceptReferenceProposalModal}
        referenceProposal={focusedProposal}
        refreshProposals={refetch}
      />
      <AdminRefuseReferenceProposalModal
        isVisible={showAdminRefuseReferenceProposalModal}
        onClose={toggleAdminRefuseReferenceProposalModal}
        referenceProposal={focusedProposal}
        refreshProposals={refetch}
      />
    </>
  );
}

export default Admin;
