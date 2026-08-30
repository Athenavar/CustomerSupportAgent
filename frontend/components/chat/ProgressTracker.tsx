import { Check, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

// The orchestrator's state machine (backend/app/agents/orchestrator.py) walks:
// PRODUCT_IDENTIFICATION -> PURCHASE_VERIFICATION -> ISSUE_DIAGNOSIS -> ACTIVE_SUPPORT
// and stamps each reply with a "progress_step". Order verification + warranty
// evaluation happen server-side inside the purchase step, before the issue is
// ever asked for, so "Issue" implies "Verification" is already complete.
const STEP_ORDER = ["Product", "Purchase", "Verification", "Issue", "Analysis"] as const;

const STEP_INDEX: Record<string, number> = {
  Product: 0,
  Purchase: 1,
  Issue: 3,
  Verification: 2,
  Analysis: 4,
  Complete: 4,
};

export default function ProgressTracker({
  progressStep,
  escalated,
}: {
  progressStep?: string;
  escalated?: boolean;
}) {
  const activeIndex = progressStep ? STEP_INDEX[progressStep] ?? 0 : 0;
  const isComplete = progressStep === "Complete";

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
          Progress
        </span>
        {escalated && (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-danger">
            <AlertTriangle size={12} /> Escalated
          </span>
        )}
      </div>
      <ol className="space-y-2.5">
        {STEP_ORDER.map((step, i) => {
          const done = escalated ? i < activeIndex : i < activeIndex || (isComplete && i <= activeIndex);
          const active = !escalated && i === activeIndex && !isComplete;
          return (
            <li key={step} className="flex items-center gap-2.5">
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold transition-colors",
                  done && "border-accent bg-accent text-white",
                  active && "border-accent bg-accent-soft text-accent",
                  !done && !active && "border-border bg-surface-raised text-ink-faint"
                )}
              >
                {done ? <Check size={11} /> : i + 1}
              </span>
              <span
                className={cn(
                  "text-sm",
                  done ? "text-ink" : active ? "font-medium text-ink" : "text-ink-faint"
                )}
              >
                {step}
              </span>
              {active && (
                <span className="ml-auto h-1.5 w-1.5 animate-pulseDot rounded-full bg-accent" />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
