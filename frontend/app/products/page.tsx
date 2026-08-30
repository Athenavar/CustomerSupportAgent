"use client";

import { useEffect, useState } from "react";
import { Plus, X, Boxes } from "lucide-react";
import { getProducts, createProduct, ApiError } from "@/lib/api";
import type { Product } from "@/lib/types";
import { Card, Input, Select, Button, Badge, EmptyState, MonoChip } from "@/components/ui/primitives";

const CATEGORY_OPTIONS = [
  "smartphone",
  "laptop",
  "television",
  "refrigerator",
  "washing_machine",
  "earbuds",
  "camera",
  "router",
  "gaming_console",
  "smartwatch",
  "printer",
  "monitor",
  "other",
];

function emptyForm() {
  return {
    product_id: "",
    brand: "",
    product_name: "",
    model: "",
    category: "smartphone",
    warranty_months: 12,
  };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setProducts(await getProducts());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load the product catalog.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const suggestId = () => {
    const slug = `${form.brand}-${form.model}`
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    return slug || `PROD-${Date.now()}`;
  };

  const submit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = { ...form, product_id: form.product_id || suggestId() };
      await createProduct(payload);
      setForm(emptyForm());
      setShowForm(false);
      await load();
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Couldn't save this product.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Product Catalog</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Products the support agent can recognize, retrieve documentation for, and evaluate warranty against.
          </p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? <X size={14} /> : <Plus size={14} />}
          {showForm ? "Cancel" : "Add product"}
        </Button>
      </div>

      {showForm && (
        <Card className="mt-6 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-soft">Brand</label>
              <Input
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                placeholder="Samsung"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-soft">Product name</label>
              <Input
                value={form.product_name}
                onChange={(e) => setForm({ ...form, product_name: e.target.value })}
                placeholder="Galaxy S24"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-soft">Model</label>
              <Input
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                placeholder="SM-S921B"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-soft">Category</label>
              <Select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c.replace(/_/g, " ")}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-soft">
                Warranty (months)
              </label>
              <Input
                type="number"
                min={0}
                value={form.warranty_months}
                onChange={(e) =>
                  setForm({ ...form, warranty_months: Number(e.target.value) || 0 })
                }
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-soft">
                Product ID <span className="text-ink-faint">(auto-generated if left blank)</span>
              </label>
              <Input
                className="font-mono"
                value={form.product_id}
                onChange={(e) => setForm({ ...form, product_id: e.target.value })}
                placeholder={suggestId()}
              />
            </div>
          </div>

          {submitError && <p className="mt-3 text-sm text-danger">{submitError}</p>}

          <div className="mt-5 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button
              onClick={submit}
              disabled={submitting || !form.brand || !form.product_name || !form.model}
            >
              {submitting ? "Saving…" : "Save product"}
            </Button>
          </div>
        </Card>
      )}

      {error && (
        <Card className="mt-6 border-danger/30 bg-danger-soft p-4 text-sm text-danger">
          {error}
        </Card>
      )}

      {loading && <div className="mt-8 text-sm text-ink-faint">Loading catalog…</div>}

      {!loading && !error && products.length === 0 && (
        <div className="mt-8">
          <EmptyState
            title="No products yet"
            description="Add a product so the support agent can identify it, retrieve its manual, and evaluate warranty claims."
            action={<Button onClick={() => setShowForm(true)}><Plus size={14} /> Add product</Button>}
          />
        </div>
      )}

      {!loading && products.length > 0 && (
        <Card className="mt-8 overflow-hidden p-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-raised text-xs uppercase tracking-wide text-ink-faint">
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Brand</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Warranty</th>
                <th className="px-5 py-3 font-medium">Product ID</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.product_id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2 font-medium text-ink">
                      <Boxes size={14} className="text-accent" />
                      {p.product_name}
                    </div>
                    <div className="pl-6 text-xs text-ink-faint">{p.model}</div>
                  </td>
                  <td className="px-5 py-3.5 text-ink-soft">{p.brand}</td>
                  <td className="px-5 py-3.5">
                    <Badge className="capitalize">{p.category?.replace(/_/g, " ")}</Badge>
                  </td>
                  <td className="px-5 py-3.5 text-ink-soft">{p.warranty_months ?? 12} mo</td>
                  <td className="px-5 py-3.5">
                    <MonoChip>{p.product_id}</MonoChip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
