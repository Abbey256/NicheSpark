import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { CheckCircle, XCircle, X } from "lucide-react";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastContextValue {
  toast: (message: string, type?: Toast["type"]) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = `${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium shadow-xl animate-slide-up pointer-events-auto",
              t.type === "success" && "bg-card border-emerald-500/30 text-emerald-400",
              t.type === "error" && "bg-card border-red-500/30 text-red-400",
              t.type === "info" && "bg-card border-primary/30 text-primary"
            )}
          >
            {t.type === "success" && <CheckCircle className="size-4 shrink-0" />}
            {t.type === "error" && <XCircle className="size-4 shrink-0" />}
            <span className="text-foreground">{t.message}</span>
            <button onClick={() => dismiss(t.id)} className="ml-1 text-muted-foreground hover:text-foreground">
              <X className="size-3" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be inside ToastProvider");
  return ctx;
}
