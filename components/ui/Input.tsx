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
          className="block text-[14px] font-medium text-[#1e293b] mb-2"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full border border-[#d1d5db] rounded-[10px] px-3 py-2 focus:ring-2 focus:ring-[#2563eb] focus:outline-none ${error ? "border-[#ef4444] focus:ring-[#ef4444]" : ""} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-[#ef4444]">{error}</p>
      )}
    </div>
  );
}

