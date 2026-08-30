// The backend keys conversation state (backend/app/database/models.py -> Conversation)
// by conversation_id, and keys purchase history by customer_id. The frontend just
// needs to keep both stable across a browsing session so the state machine on the
// server (PRODUCT_IDENTIFICATION -> PURCHASE_VERIFICATION -> ISSUE_DIAGNOSIS -> ...)
// isn't reset on every message.

const CONVERSATION_KEY = "techassist.conversation_id";
const CUSTOMER_KEY = "techassist.customer_id";
const DEFAULT_CUSTOMER_ID = "CUST-1001";

function safeRandomId(prefix: string): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${rand}`;
}

export function getOrCreateConversationId(): string {
  if (typeof window === "undefined") return safeRandomId("conv");
  let id = window.localStorage.getItem(CONVERSATION_KEY);
  if (!id) {
    id = safeRandomId("conv");
    window.localStorage.setItem(CONVERSATION_KEY, id);
  }
  return id;
}

export function resetConversationId(): string {
  const id = safeRandomId("conv");
  if (typeof window !== "undefined") {
    window.localStorage.setItem(CONVERSATION_KEY, id);
  }
  return id;
}

export function getCustomerId(): string {
  if (typeof window === "undefined") return DEFAULT_CUSTOMER_ID;
  return window.localStorage.getItem(CUSTOMER_KEY) || DEFAULT_CUSTOMER_ID;
}

export function setCustomerId(id: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CUSTOMER_KEY, id || DEFAULT_CUSTOMER_ID);
}

export { DEFAULT_CUSTOMER_ID };
