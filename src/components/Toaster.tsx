import * as ToastPrimitive from "@radix-ui/react-toast";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { useToasts } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function Toaster() {
  const toasts = useToasts();

  return (
    <ToastPrimitive.Provider swipeDirection="right">
      {toasts.map((t) => (
        <ToastPrimitive.Root
          key={t.id}
          className={cn(
            "flex items-start gap-3 rounded-xl border p-4 shadow-lg bg-card text-card-foreground",
            "data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-2 data-[state=open]:fade-in",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out",
            t.variant === "destructive" ? "border-destructive/40" : "border-border"
          )}
        >
          {t.variant === "destructive" ? (
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <ToastPrimitive.Title className="text-sm font-semibold">{t.title}</ToastPrimitive.Title>
            {t.description && (
              <ToastPrimitive.Description className="text-sm text-muted-foreground mt-0.5">
                {t.description}
              </ToastPrimitive.Description>
            )}
          </div>
          <ToastPrimitive.Close aria-label="Dismiss" className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </ToastPrimitive.Close>
        </ToastPrimitive.Root>
      ))}
      <ToastPrimitive.Viewport className="fixed bottom-0 right-0 z-[100] m-0 flex w-full max-w-sm flex-col gap-2 p-6 outline-none" />
    </ToastPrimitive.Provider>
  );
}
