import { Badge } from "ecr-components";
import { STATUS_LABELS, PRIORITY_LABELS, type CaseStatus, type CasePriority } from "@/types";

const STATUS_VARIANT: Record<CaseStatus, "primary" | "warning" | "success" | "default"> = {
  open: "primary",
  in_progress: "warning",
  resolved: "success",
  closed: "default",
};

const PRIORITY_VARIANT: Record<CasePriority, "default" | "primary" | "warning" | "destructive"> = {
  low: "default",
  medium: "primary",
  high: "warning",
  urgent: "destructive",
};

export function StatusBadge({ status }: { status: CaseStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABELS[status]}</Badge>;
}

export function PriorityBadge({ priority }: { priority: CasePriority }) {
  return <Badge variant={PRIORITY_VARIANT[priority]}>{PRIORITY_LABELS[priority]}</Badge>;
}
