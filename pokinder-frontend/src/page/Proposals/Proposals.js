import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useInfiniteQuery } from "react-query";
import { Navigate } from "react-router-dom";

import { useAuthentication } from "../../hook/useAuthentication";

import { listReferenceProposals } from "../../api/pokinder";

import { getDaenaLink } from "../../utils/website";

import Button, { VARIANT_FILLED_FOREGROUND } from "../../component/atom/Button/Button";
import Loader from "../../component/atom/Loader/Loader";
import Sprite from "../../component/atom/Sprite/Sprite";
import Page from "../../component/organism/Page/Page";

import styles from "./Proposals.module.css";
import ProposalsStatusBadge from "./ProposalsStatusBadge";

const REFERENCE_PROPOSAL_LIMIT = 50;

function Proposals() {
  const { t } = useTranslation();
  const { isUser, accountId } = useAuthentication();

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
      columnHelper.accessor("reference_family_name", {
        header: t("Proposed family name"),
        cell: (props) => <div className={styles.rowText}>{props.getValue()}</div>,
      }),
      columnHelper.accessor("reference_name", {
        header: t("Proposed name"),
        cell: (props) => <div className={styles.rowText}>{props.getValue()}</div>,
      }),
      columnHelper.accessor("status", {
        header: t("Status"),
        cell: (props) => (
          <div className={styles.rowBadge}>
            <ProposalsStatusBadge status={props.getValue()} />
          </div>
        ),
      }),
      columnHelper.accessor("reason", {
        header: t("Refused reason"),
        cell: (props) => <div className={styles.rowReason}>{props.getValue()}</div>,
      }),
      columnHelper.display({
        header: t("Actions"),
        cell: (props) => (
          <div className={styles.rowButtons}>
            <Button
              title={t("Contest")}
              variant={VARIANT_FILLED_FOREGROUND}
              onClick={() => {
                const STATUS_LABELS = {
                  0: "pending",
                  1: "validated",
                  2: "refused",
                };

                const email = "pokinder.noreply@gmail.com";
                const proposal = props.row.original;
                const subject = `Request to contest a proposal`;

                const refusedReasonLine = proposal.reason
                  ? ` - proposal refused reason: ${proposal.reason}\n`
                  : "";

                const body =
                  `Important information about the contested proposals (please don't delete the following information from the email):\n` +
                  ` - proposer id: ${proposal.proposer.id}\n` +
                  ` - proposal id: ${proposal.id}\n` +
                  ` - proposal status: ${STATUS_LABELS[proposal.status]}\n` +
                  refusedReasonLine +
                  ` - proposed reference name: ${proposal.reference_name}\n` +
                  ` - proposed reference family name: ${proposal.reference_family_name}\n\n` +
                  `<INSERT THE REASON OF THE CONTEST HERE>`;

                const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

                window.location.href = mailtoLink;
              }}
            />
          </div>
        ),
      }),
    ];
  }, [t]);

  const { data, fetchNextPage, isLoading, isFetching, isFetchingNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ["reference_proposals"],
      queryFn: ({ pageParam }) => {
        const offset = pageParam || 0;
        return listReferenceProposals(REFERENCE_PROPOSAL_LIMIT, offset, accountId, undefined, true);
      },
      getNextPageParam: (lastPage) => {
        if (lastPage.records.length < REFERENCE_PROPOSAL_LIMIT) return false;
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

  function onScrollFinish() {
    if (isLoading || isFetching || isFetchingNextPage || !hasNextPage) {
      return;
    }

    fetchNextPage();
  }

  return (
    <Page
      name={t("Proposals")}
      description="Manage your proposals."
      overflow={"scroll"}
      onScrollFinish={onScrollFinish}
    >
      {!isUser && <Navigate to=".." relative="path"></Navigate>}
      <div className={styles.container}>
        <div className={styles.tableContainer}>
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
                <tr key={row.id} className={styles.tr}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className={styles.td}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Loader loading={isFetching || isFetchingNextPage} />
      </div>
    </Page>
  );
}

export default Proposals;
