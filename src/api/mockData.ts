import casesJson from "@/data/cases.json";
import type { CaseRecord } from "@/types";

/** In-memory "database" for the mock API — mutated by PATCH requests so edits persist for the session. */
export const caseStore: CaseRecord[] = casesJson as CaseRecord[];
