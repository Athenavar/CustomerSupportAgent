import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(input?: string | null): string {
  if (!input) return "—";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function confidenceBand(confidence: number): "high" | "medium" | "low" {
  const pct = confidence <= 1 ? confidence * 100 : confidence;
  if (pct >= 90) return "high";
  if (pct >= 70) return "medium";
  return "low";
}

export function toPercent(confidence: number): number {
  const pct = confidence <= 1 ? confidence * 100 : confidence;
  return Math.max(0, Math.min(100, Math.round(pct)));
}
