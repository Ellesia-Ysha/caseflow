import { http, HttpResponse, delay } from "msw";
import { caseStore } from "./mockData";
import type { CaseRecord, CaseStatus, CasePriority } from "@/types";

function matches(record: CaseRecord, params: URLSearchParams): boolean {
  const q = params.get("q")?.trim().toLowerCase();
  const status = params.get("status");
  const priority = params.get("priority");
  const assignee = params.get("assignee");

  if (q && !record.subject.toLowerCase().includes(q) && !record.requester.toLowerCase().includes(q)) {
    return false;
  }
  if (status && status !== "all" && record.status !== status) return false;
  if (priority && priority !== "all" && record.priority !== priority) return false;
  if (assignee && assignee !== "all" && record.assignee !== assignee) return false;

  return true;
}

const PRIORITY_WEIGHT: Record<CasePriority, number> = { urgent: 3, high: 2, medium: 1, low: 0 };
const STATUS_WEIGHT: Record<CaseStatus, number> = { open: 0, in_progress: 1, resolved: 2, closed: 3 };

export const handlers = [
  http.get("/api/cases", async ({ request }) => {
    // Simulate realistic network latency.
    await delay(randomDelay());

    const url = new URL(request.url);
    const sortBy = url.searchParams.get("sortBy") ?? "updatedAt";
    const sortDir = url.searchParams.get("sortDir") === "asc" ? 1 : -1;

    const results = caseStore.filter((record) => matches(record, url.searchParams));

    results.sort((a, b) => {
      let diff = 0;
      if (sortBy === "priority") diff = PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
      else if (sortBy === "status") diff = STATUS_WEIGHT[a.status] - STATUS_WEIGHT[b.status];
      else if (sortBy === "subject") diff = a.subject.localeCompare(b.subject);
      else diff = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      return diff * sortDir;
    });

    return HttpResponse.json({ results, total: results.length });
  }),

  http.patch("/api/cases/:id", async ({ params, request }) => {
    await delay(400);

    const record = caseStore.find((c) => c.id === params.id);
    if (!record) {
      return HttpResponse.json({ message: "Case not found" }, { status: 404 });
    }

    // Fail intermittently so the UI's optimistic-rollback path actually gets exercised.
    if (Math.random() < 0.18) {
      return HttpResponse.json({ message: "Failed to save changes. Please try again." }, { status: 500 });
    }

    const patch = (await request.json()) as Partial<Pick<CaseRecord, "status" | "assignee">>;
    Object.assign(record, patch, { updatedAt: new Date().toISOString() });

    return HttpResponse.json(record);
  }),
];

function randomDelay() {
  return 350 + Math.random() * 450;
}
