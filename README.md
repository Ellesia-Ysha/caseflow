# CaseFlow

[![Tests](https://github.com/Ellesia-Ysha/caseflow/actions/workflows/test.yml/badge.svg)](https://github.com/Ellesia-Ysha/caseflow/actions/workflows/test.yml)

A case-management dashboard built by **Ellesia Catherine Reyes** to demonstrate frontend engineering beyond CRUD screens: virtualized rendering at scale, URL-synced filtering, and optimistic updates with real rollback.

**[View the live demo →](https://ellesia-ysha.github.io/caseflow/)**

There's no real backend — [MSW](https://mswjs.io/) intercepts network requests in the browser and serves a generated dataset of 2,500 cases, so the demo runs entirely client-side but exercises real async data-fetching, loading, and error states.

## What it demonstrates

- **Virtualized, sortable table.** [`@tanstack/react-virtual`](https://tanstack.com/virtual) renders only the rows in view over the full result set (up to 2,500 rows), so scrolling stays smooth regardless of dataset size. Column sorting is handled by [`@tanstack/react-table`](https://tanstack.com/table)'s headless model.
- **URL-synced filters.** Search, status, priority, and assignee filters (plus sort state) live in the URL query string — a filtered view is a shareable link, survives a refresh, and responds correctly to browser back/forward.
- **Debounced search.** Typing doesn't trigger a request per keystroke; input is debounced before it updates the URL state and fires a query.
- **Optimistic updates with real rollback.** Changing a case's status or assignee updates the UI immediately via [TanStack Query](https://tanstack.com/query)'s `onMutate`, and the mock API intentionally fails ~18% of the time so the rollback path (revert the cache, toast an error) is something you can actually see happen, not just code that's never exercised.
- **Accessible by construction.** Interactive pieces (Select, Dialog/Drawer, Toast) are built on Radix UI primitives for correct focus management and ARIA behavior, not just visual styling.
- **Built on [`ecr-components`](https://www.npmjs.com/package/ecr-components).** Badge and Input are pulled from my own published component library rather than duplicated locally — same design tokens, so it's a drop-in. Select, Drawer, and Skeleton stay local since the library doesn't have equivalents for those yet.
- **The optimistic-update/rollback logic is actually tested, not just eyeballed.** Vitest unit tests drive `useUpdateCaseMutation` against a mocked API (via `msw/node`) with a manually-controlled response gate, so the optimistic write, the rollback-on-failure, and the keep-on-success paths are all asserted deterministically — no reliance on the real ~18% failure rate landing the right way during a test run. Playwright E2E covers the same flow end-to-end in a real browser against the production build (search → filter → sort → edit), including an assignee-edit test that accepts whichever outcome the mock API actually returns and asserts the UI settles cleanly either way.

## Performance notes

Lighthouse (locally, against the production build):

| | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| Desktop | 99 | 96 | 96 | 100 |
| Mobile (simulated slow 4G + 4x CPU throttle) | ~78 | 96 | 96 | 100 |

The gap between those two isn't a fluke — it's what happens to any small app under Lighthouse's default mobile throttling profile, and it's worth being upfront about rather than only reporting the flattering number. A few concrete things that went into getting the mobile score this high (from an initial ~74 with an unoptimized first pass):

- **The mock dataset never ships as part of the app bundle.** Generating 2,500 records with `@faker-js/faker` at runtime would mean shipping the entire faker library (and, if done carelessly, several MB of precomputed text) to the browser. Instead, `scripts/generate-mock-data.mjs` runs faker at *build time* and writes a compact JSON file — faker itself never reaches the client. Case descriptions are generated on-demand in the browser from a ~1KB seeded word-list generator instead of being precomputed and shipped for all 2,500 records.
- **The mock API's setup doesn't block first paint.** It would be simplest to `await` the MSW worker before rendering anything — but that ties your loading screen to the size of your mock backend. Instead the app renders immediately and the data-fetching query waits on a readiness flag, so the mock-worker chunk loads in the background after the shell is already visible.
- **The table and its dependencies (TanStack Table/Virtual) are code-split** behind `React.lazy`, since they're not needed until there's data to show.
- **Fonts load via `<link>`, not a CSS `@import`** — an `@import` for an external stylesheet blocks CSSOM construction on a cross-origin round-trip before anything can paint.

## Stack

React · TypeScript · Vite · Tailwind CSS · TanStack Query/Table/Virtual · Radix UI · MSW · [ecr-components](https://www.npmjs.com/package/ecr-components)

## Running locally

```bash
npm install
npm run dev        # generates the mock dataset, then starts the dev server
npm run check      # typecheck
npm run build      # generates fresh data, typechecks, and builds to dist/
npm run test       # unit tests (Vitest + React Testing Library)
npm run test:e2e   # Playwright E2E — builds + serves the production output first
```

The mock dataset is regenerated automatically before `dev` and `build` (deterministically — same seed, same data every time) rather than committed to the repo. Both test suites run in CI (`.github/workflows/test.yml`) on every push and pull request to `main`.

## Roadmap

- [x] Unit tests (Vitest + React Testing Library) for the optimistic-update logic
- [x] Playwright E2E covering the filter → sort → edit → rollback flow
- [ ] Keyboard-navigable table row selection (arrow keys, not just Tab)
