import { useState, lazy, Suspense } from "react";
import { AlertCircle, LayoutGrid } from "lucide-react";
import { CaseFilters } from "@/components/CaseFilters";
import { Skeleton } from "@/components/ui/Skeleton";
import { Toaster } from "@/components/Toaster";
import { useCasesQuery } from "@/hooks/useCases";
import { useCaseListState } from "@/hooks/useCaseListState";

// Deferred out of the critical bundle: these pull in TanStack Table/Virtual, which
// aren't needed until data has actually loaded. CaseFilters stays eager — it's tiny,
// and lazy-loading it caused a layout shift as its real (stacked-on-mobile) height
// replaced an under-sized skeleton.
const CaseTable = lazy(() => import("@/components/CaseTable").then((m) => ({ default: m.CaseTable })));
const CaseDetailDrawer = lazy(() =>
  import("@/components/CaseDetailDrawer").then((m) => ({ default: m.CaseDetailDrawer }))
);

function TableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 10 }, (_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-xl" />
      ))}
    </div>
  );
}

export default function App() {
  const [filters, updateFilters] = useCaseListState();
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  const { data, isPending, isError, isFetching } = useCasesQuery(filters, {
    sortBy: filters.sortBy,
    sortDir: filters.sortDir,
  });

  const selectedCase = data?.results.find((c) => c.id === selectedCaseId) ?? null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <LayoutGrid className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg leading-none">CaseFlow</h1>
            <p className="text-xs text-muted-foreground">Case management, at scale</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <CaseFilters state={filters} onChange={updateFilters} />
        </div>

        <div className="flex items-center justify-between mb-3 text-sm text-muted-foreground">
          <p>
            {isPending ? "Loading…" : `${data?.total.toLocaleString() ?? 0} case${data?.total === 1 ? "" : "s"}`}
            {isFetching && !isPending && " · updating…"}
          </p>
        </div>

        {isError && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            Failed to load cases. Try adjusting your filters or reloading.
          </div>
        )}

        {isPending ? (
          <TableSkeleton />
        ) : (
          <Suspense fallback={<TableSkeleton />}>
            <CaseTable
              data={data?.results ?? []}
              sortBy={filters.sortBy}
              sortDir={filters.sortDir}
              onSortChange={(sortBy) =>
                updateFilters({
                  sortBy,
                  sortDir: filters.sortBy === sortBy && filters.sortDir === "desc" ? "asc" : "desc",
                })
              }
              onRowClick={(record) => setSelectedCaseId(record.id)}
            />
          </Suspense>
        )}
      </main>

      <Suspense fallback={null}>
        <CaseDetailDrawer
          record={selectedCase}
          filters={filters}
          onOpenChange={(open) => !open && setSelectedCaseId(null)}
        />
      </Suspense>

      <Toaster />
    </div>
  );
}
