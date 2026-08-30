"use client";

import { useEffect, useState } from "react";
import { UploadCloud, FileText, CheckCircle2, Info } from "lucide-react";
import { indexDocumentText, ApiError } from "@/lib/api";
import { Card, Input, Textarea, Select, Button, Badge, EmptyState } from "@/components/ui/primitives";

interface IndexedDoc {
  id: string;
  doc_name: string;
  brand: string;
  category: string;
  indexedAt: number;
}

const STORAGE_KEY = "techassist.indexed_documents";
const CATEGORY_OPTIONS = [
  "smartphone",
  "laptop",
  "television",
  "refrigerator",
  "earbuds",
  "camera",
  "router",
  "gaming_console",
  "all_electronics",
];

function loadLocalDocs(): IndexedDoc[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveLocalDocs(docs: IndexedDoc[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
}

export default function KnowledgeBasePage() {
  const [docs, setDocs] = useState<IndexedDoc[]>([]);
  const [docName, setDocName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("smartphone");
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setDocs(loadLocalDocs());
  }, []);

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    const doc_id = `doc-${Date.now()}`;
    try {
      await indexDocumentText({ doc_id, text, brand, category, doc_name: docName });
      const next = [
        { id: doc_id, doc_name: docName, brand, category, indexedAt: Date.now() },
        ...docs,
      ];
      setDocs(next);
      saveLocalDocs(next);
      setDocName("");
      setBrand("");
      setText("");
      setSuccess(`Indexed "${docName}" successfully.`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't index this document.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-semibold text-ink">Knowledge Base</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Add manuals, troubleshooting guides, and policy documents the support agent retrieves from during a conversation.
      </p>

      <Card className="mt-4 flex items-start gap-2.5 border-accent/20 bg-accent-soft p-4 text-sm text-accent">
        <Info size={16} className="mt-0.5 shrink-0" />
        <span>
          The backend currently exposes document indexing (<code className="font-mono">POST /documents/index-text</code>) but no listing or delete/re-index endpoint yet, so the list below reflects what this browser has indexed this session — add those endpoints server-side to make it fully authoritative.
        </span>
      </Card>

      <Card className="mt-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-soft">Document name</label>
            <Input
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              placeholder="Samsung Galaxy S24 User Manual"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-soft">Brand</label>
            <Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Samsung" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-ink-soft">Category</label>
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c.replace(/_/g, " ")}
                </option>
              ))}
            </Select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-ink-soft">
              Document text
            </label>
            <Textarea
              rows={8}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste the manual, troubleshooting guide, or policy text to index…"
            />
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-danger">{error}</p>}
        {success && (
          <p className="mt-3 flex items-center gap-1.5 text-sm text-accent">
            <CheckCircle2 size={14} /> {success}
          </p>
        )}

        <div className="mt-5 flex justify-end">
          <Button
            onClick={submit}
            disabled={submitting || !docName || !text || !brand}
          >
            <UploadCloud size={14} /> {submitting ? "Indexing…" : "Index document"}
          </Button>
        </div>
      </Card>

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-faint">
          Indexed this session
        </h2>
        {docs.length === 0 ? (
          <EmptyState
            title="Nothing indexed yet"
            description="Documents you index will appear here so you can track what the agent can currently retrieve."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {docs.map((d) => (
              <Card key={d.id} className="flex items-start gap-3 p-4">
                <FileText size={16} className="mt-0.5 shrink-0 text-accent" />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-ink">{d.doc_name}</div>
                  <div className="mt-0.5 text-xs text-ink-soft">{d.brand}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge className="capitalize">{d.category.replace(/_/g, " ")}</Badge>
                    <Badge tone="accent">Indexed</Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
