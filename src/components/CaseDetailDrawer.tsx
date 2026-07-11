import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/Drawer";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";
import { PriorityBadge } from "@/components/StatusBadge";
import { ASSIGNEES } from "@/data/assignees";
import { generateDescription } from "@/lib/loremGenerator";
import { useUpdateCaseMutation } from "@/hooks/useCases";
import { STATUS_LABELS, type CaseRecord, type CaseStatus } from "@/types";
import type { CaseListState } from "@/hooks/useCaseListState";

interface CaseDetailDrawerProps {
  record: CaseRecord | null;
  onOpenChange: (open: boolean) => void;
  filters: CaseListState;
}

export function CaseDetailDrawer({ record, onOpenChange, filters }: CaseDetailDrawerProps) {
  const mutation = useUpdateCaseMutation(filters, { sortBy: filters.sortBy, sortDir: filters.sortDir });

  return (
    <Drawer open={!!record} onOpenChange={onOpenChange}>
      <DrawerContent>
        {record && (
          <>
            <DrawerHeader>
              <DrawerTitle>{record.subject}</DrawerTitle>
              <DrawerDescription>
                Opened by {record.requester} on {new Date(record.createdAt).toLocaleDateString()}
              </DrawerDescription>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Status</label>
                  <Select
                    value={record.status}
                    onValueChange={(status) =>
                      mutation.mutate({ id: record.id, patch: { status: status as CaseStatus } })
                    }
                  >
                    <SelectTrigger aria-label="Change status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Priority</label>
                  <div className="h-10 flex items-center">
                    <PriorityBadge priority={record.priority} />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Assignee</label>
                <Select
                  value={record.assignee ?? "unassigned"}
                  onValueChange={(assignee) =>
                    mutation.mutate({
                      id: record.id,
                      patch: { assignee: assignee === "unassigned" ? null : assignee },
                    })
                  }
                >
                  <SelectTrigger aria-label="Change assignee">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {ASSIGNEES.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description</label>
                <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
                  {generateDescription(record.id)}
                </p>
              </div>

              <p className="text-xs text-muted-foreground">
                Last updated {new Date(record.updatedAt).toLocaleString()}
              </p>
            </div>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
