"use client";

import { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: "default" | "elevated" | "outlined" | "interactive";
}

export default function Card({ 
  children, 
  variant = "default",
  className = "", 
  ...props 
}: CardProps) {
  const baseClasses = "bg-white rounded-lg transition-all duration-[var(--transition-base)]";
  
  const variantClasses = {
    default: "border border-[#e5e7eb] p-5 shadow-[var(--shadow-card)]",
    elevated: "border-0 p-5 shadow-[var(--elevation-2)]",
    outlined: "border-2 border-[var(--color-neutral-200)] p-5 shadow-none",
    interactive: "border border-[#e5e7eb] p-5 shadow-[var(--shadow-card)] cursor-pointer hover:shadow-[var(--elevation-3)] hover:border-[var(--color-primary)] hover:-translate-y-0.5",
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

