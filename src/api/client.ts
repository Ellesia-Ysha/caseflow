import type { CaseFilters, CaseRecord } from "@/types";

export interface SortState {
  sortBy: "updatedAt" | "subject" | "status" | "priority";
  sortDir: "asc" | "desc";
}

export async function fetchCases(filters: CaseFilters, sort: SortState): Promise<{ results: CaseRecord[]; total: number }> {
  const params = new URLSearchParams({
    q: filters.q,
    status: filters.status,
    priority: filters.priority,
    assignee: filters.assignee,
    sortBy: sort.sortBy,
    sortDir: sort.sortDir,
  });

  const res = await fetch(`/api/cases?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to load cases.");
  return res.json();
}

export async function updateCase(id: string, patch: Partial<Pick<CaseRecord, "status" | "assignee">>): Promise<CaseRecord> {
  const res = await fetch(`/api/cases/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? "Failed to update case.");
  }

  return res.json();
}
