# TechAssist AI — Frontend

Next.js (App Router) + TypeScript + Tailwind frontend for the Universal
Electronic Product Customer Support Agent. This talks to the FastAPI backend
in `backend/app/main.py` — nothing here duplicates business logic; product
identification, purchase-age parsing, order lookup, warranty math, RAG
retrieval, and escalation all happen server-side in the orchestrator.

## Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
# edit .env.local if your backend isn't on http://localhost:8000
npm run dev
```

Run the backend first (`uvicorn app.main:app --reload` from `backend/`), then
open `http://localhost:3000`.

## Pages

| Route              | Purpose                                                                 |
| ------------------- | ------------------------------------------------------------------------ |
| `/`                 | Customer-facing support chat — product ID, purchase age, issue, RAG-grounded answer, warranty, sources, confidence, escalation |
| `/customer`         | Purchase history, orders, and derived warranty status for a customer ID |
| `/products`         | Admin catalog — list + add products (`GET`/`POST /api/products`)        |
| `/knowledge-base`   | Index manuals/policies into the RAG store (`POST /api/documents/index-text`) |
| `/tickets`          | Escalated conversations (`GET /api/tickets`)                            |
| `/admin`            | Analytics derived from products + tickets                               |

## How the chat maps to the backend

`POST /api/chat` drives a server-side state machine
(`PRODUCT_IDENTIFICATION → PURCHASE_VERIFICATION → ISSUE_DIAGNOSIS → ACTIVE_SUPPORT`).
The frontend just:

1. Keeps a stable `conversation_id` (see `lib/session.ts`, persisted in
   `localStorage` so a page refresh doesn't reset the conversation) and a mock
   `customer_id` (defaults to `CUST-1001`, editable from the chat header or
   the `/customer` page).
2. Sends every user message to `/chat` and renders whatever comes back:
   `product`, `purchase`, `warranty`, `confidence`, `sources`, `tools_used`,
   `progress_step`, and `escalated`.
3. Never re-asks for information the backend has already collected — the
   slots live in the `Conversation.collected_slots` column server-side, not
   in frontend state, so a page refresh resumes correctly as long as
   `conversation_id` persists.

Safety-critical keywords ("smoke", "spark", "swollen battery", etc.) trigger
an immediate escalation payload from the backend; the UI renders that as a
red banner-style message with a ticket ID rather than as a normal answer.

## Notes on endpoints that don't fully exist yet

The backend currently implements `POST /api/documents/index-text` but not
`GET /api/documents`, delete, or re-index — so `/knowledge-base` tracks what's
been indexed *from this browser* in `localStorage` and says so explicitly,
rather than pretending to show server truth. Similarly `/admin` only charts
what's computable from `/products` and `/tickets`; conversation-level metrics
(resolution rate, average response time, issues by intent) need a real
analytics endpoint before they can be shown honestly.

## Design system

Tokens live in `tailwind.config.ts`: a cool paper background (`bg`/`surface`),
graphite ink text, and a muted circuit-green accent (`accent`) rather than
the more common warm-cream/terracotta combination — chosen to read as a
diagnostics bench rather than a marketing page. Confidence is shown as a
5-bar signal-strength meter (`components/chat/ConfidenceMeter.tsx`) to tie
back into the "electronics" subject matter instead of a generic progress bar.
