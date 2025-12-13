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
  const baseClasses = "px-4 py-2 rounded-[10px] font-medium transition active:scale-[0.98]";
  
  const variantClasses = {
    primary: "bg-[#2563eb] text-white hover:bg-[#1d4ed8]",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    danger: "bg-[#ef4444] text-white hover:bg-[#dc2626]",
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

