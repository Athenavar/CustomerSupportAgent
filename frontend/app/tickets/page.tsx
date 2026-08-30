"use client";

import { useEffect, useState } from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { getTickets, ApiError } from "@/lib/api";
import type { SupportTicket } from "@/lib/types";
import { Card, Badge, Button, EmptyState, MonoChip } from "@/components/ui/primitives";
import { formatDate, toPercent } from "@/lib/utils";

function statusTone(status: string): "accent" | "warn" | "danger" | "neutral" {
  switch (status?.toUpperCase()) {
    case "RESOLVED":
      return "accent";
    case "IN_PROGRESS":
      return "warn";
    case "OPEN":
      return "danger";
    default:
      return "neutral";
  }
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setTickets(await getTickets());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load support tickets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Support Tickets</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Conversations the agent escalated — low confidence, safety-critical issues, or a customer request for a human.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={load}>
          <RefreshCw size={13} /> Refresh
        </Button>
      </div>

      {error && (
        <Card className="mt-6 border-danger/30 bg-danger-soft p-4 text-sm text-danger">
          {error}
        </Card>
      )}

      {loading && <div className="mt-8 text-sm text-ink-faint">Loading tickets…</div>}

      {!loading && !error && tickets.length === 0 && (
        <div className="mt-8">
          <EmptyState
            title="No tickets yet"
            description="When the agent can't safely resolve an issue on its own, it opens a ticket here for a specialist."
          />
        </div>
      )}

      {!loading && tickets.length > 0 && (
        <div className="mt-6 space-y-3">
          {tickets.map((t) => (
            <Card key={t.ticket_id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <MonoChip>{t.ticket_id}</MonoChip>
                    <Badge tone={statusTone(t.status)}>{t.status}</Badge>
                    {t.escalation_reason?.toLowerCase().includes("safety") && (
                      <Badge tone="danger">
                        <AlertTriangle size={11} /> Safety
                      </Badge>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-ink">{t.issue_summary}</p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft">
                    {t.customer_id && <span>Customer: {t.customer_id}</span>}
                    {t.product_id && <span>Product: {t.product_id}</span>}
                    {t.escalation_reason && <span>Reason: {t.escalation_reason}</span>}
                  </div>
                </div>
                <div className="text-right">
                  {typeof t.confidence_score === "number" && (
                    <div className="font-mono text-xs text-ink-soft">
                      {toPercent(t.confidence_score)}% confidence
                    </div>
                  )}
                  <div className="mt-1 text-xs text-ink-faint">{formatDate(t.created_at)}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
