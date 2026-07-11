/**
 * A static assignee roster, kept dependency-free so UI components (CaseFilters,
 * CaseDetailDrawer) never need to pull @faker-js/faker into the shipped bundle —
 * only the mock data generator (mockData.ts, lazy-loaded with the rest of the API mock)
 * needs faker.
 */
export const ASSIGNEES = [
  "Alex Rivera",
  "Jordan Lee",
  "Sam Chen",
  "Taylor Morgan",
  "Priya Patel",
  "Chris Bennett",
  "Morgan Davis",
  "Jamie Foster",
  "Casey Nguyen",
  "Riley Thompson",
  "Avery Brooks",
  "Dana Whitfield",
];
