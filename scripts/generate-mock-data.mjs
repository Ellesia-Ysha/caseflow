// Generates the mock case dataset at build time so @faker-js/faker never ships
// to the browser — only this Node script (run via `npm run generate:data`) needs it.
import { faker } from "@faker-js/faker";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const STATUSES = ["open", "in_progress", "resolved", "closed"];
const PRIORITIES = ["low", "medium", "high", "urgent"];

const ASSIGNEES = [
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

const SUBJECT_TEMPLATES = [
  () => `${faker.hacker.verb()} ${faker.hacker.noun()} on ${faker.commerce.department()} dashboard`,
  () => `Unable to ${faker.hacker.verb()} the ${faker.hacker.noun()}`,
  () => `${faker.company.buzzVerb()} request for ${faker.commerce.department()}`,
  () => `Error when ${faker.hacker.ingverb()} ${faker.hacker.noun()}`,
];

function generateCase() {
  const createdAt = faker.date.past({ years: 1 });
  const updatedAt = faker.date.between({ from: createdAt, to: new Date() });

  return {
    id: faker.string.uuid(),
    subject: faker.helpers.arrayElement(SUBJECT_TEMPLATES)(),
    requester: faker.person.fullName(),
    assignee: faker.helpers.maybe(() => faker.helpers.arrayElement(ASSIGNEES), { probability: 0.85 }) ?? null,
    status: faker.helpers.arrayElement(STATUSES),
    priority: faker.helpers.arrayElement(PRIORITIES),
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  };
}

faker.seed(42);

const cases = Array.from({ length: 2500 }, generateCase);

const outPath = path.resolve(fileURLToPath(import.meta.url), "../../src/data/cases.json");
writeFileSync(outPath, JSON.stringify(cases));

console.log(`Generated ${cases.length} mock cases -> ${outPath}`);
