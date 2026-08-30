"use client";

import { useEffect, useMemo, useState } from "react";
import { Info } from "lucide-react";
import { getProducts, getTickets, ApiError } from "@/lib/api";
import type { Product, SupportTicket } from "@/lib/types";
import { Card, StatCard } from "@/components/ui/primitives";
import { CategoryBarChart, StatusBarChart } from "@/components/admin/Charts";
import { toPercent } from "@/lib/utils";

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [p, t] = await Promise.all([getProducts(), getTickets()]);
        setProducts(p);
        setTickets(t);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Couldn't load analytics data.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const categoryData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) {
      const key = p.category || "other";
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return Array.from(counts.entries()).map(([category, count]) => ({ category, count }));
  }, [products]);

  const statusData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of tickets) {
      const key = t.status || "OPEN";
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return Array.from(counts.entries()).map(([status, count]) => ({ status, count }));
  }, [tickets]);

  const avgConfidence = useMemo(() => {
    const scored = tickets.filter((t) => typeof t.confidence_score === "number");
    if (scored.length === 0) return null;
    const sum = scored.reduce((acc, t) => acc + (t.confidence_score || 0), 0);
    return toPercent(sum / scored.length);
  }, [tickets]);

  const safetyTickets = useMemo(
    () => tickets.filter((t) => (t.escalation_reason || "").toLowerCase().includes("safety")).length,
    [tickets]
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-semibold text-ink">Admin Analytics</h1>
      <p className="mt-1 text-sm text-ink-soft">
        A live view of catalog coverage and escalations, computed from the products and tickets endpoints.
      </p>

      <Card className="mt-4 flex items-start gap-2.5 border-accent/20 bg-accent-soft p-4 text-sm text-accent">
        <Info size={16} className="mt-0.5 shrink-0" />
        <span>
          These metrics are derived client-side from <code className="font-mono">/products</code> and{" "}
          <code className="font-mono">/tickets</code>. Conversation-level metrics (resolution rate, average
          response time, issues by intent) need a dedicated analytics endpoint on the backend to be accurate —
          they aren't fabricated here.
        </span>
      </Card>

      {error && (
        <Card className="mt-6 border-danger/30 bg-danger-soft p-4 text-sm text-danger">
          {error}
        </Card>
      )}

      {loading ? (
        <div className="mt-8 text-sm text-ink-faint">Loading analytics…</div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Products" value={products.length} />
            <StatCard label="Total Tickets" value={tickets.length} />
            <StatCard label="Safety Escalations" value={safetyTickets} hint="issue_summary flagged as hazardous" />
            <StatCard
              label="Avg. Escalation Confidence"
              value={avgConfidence !== null ? `${avgConfidence}%` : "—"}
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card className="p-5">
              <div className="mb-3 text-sm font-semibold text-ink">Products by category</div>
              {categoryData.length > 0 ? (
                <CategoryBarChart data={categoryData} />
              ) : (
                <p className="text-sm text-ink-faint">No products in the catalog yet.</p>
              )}
            </Card>
            <Card className="p-5">
              <div className="mb-3 text-sm font-semibold text-ink">Tickets by status</div>
              {statusData.length > 0 ? (
                <StatusBarChart data={statusData} />
              ) : (
                <p className="text-sm text-ink-faint">No tickets have been created yet.</p>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
