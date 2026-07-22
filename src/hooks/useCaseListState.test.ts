import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useCaseListState } from "./useCaseListState";

function setUrl(search: string) {
  window.history.replaceState(null, "", `/caseflow/${search}`);
}

describe("useCaseListState", () => {
  beforeEach(() => setUrl(""));

  it("reads initial state from the URL query string", () => {
    setUrl("?q=printer&status=open&sortBy=subject&sortDir=asc");

    const { result } = renderHook(() => useCaseListState());
    const [state] = result.current;

    expect(state.q).toBe("printer");
    expect(state.status).toBe("open");
    expect(state.sortBy).toBe("subject");
    expect(state.sortDir).toBe("asc");
  });

  it("falls back to defaults when there's nothing in the URL", () => {
    const { result } = renderHook(() => useCaseListState());
    const [state] = result.current;

    expect(state).toEqual({
      q: "",
      status: "all",
      priority: "all",
      assignee: "all",
      sortBy: "updatedAt",
      sortDir: "desc",
    });
  });

  it("writes updates back into the URL, omitting values that match the defaults", async () => {
    const { result } = renderHook(() => useCaseListState());
    const [, update] = result.current;

    act(() => update({ q: "billing", status: "open" }));

    await waitFor(() => {
      const params = new URLSearchParams(window.location.search);
      expect(params.get("q")).toBe("billing");
      expect(params.get("status")).toBe("open");
    });
    // priority/assignee/sort were never touched — still defaults, so absent from the URL.
    expect(new URLSearchParams(window.location.search).has("priority")).toBe(false);
  });

  it("picks up browser back/forward navigation via popstate", async () => {
    const { result } = renderHook(() => useCaseListState());

    act(() => {
      setUrl("?status=resolved");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    await waitFor(() => expect(result.current[0].status).toBe("resolved"));
  });
});
