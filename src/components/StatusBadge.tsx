import { Badge } from "@/components/ui/Badge";
import { STATUS_LABELS, PRIORITY_LABELS, type CaseStatus, type CasePriority } from "@/types";

const STATUS_VARIANT: Record<CaseStatus, "blue" | "amber" | "green" | "slate"> = {
  open: "blue",
  in_progress: "amber",
  resolved: "green",
  closed: "slate",
};

const PRIORITY_VARIANT: Record<CasePriority, "slate" | "blue" | "amber" | "red"> = {
  low: "slate",
  medium: "blue",
  high: "amber",
  urgent: "red",
};

export function StatusBadge({ status }: { status: CaseStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABELS[status]}</Badge>;
}

export function PriorityBadge({ priority }: { priority: CasePriority }) {
  return <Badge variant={PRIORITY_VARIANT[priority]}>{PRIORITY_LABELS[priority]}</Badge>;
}
