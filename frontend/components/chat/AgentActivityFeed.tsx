import { Check } from "lucide-react";

const TOOL_LABELS: Record<string, string> = {
  search_product_catalog: "Identified product",
  get_order_by_product_or_customer: "Searched purchase history",
  evaluate_warranty: "Checked warranty",
  search_knowledge_base: "Searched product documentation",
  create_escalation_ticket: "Created support ticket",
};

export default function AgentActivityFeed({ toolsUsed }: { toolsUsed: string[] }) {
  const seen = Array.from(new Set(toolsUsed));
  if (seen.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
        Agent activity
      </div>
      <ul className="space-y-1.5">
        {seen.map((tool) => (
          <li key={tool} className="flex items-center gap-2 text-xs text-ink-soft">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent-soft text-accent">
              <Check size={10} />
            </span>
            {TOOL_LABELS[tool] || tool}
          </li>
        ))}
      </ul>
    </div>
  );
}
