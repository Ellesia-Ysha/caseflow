import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "ecr-components";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";
import { useDebounce } from "@/hooks/useDebounce";
import { ASSIGNEES } from "@/data/assignees";
import { STATUS_LABELS, PRIORITY_LABELS } from "@/types";
import type { CaseListState } from "@/hooks/useCaseListState";

interface CaseFiltersProps {
  state: CaseListState;
  onChange: (patch: Partial<CaseListState>) => void;
}

export function CaseFilters({ state, onChange }: CaseFiltersProps) {
  const [searchInput, setSearchInput] = useState(state.q);
  const debouncedSearch = useDebounce(searchInput, 300);

  // Push debounced local typing up into the URL-synced state.
  useEffect(() => {
    if (debouncedSearch !== state.q) onChange({ q: debouncedSearch });
  }, [debouncedSearch]);

  // Reflect external changes (e.g. browser back/forward) into the input.
  useEffect(() => {
    setSearchInput(state.q);
  }, [state.q]);

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by subject or requester..."
          className="pl-9"
          aria-label="Search cases"
        />
      </div>

      <Select value={state.status} onValueChange={(v) => onChange({ status: v as CaseListState["status"] })}>
        <SelectTrigger className="w-full sm:w-[160px]" aria-label="Filter by status">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={state.priority} onValueChange={(v) => onChange({ priority: v as CaseListState["priority"] })}>
        <SelectTrigger className="w-full sm:w-[160px]" aria-label="Filter by priority">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All priorities</SelectItem>
          {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={state.assignee} onValueChange={(v) => onChange({ assignee: v })}>
        <SelectTrigger className="w-full sm:w-[180px]" aria-label="Filter by assignee">
          <SelectValue placeholder="Assignee" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All assignees</SelectItem>
          {ASSIGNEES.map((name) => (
            <SelectItem key={name} value={name}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
