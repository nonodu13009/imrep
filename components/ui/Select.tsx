"use client";

import { SelectHTMLAttributes, ReactNode } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: ReactNode;
}

export default function Select({ label, error, className = "", id, children, ...props }: SelectProps) {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-[14px] font-medium text-[#1e293b] mb-2"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full border border-[#d1d5db] rounded-[10px] px-3 py-2 focus:ring-2 focus:ring-[#2563eb] focus:outline-none bg-white ${error ? "border-[#ef4444] focus:ring-[#ef4444]" : ""} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="mt-2 text-sm text-[#ef4444]">{error}</p>
      )}
    </div>
  );
}

