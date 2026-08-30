"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LifeBuoy, User, Package, BookOpen, Ticket, LayoutDashboard, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Support", icon: LifeBuoy },
  { href: "/customer", label: "My Products", icon: User },
  { href: "/products", label: "Products", icon: Package },
  { href: "/knowledge-base", label: "Knowledge Base", icon: BookOpen },
  { href: "/tickets", label: "Tickets", icon: Ticket },
  { href: "/admin", label: "Admin", icon: LayoutDashboard },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-white">
            <Cpu size={18} />
          </span>
          <span className="font-display text-[15px] font-semibold tracking-tight text-ink">
            TechAssist <span className="text-accent">AI</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent-soft text-accent"
                    : "text-ink-soft hover:bg-surface-raised hover:text-ink"
                )}
              >
                <Icon size={15} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex md:hidden">
          <select
            className="rounded-lg border border-border bg-white px-2.5 py-1.5 text-sm"
            value={pathname || "/"}
            onChange={(e) => {
              window.location.href = e.target.value;
            }}
          >
            {LINKS.map((l) => (
              <option key={l.href} value={l.href}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
