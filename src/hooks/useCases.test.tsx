import { describe, it, expect } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import type { ReactNode } from "react";
import { server } from "@/test/server";
import { useUpdateCaseMutation } from "./useCases";
import type { CaseFilters, CaseRecord } from "@/types";
import type { SortState } from "@/api/client";

const filters: CaseFilters = { q: "", status: "all", priority: "all", assignee: "all" };
const sort: SortState = { sortBy: "updatedAt", sortDir: "desc" };
const queryKey = ["cases", filters, sort];

const baseCase: CaseRecord = {
  id: "case-1",
  subject: "Login broken",
  requester: "Jane Doe",
  assignee: null,
  status: "open",
  priority: "high",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

function renderMutation() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  client.setQueryData(queryKey, { results: [baseCase], total: 1 });

  function wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  }

  const { result } = renderHook(() => useUpdateCaseMutation(filters, sort), { wrapper });
  return { client, result };
}

function getStatus(client: QueryClient) {
  return client.getQueryData<{ results: CaseRecord[] }>(queryKey)?.results[0].status;
}

describe("useUpdateCaseMutation", () => {
  it("applies the change optimistically before the network responds", async () => {
    // A manually-released gate instead of a timer — the response literally
    // cannot resolve until the test calls `release()`, so there's no
    // real-clock race to make this test flaky.
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });

    server.use(
      http.patch("/api/cases/:id", async () => {
        await gate;
        return HttpResponse.json({ ...baseCase, status: "resolved" });
      })
    );

    const { client, result } = renderMutation();

    act(() => {
      result.current.mutate({ id: baseCase.id, patch: { status: "resolved" } });
    });

    // The mock handler is still gated — this can only be true if the cache
    // was updated by onMutate, not by an actual server response.
    await waitFor(() => expect(getStatus(client)).toBe("resolved"));
    expect(result.current.isPending).toBe(true);

    release();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getStatus(client)).toBe("resolved");
  });

  it("rolls back to the previous value when the request fails", async () => {
    server.use(
      http.patch("/api/cases/:id", () =>
        HttpResponse.json({ message: "Failed to save changes." }, { status: 500 })
      )
    );

    const { client, result } = renderMutation();

    act(() => {
      result.current.mutate({ id: baseCase.id, patch: { status: "resolved" } });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    // Rolled back to the original status, not left on the failed optimistic value.
    expect(getStatus(client)).toBe("open");
  });

  it("keeps the optimistic value once the request actually succeeds", async () => {
    server.use(
      http.patch("/api/cases/:id", () => HttpResponse.json({ ...baseCase, status: "resolved" }))
    );

    const { client, result } = renderMutation();

    act(() => {
      result.current.mutate({ id: baseCase.id, patch: { status: "resolved" } });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getStatus(client)).toBe("resolved");
  });
});
