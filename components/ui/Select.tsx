"use client";

import { SelectHTMLAttributes, ReactNode, useId } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: ReactNode;
}

export default function Select({ label, error, className = "", id, children, ...props }: SelectProps) {
  const generatedId = useId();
  const selectId = id || generatedId;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-[14px] font-medium text-[var(--color-dark)] mb-2"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full border border-[var(--color-neutral-200)] rounded-[var(--radius-md)] px-3 py-2 focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none bg-white ${error ? "border-[var(--color-danger)] focus:ring-[var(--color-danger)]" : ""} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="mt-2 text-sm text-[var(--color-danger)]">{error}</p>
      )}
    </div>
  );
}

