import { useCallback, useEffect, useState } from "react";
import type { CaseFilters } from "@/types";
import type { SortState } from "@/api/client";

export interface CaseListState extends CaseFilters {
  sortBy: SortState["sortBy"];
  sortDir: SortState["sortDir"];
}

const DEFAULTS: CaseListState = {
  q: "",
  status: "all",
  priority: "all",
  assignee: "all",
  sortBy: "updatedAt",
  sortDir: "desc",
};

function readFromUrl(): CaseListState {
  const params = new URLSearchParams(window.location.search);
  return {
    q: params.get("q") ?? DEFAULTS.q,
    status: (params.get("status") as CaseListState["status"]) ?? DEFAULTS.status,
    priority: (params.get("priority") as CaseListState["priority"]) ?? DEFAULTS.priority,
    assignee: params.get("assignee") ?? DEFAULTS.assignee,
    sortBy: (params.get("sortBy") as CaseListState["sortBy"]) ?? DEFAULTS.sortBy,
    sortDir: (params.get("sortDir") as CaseListState["sortDir"]) ?? DEFAULTS.sortDir,
  };
}

function writeToUrl(state: CaseListState) {
  const params = new URLSearchParams();
  (Object.keys(state) as (keyof CaseListState)[]).forEach((key) => {
    const value = state[key];
    if (value !== DEFAULTS[key] && value !== "") params.set(key, String(value));
  });

  const query = params.toString();
  const url = query ? `${window.location.pathname}?${query}` : window.location.pathname;
  window.history.replaceState(null, "", url);
}

/** Filter/sort state for the case list, kept in sync with the URL so views are shareable and survive a refresh. */
export function useCaseListState() {
  const [state, setState] = useState<CaseListState>(() => readFromUrl());

  useEffect(() => {
    writeToUrl(state);
  }, [state]);

  useEffect(() => {
    const onPopState = () => setState(readFromUrl());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const update = useCallback((patch: Partial<CaseListState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  return [state, update] as const;
}
