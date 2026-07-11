import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchCases, updateCase, type SortState } from "@/api/client";
import { toast } from "@/hooks/use-toast";
import { useMockingReady } from "@/mocking-context";
import type { CaseFilters, CaseRecord } from "@/types";

type CasesResponse = { results: CaseRecord[]; total: number };

export function useCasesQuery(filters: CaseFilters, sort: SortState) {
  const mockingReady = useMockingReady();

  return useQuery({
    queryKey: ["cases", filters, sort],
    queryFn: () => fetchCases(filters, sort),
    // Don't fire until the mock API worker has finished registering in the background.
    enabled: mockingReady,
    // Keep the previous page's data on screen while the next request is in flight,
    // instead of flashing back to a loading state on every filter/search change.
    placeholderData: (previous) => previous,
  });
}

export function useUpdateCaseMutation(filters: CaseFilters, sort: SortState) {
  const queryClient = useQueryClient();
  const queryKey = ["cases", filters, sort];

  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Pick<CaseRecord, "status" | "assignee">> }) =>
      updateCase(id, patch),

    onMutate: async ({ id, patch }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<CasesResponse>(queryKey);

      queryClient.setQueryData<CasesResponse | undefined>(queryKey, (old) =>
        old
          ? { ...old, results: old.results.map((c) => (c.id === id ? { ...c, ...patch } : c)) }
          : old
      );

      return { previous };
    },

    onError: (error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "The change was rolled back.",
        variant: "destructive",
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
    },
  });
}
