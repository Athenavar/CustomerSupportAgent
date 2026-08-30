import { confidenceBand, toPercent, cn } from "@/lib/utils";

const BAND_COPY: Record<string, string> = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence",
};

const BAND_COLOR: Record<string, string> = {
  high: "bg-accent",
  medium: "bg-warn",
  low: "bg-danger",
};

export default function ConfidenceMeter({ confidence }: { confidence: number }) {
  const pct = toPercent(confidence);
  const band = confidenceBand(confidence);
  const activeBars = Math.max(1, Math.round((pct / 100) * 5));

  return (
    <div className="flex items-center gap-2.5">
      <div className="flex items-end gap-0.5" aria-hidden>
        {[1, 2, 3, 4, 5].map((bar) => (
          <span
            key={bar}
            style={{ height: `${6 + bar * 3}px` }}
            className={cn(
              "w-1 rounded-sm bg-border transition-colors",
              bar <= activeBars && BAND_COLOR[band]
            )}
          />
        ))}
      </div>
      <span className="font-mono text-xs font-medium text-ink-soft">
        {pct}% · {BAND_COPY[band]}
      </span>
    </div>
  );
}
