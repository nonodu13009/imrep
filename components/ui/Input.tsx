"use client";

import { InputHTMLAttributes, useId } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({
  label,
  error,
  className = "",
  id,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-[14px] font-medium text-[var(--color-dark)] mb-2"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full border border-[var(--color-neutral-200)] rounded-[var(--radius-md)] px-3 py-2 focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none ${error ? "border-[var(--color-danger)] focus:ring-[var(--color-danger)]" : ""} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-[var(--color-danger)]">{error}</p>
      )}
    </div>
  );
}

