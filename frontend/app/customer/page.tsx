"use client";

import { useEffect, useState } from "react";
import { PackageCheck, ShieldCheck, ShieldAlert, RefreshCw } from "lucide-react";
import { getCustomer, getProducts, ApiError } from "@/lib/api";
import type { CustomerRecord, Product } from "@/lib/types";
import { Card, Input, Button, Badge, EmptyState, MonoChip } from "@/components/ui/primitives";
import { formatDate, cn } from "@/lib/utils";
import { getCustomerId, setCustomerId as persistCustomerId } from "@/lib/session";

function computeWarranty(purchaseDate: string, warrantyMonths: number) {
  const purchase = new Date(purchaseDate);
  const expiry = new Date(purchase);
  expiry.setMonth(expiry.getMonth() + (warrantyMonths || 12));
  const active = new Date() <= expiry;
  return { active, expiry: expiry.toISOString() };
}

export default function CustomerDashboardPage() {
  const [customerId, setCustomerIdState] = useState("CUST-1001");
  const [record, setRecord] = useState<CustomerRecord | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCustomerIdState(getCustomerId());
  }, []);

  const load = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const [cust, prods] = await Promise.all([getCustomer(id), getProducts()]);
      setRecord(cust);
      setProducts(prods);
    } catch (err) {
      setRecord(null);
      setError(err instanceof ApiError ? err.message : "Couldn't load this customer's account.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) load(customerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const productById = (id: string) => products.find((p) => p.product_id === id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">My Products</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Purchase history, warranty status, and orders for your account.
          </p>
        </div>
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            persistCustomerId(customerId);
            load(customerId);
          }}
        >
          <Input
            className="w-44 font-mono"
            value={customerId}
            onChange={(e) => setCustomerIdState(e.target.value)}
            placeholder="CUST-1001"
          />
          <Button type="submit" variant="secondary" size="sm">
            <RefreshCw size={13} /> Load
          </Button>
        </form>
      </div>

      {error && (
        <Card className="mt-6 border-danger/30 bg-danger-soft p-4 text-sm text-danger">
          {error}
        </Card>
      )}

      {loading && (
        <div className="mt-8 text-sm text-ink-faint">Loading account…</div>
      )}

      {!loading && record && (
        <div className="mt-6 space-y-6">
          <Card className="flex items-center justify-between p-5">
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-ink-faint">
                Account
              </div>
              <div className="mt-1 font-display text-lg font-semibold text-ink">
                {record.customer}
              </div>
              <div className="text-sm text-ink-soft">{record.email}</div>
            </div>
            <MonoChip>{customerId}</MonoChip>
          </Card>

          {(!record.orders || record.orders.length === 0) ? (
            <EmptyState
              title="No purchases on file"
              description="Once this customer has an order in the system, it will show up here with live warranty status."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {record.orders.map((order) => {
                const product = productById(order.product_id);
                const warranty = product
                  ? computeWarranty(order.purchase_date, product.warranty_months || 12)
                  : null;
                return (
                  <Card key={order.order_id} className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-display text-base font-semibold text-ink">
                          {product ? `${product.brand} ${product.product_name}` : order.product_id}
                        </div>
                        {product?.model && (
                          <div className="text-xs text-ink-soft">{product.model}</div>
                        )}
                      </div>
                      <Badge tone={order.order_status === "Delivered" ? "accent" : "neutral"}>
                        <PackageCheck size={12} /> {order.order_status}
                      </Badge>
                    </div>

                    <dl className="mt-4 space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-ink-faint">Purchased</dt>
                        <dd className="text-ink">{formatDate(order.purchase_date)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-ink-faint">Order</dt>
                        <dd><MonoChip>{order.order_id}</MonoChip></dd>
                      </div>
                    </dl>

                    {warranty && (
                      <div
                        className={cn(
                          "mt-4 flex items-center gap-2 rounded-lg px-3 py-2",
                          warranty.active ? "bg-accent-soft" : "bg-danger-soft"
                        )}
                      >
                        {warranty.active ? (
                          <ShieldCheck size={15} className="text-accent" />
                        ) : (
                          <ShieldAlert size={15} className="text-danger" />
                        )}
                        <span
                          className={cn(
                            "text-sm font-medium",
                            warranty.active ? "text-accent" : "text-danger"
                          )}
                        >
                          Warranty {warranty.active ? "active" : "expired"}
                        </span>
                        <span className="ml-auto text-xs text-ink-soft">
                          {warranty.active ? "until" : "since"} {formatDate(warranty.expiry)}
                        </span>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
