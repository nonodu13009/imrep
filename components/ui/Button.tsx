"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  isLoading?: boolean;
  children: ReactNode;
}

export default function Button({
  variant = "primary",
  isLoading = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = "px-4 py-2 rounded-[var(--radius-md)] font-medium transition active:scale-[0.98]";
  
  const variantClasses = {
    primary: "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]",
    secondary: "bg-[var(--color-neutral-200)] text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-300)]",
    danger: "bg-[var(--color-danger)] text-white hover:bg-[#dc2626]",
  };

  const isDisabled = disabled || isLoading;

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${isDisabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? "Chargement…" : children}
    </button>
  );
}

