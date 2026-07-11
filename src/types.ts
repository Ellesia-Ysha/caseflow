export type CaseStatus = "open" | "in_progress" | "resolved" | "closed";
export type CasePriority = "low" | "medium" | "high" | "urgent";

export interface CaseRecord {
  id: string;
  subject: string;
  requester: string;
  assignee: string | null;
  status: CaseStatus;
  priority: CasePriority;
  createdAt: string;
  updatedAt: string;
}

export interface CaseFilters {
  q: string;
  status: CaseStatus | "all";
  priority: CasePriority | "all";
  assignee: string | "all";
}

export const STATUS_LABELS: Record<CaseStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

export const PRIORITY_LABELS: Record<CasePriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};
