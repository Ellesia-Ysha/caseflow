import { useRef } from "react";
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";
import type { CaseRecord, CaseStatus, CasePriority } from "@/types";
import type { CaseListState } from "@/hooks/useCaseListState";

interface CaseTableProps {
  data: CaseRecord[];
  sortBy: CaseListState["sortBy"];
  sortDir: CaseListState["sortDir"];
  onSortChange: (sortBy: CaseListState["sortBy"]) => void;
  onRowClick: (record: CaseRecord) => void;
}

const columns: ColumnDef<CaseRecord>[] = [
  {
    id: "subject",
    header: "Subject",
    accessorKey: "subject",
    cell: (info) => (
      <div>
        <p className="font-medium text-sm truncate max-w-[320px]">{info.getValue<string>()}</p>
        <p className="text-xs text-muted-foreground">{info.row.original.requester}</p>
      </div>
    ),
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    cell: (info) => <StatusBadge status={info.getValue<CaseStatus>()} />,
  },
  {
    id: "priority",
    header: "Priority",
    accessorKey: "priority",
    cell: (info) => <PriorityBadge priority={info.getValue<CasePriority>()} />,
  },
  {
    id: "assignee",
    header: "Assignee",
    accessorKey: "assignee",
    cell: (info) => info.getValue<string | null>() ?? <span className="text-muted-foreground">Unassigned</span>,
  },
  {
    id: "updatedAt",
    header: "Updated",
    accessorKey: "updatedAt",
    cell: (info) =>
      new Date(info.getValue<string>()).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
  },
];

const SORTABLE_COLUMNS = new Set(["subject", "status", "priority", "updatedAt"]);
const ROW_HEIGHT = 56;

export function CaseTable({ data, sortBy, sortDir, onSortChange, onRowClick }: CaseTableProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const rows = table.getRowModel().rows;

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 12,
  });

  const virtualRows = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
  const paddingBottom = virtualRows.length > 0 ? totalSize - virtualRows[virtualRows.length - 1].end : 0;

  return (
    <div className="rounded-2xl border border-border overflow-hidden bg-card">
      <div ref={parentRef} className="overflow-auto max-h-[65vh]">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 z-10 bg-muted/90 backdrop-blur">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const sortable = SORTABLE_COLUMNS.has(header.column.id);
                  const active = sortBy === header.column.id;
                  return (
                    <th
                      key={header.id}
                      scope="col"
                      aria-sort={active ? (sortDir === "asc" ? "ascending" : "descending") : undefined}
                      className={`px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap ${
                        sortable ? "cursor-pointer select-none hover:text-foreground" : ""
                      }`}
                      onClick={sortable ? () => onSortChange(header.column.id as CaseListState["sortBy"]) : undefined}
                    >
                      <span className="inline-flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {sortable &&
                          (active ? (
                            sortDir === "asc" ? (
                              <ArrowUp className="w-3.5 h-3.5" />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 opacity-30" />
                          ))}
                      </span>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {paddingTop > 0 && (
              <tr aria-hidden>
                <td style={{ height: paddingTop }} colSpan={columns.length} />
              </tr>
            )}
            {virtualRows.map((virtualRow) => {
              const row = rows[virtualRow.index];
              return (
                <tr
                  key={row.id}
                  tabIndex={0}
                  role="button"
                  className="border-t border-border hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none cursor-pointer transition-colors"
                  onClick={() => onRowClick(row.original)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onRowClick(row.original);
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              );
            })}
            {paddingBottom > 0 && (
              <tr aria-hidden>
                <td style={{ height: paddingBottom }} colSpan={columns.length} />
              </tr>
            )}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="py-16 text-center text-sm text-muted-foreground">No cases match your filters.</div>
        )}
      </div>
    </div>
  );
}
