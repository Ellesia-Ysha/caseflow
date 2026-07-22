import { setupServer } from "msw/node";

// No default handlers — each test registers exactly what it needs via
// `server.use(...)`, reset after every test in src/test/setup.ts. Keeps unit
// tests independent of the generated mock dataset (src/data/cases.json).
export const server = setupServer();
