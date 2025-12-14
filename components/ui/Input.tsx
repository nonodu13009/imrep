"use client";

import { InputHTMLAttributes, useId, useState, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  prefixIcon?: ReactNode;
  suffixIcon?: ReactNode;
  helpText?: string;
  floatingLabel?: boolean;
}

export default function Input({
  label,
  error,
  success = false,
  prefixIcon,
  suffixIcon,
  helpText,
  floatingLabel = false,
  className = "",
  id,
  value,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value !== undefined && value !== null && value !== "";

  const baseInputClasses = "w-full border rounded-[var(--radius-md)] px-3 py-2 transition-all duration-[var(--transition-base)] focus:outline-none focus:ring-2";
  const stateClasses = error
    ? "border-[var(--color-danger)] focus:ring-[var(--color-danger)] focus:border-[var(--color-danger)]"
    : success
    ? "border-[var(--color-success)] focus:ring-[var(--color-success)] focus:border-[var(--color-success)]"
    : "border-[var(--color-neutral-200)] focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]";

  if (floatingLabel && label) {
    return (
      <div className="w-full relative">
        <div className="relative">
          {prefixIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-neutral-500)]">
              {prefixIcon}
            </div>
          )}
          <input
            id={inputId}
            value={value}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`${baseInputClasses} ${stateClasses} ${prefixIcon ? "pl-10" : ""} ${suffixIcon ? "pr-10" : ""} ${className}`}
            {...props}
          />
          {suffixIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-neutral-500)]">
              {suffixIcon}
            </div>
          )}
          <label
            htmlFor={inputId}
            className={`absolute left-3 transition-all duration-[var(--transition-base)] pointer-events-none ${
              isFocused || hasValue
                ? "top-2 text-xs text-[var(--color-primary)] bg-white px-1"
                : "top-1/2 -translate-y-1/2 text-sm text-[var(--color-neutral-500)]"
            } ${prefixIcon ? "left-10" : ""}`}
          >
            {label}
          </label>
        </div>
        {error && (
          <p className="mt-2 text-sm text-[var(--color-danger)] animate-fade-in">{error}</p>
        )}
        {!error && helpText && (
          <p className="mt-2 text-xs text-[var(--color-text-secondary)]">{helpText}</p>
        )}
      </div>
    );
  }

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
      <div className="relative">
        {prefixIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-neutral-500)]">
            {prefixIcon}
          </div>
        )}
        <input
          id={inputId}
          value={value}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`${baseInputClasses} ${stateClasses} ${prefixIcon ? "pl-10" : ""} ${suffixIcon ? "pr-10" : ""} ${className}`}
          {...props}
        />
        {suffixIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-neutral-500)]">
            {suffixIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-[var(--color-danger)] animate-fade-in">{error}</p>
      )}
      {!error && helpText && (
        <p className="mt-2 text-xs text-[var(--color-text-secondary)]">{helpText}</p>
      )}
    </div>
  );
}

