import { ShieldCheck, ShieldAlert, ShieldQuestion, PackageSearch } from "lucide-react";
import type { ProductSummary, PurchaseInfo, WarrantyInfo } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { MonoChip } from "@/components/ui/primitives";
import ProgressTracker from "./ProgressTracker";
import AgentActivityFeed from "./AgentActivityFeed";

function WarrantyRow({ warranty }: { warranty?: WarrantyInfo }) {
  if (!warranty) return null;

  const status = warranty.status?.toLowerCase();
  const config =
    status === "active"
      ? { icon: ShieldCheck, tone: "text-accent", bg: "bg-accent-soft", label: "Active" }
      : status === "expired"
      ? { icon: ShieldAlert, tone: "text-danger", bg: "bg-danger-soft", label: "Expired" }
      : { icon: ShieldQuestion, tone: "text-warn", bg: "bg-warn-soft", label: "Unverified" };

  const Icon = config.icon;

  return (
    <div>
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
        Warranty
      </div>
      <div className={`flex items-center gap-2 rounded-lg ${config.bg} px-3 py-2`}>
        <Icon size={16} className={config.tone} />
        <span className={`text-sm font-medium ${config.tone}`}>{config.label}</span>
      </div>
      {warranty.expiry_date && (
        <div className="mt-1.5 text-xs text-ink-soft">
          {status === "expired" ? "Expired" : "Expires"} {formatDate(warranty.expiry_date)}
        </div>
      )}
    </div>
  );
}

export default function ProductContextPanel({
  product,
  purchase,
  warranty,
  purchaseAgeInput,
  progressStep,
  escalated,
  toolsUsed,
}: {
  product?: ProductSummary;
  purchase?: PurchaseInfo;
  warranty?: WarrantyInfo;
  purchaseAgeInput?: string;
  progressStep?: string;
  escalated?: boolean;
  toolsUsed: string[];
}) {
  return (
    <aside className="thin-scroll h-full space-y-6 overflow-y-auto p-5">
      <div>
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
          Product
        </div>
        {product ? (
          <div>
            <div className="font-display text-base font-semibold text-ink">
              {product.brand} {product.model}
            </div>
            <div className="mt-0.5 text-xs capitalize text-ink-soft">{product.category}</div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-ink-faint">
            <PackageSearch size={15} /> Not identified yet
          </div>
        )}
      </div>

      <div>
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
          Purchase
        </div>
        {purchase ? (
          <div className="space-y-1.5 text-sm text-ink">
            <div>{formatDate(purchase.purchase_date)}</div>
            <MonoChip>{purchase.order_id}</MonoChip>
          </div>
        ) : (
          <div className="text-sm text-ink-faint">{purchaseAgeInput || "Not provided yet"}</div>
        )}
      </div>

      <WarrantyRow warranty={warranty} />

      <div className="border-t border-border pt-5">
        <ProgressTracker progressStep={progressStep} escalated={escalated} />
      </div>

      <div className="border-t border-border pt-5">
        <AgentActivityFeed toolsUsed={toolsUsed} />
      </div>
    </aside>
  );
}
