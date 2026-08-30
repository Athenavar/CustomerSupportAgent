// Mirrors backend/app/agents/orchestrator.py response payloads
// and backend/app/database/models.py table shapes.

export type ProgressStep =
  | "Product"
  | "Purchase"
  | "Issue"
  | "Verification"
  | "Analysis"
  | "Complete"
  | "Escalated";

export interface ProductSummary {
  brand: string;
  model: string;
  category: string;
}

export interface WarrantyInfo {
  status: "Active" | "Expired" | "Unverified" | string;
  purchase_date?: string;
  expiry_date?: string;
  warranty_period_months?: number;
}

export interface PurchaseInfo {
  order_id: string;
  purchase_date: string;
}

export interface SourceCitation {
  title: string;
  page: number;
  section: string;
}

export interface ChatResponse {
  answer: string;
  intent?: string;
  product?: ProductSummary;
  warranty?: WarrantyInfo;
  purchase?: PurchaseInfo;
  confidence: number;
  sources: SourceCitation[];
  tools_used: string[];
  progress_step?: ProgressStep | string;
  escalated?: boolean;
}

export type ChatSender = "user" | "assistant";

export interface ChatMessage {
  id: string;
  sender: ChatSender;
  content: string;
  meta?: ChatResponse;
  createdAt: number;
}

// backend/app/database/models.py -> Product
export interface Product {
  product_id: string;
  brand: string;
  product_name: string;
  model: string;
  category: string;
  subcategory?: string | null;
  release_year?: number | null;
  specifications?: Record<string, unknown> | null;
  warranty_months?: number;
  manufacturer?: string | null;
}

// backend/app/database/models.py -> Order
export interface Order {
  order_id: string;
  customer_id: string;
  product_id: string;
  purchase_date: string;
  order_status: string;
  serial_number?: string;
}

// backend/app/database/models.py -> SupportTicket
export interface SupportTicket {
  ticket_id: string;
  customer_id?: string;
  product_id?: string;
  order_id?: string;
  issue_summary?: string;
  escalation_reason?: string;
  confidence_score?: number;
  status: "OPEN" | "RESOLVED" | "IN_PROGRESS" | string;
  created_at: string;
}

export interface CustomerRecord {
  customer: string;
  email: string;
  orders: Order[];
}

export const PRODUCT_CATEGORIES = [
  { label: "Phones", icon: "Smartphone" },
  { label: "Laptops", icon: "Laptop" },
  { label: "TVs", icon: "Tv" },
  { label: "Audio", icon: "Headphones" },
  { label: "Cameras", icon: "Camera" },
  { label: "Appliances", icon: "Refrigerator" },
  { label: "Gaming", icon: "Gamepad2" },
  { label: "Networking", icon: "Router" },
] as const;
