import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { MockingProvider } from "./mocking-context";
import "./styles/globals.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      retry: 1,
    },
  },
});

// Render immediately — the mock API worker loads in the background (it's the chunk
// carrying the mock dataset) instead of blocking first paint. Data-fetching queries
// wait on `MockingProvider`'s readiness flag rather than the whole app waiting on it.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <MockingProvider>
        <App />
      </MockingProvider>
    </QueryClientProvider>
  </StrictMode>
);
