import type {
  ChatResponse,
  CustomerRecord,
  Product,
  SupportTicket,
} from "./types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8000/api";

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
    });
  } catch {
    throw new ApiError(
      `Couldn't reach the TechAssist backend at ${BASE_URL}. Confirm the FastAPI server is running and NEXT_PUBLIC_API_BASE_URL is set correctly.`
    );
  }

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body?.detail || detail;
    } catch {
      // response wasn't JSON, keep statusText
    }
    throw new ApiError(detail, res.status);
  }

  // Some endpoints (e.g. health) may return empty bodies.
  const text = await res.text();
  return (text ? JSON.parse(text) : {}) as T;
}

// POST /api/chat -> backend/app/api/routes.py:chat_endpoint
export function sendChatMessage(params: {
  conversation_id: string;
  customer_id: string;
  message: string;
}): Promise<ChatResponse> {
  return request<ChatResponse>("/chat", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

// GET /api/products
export function getProducts(): Promise<Product[]> {
  return request<Product[]>("/products");
}

// POST /api/products
export function createProduct(payload: {
  product_id: string;
  brand: string;
  product_name: string;
  model: string;
  category: string;
  warranty_months: number;
}): Promise<{ status: string; product_id: string }> {
  return request("/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// GET /api/customers/{customer_id}
export function getCustomer(customerId: string): Promise<CustomerRecord> {
  return request<CustomerRecord>(`/customers/${encodeURIComponent(customerId)}`);
}

// GET /api/tickets
export function getTickets(): Promise<SupportTicket[]> {
  return request<SupportTicket[]>("/tickets");
}

// POST /api/documents/index-text -> backend/app/api/routes.py:index_document_text
// Note: this endpoint takes its fields as query params (no request model defined
// server-side), so they're sent on the query string rather than as a JSON body.
export function indexDocumentText(params: {
  doc_id: string;
  text: string;
  brand: string;
  category: string;
  doc_name: string;
}): Promise<{ status: string; id: string }> {
  const qs = new URLSearchParams(params).toString();
  return request(`/documents/index-text?${qs}`, { method: "POST" });
}

// GET /api/health
export function checkHealth(): Promise<{ status: string; service: string }> {
  return request("/health");
}

export { BASE_URL as API_BASE_URL };
