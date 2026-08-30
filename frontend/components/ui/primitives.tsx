import { ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-bright focus-visible:ring-offset-2 focus-visible:ring-offset-bg";
  const variants: Record<string, string> = {
    primary: "bg-ink text-white hover:bg-accent",
    secondary: "bg-white text-ink border border-border hover:border-accent hover:text-accent",
    ghost: "text-ink-soft hover:text-ink hover:bg-surface-raised",
    danger: "bg-danger text-white hover:bg-danger/90",
  };
  const sizes: Record<string, string> = {
    sm: "text-sm px-3 py-1.5",
    md: "text-sm px-4 py-2.5",
    lg: "text-base px-5 py-3",
  };
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface shadow-panel",
        className
      )}
      {...props}
    />
  );
}

export function Badge({
  className,
  tone = "neutral",
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "accent" | "warn" | "danger";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-surface-raised text-ink-soft border-border",
    accent: "bg-accent-soft text-accent border-accent/20",
    warn: "bg-warn-soft text-warn border-warn/20",
    danger: "bg-danger-soft text-danger border-danger/20",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent-bright/20",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent-bright/20",
        className
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent-bright/20",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function StatCard({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  className?: string;
}) {
  return (
    <Card className={cn("p-5", className)}>
      <div className="text-xs font-medium uppercase tracking-wide text-ink-faint">
        {label}
      </div>
      <div className="mt-2 font-display text-3xl font-semibold text-ink">
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-ink-soft">{hint}</div>}
    </Card>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface-raised px-6 py-14 text-center">
      <div className="font-display text-lg font-semibold text-ink">{title}</div>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-ink-soft">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function LiveDot({ className }: { className?: string }) {
  return (
    <span className={cn("relative flex h-2 w-2", className)}>
      <span className="absolute inline-flex h-full w-full animate-pulseDot rounded-full bg-accent" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
    </span>
  );
}

export function MonoChip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-raised px-2 py-1 font-mono text-[11px] font-medium tracking-wide text-ink-soft",
        className
      )}
    >
      {children}
    </span>
  );
}
