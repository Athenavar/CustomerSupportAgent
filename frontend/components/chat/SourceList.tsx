import { FileText } from "lucide-react";
import type { SourceCitation } from "@/lib/types";

export default function SourceList({ sources }: { sources: SourceCitation[] }) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-3 border-t border-border pt-3">
      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
        Sources
      </div>
      <ul className="space-y-1">
        {sources.map((s, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-ink-soft">
            <FileText size={13} className="mt-0.5 shrink-0 text-accent" />
            <span>
              {s.title}
              {s.section ? ` — ${s.section}` : ""}
              {s.page ? ` (p.${s.page})` : ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
