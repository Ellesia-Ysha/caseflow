import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const MockingReadyContext = createContext(false);

/**
 * Starts the MSW mock-API worker in the background after first paint, instead of
 * blocking the initial render on it. Components that fetch data should gate their
 * queries on `useMockingReady()` rather than waiting for this provider itself.
 */
export function MockingProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    import("./api/browser")
      .then(({ worker }) =>
        worker.start({
          serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
          onUnhandledRequest: "bypass",
        })
      )
      .then(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return <MockingReadyContext.Provider value={ready}>{children}</MockingReadyContext.Provider>;
}

export function useMockingReady() {
  return useContext(MockingReadyContext);
}
