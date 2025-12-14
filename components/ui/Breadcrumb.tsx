"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <nav className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] mb-4 animate-fade-in">
      <Link
        href="/dashboard"
        className="flex items-center hover:text-[var(--color-primary)] transition-colors duration-[var(--transition-base)]"
      >
        <Home size={16} />
      </Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight size={16} className="text-[var(--color-neutral-400)]" />
          {item.href && index < items.length - 1 ? (
            <Link
              href={item.href}
              className="hover:text-[var(--color-primary)] transition-colors duration-[var(--transition-base)]"
            >
              {item.label}
            </Link>
          ) : (
            <span className={index === items.length - 1 ? "text-[var(--color-text-primary)] font-medium" : ""}>
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}

