"use client";

import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  type?: "info" | "success" | "warning" | "danger";
  variant?: "light" | "solid" | "outlined";
  className?: string;
}

export default function Badge({ 
  children, 
  type = "info", 
  variant = "light",
  className = "" 
}: BadgeProps) {
  const baseClasses = "inline-flex items-center px-2.5 py-1 rounded-[var(--radius-md)] text-xs font-medium transition-all duration-[var(--transition-fast)]";
  
  const typeClasses = {
    info: {
      light: "bg-blue-100 text-blue-700 hover:bg-blue-200",
      solid: "bg-blue-600 text-white hover:bg-blue-700",
      outlined: "bg-transparent text-blue-700 border border-blue-300 hover:bg-blue-50",
    },
    success: {
      light: "bg-green-100 text-green-700 hover:bg-green-200",
      solid: "bg-green-600 text-white hover:bg-green-700",
      outlined: "bg-transparent text-green-700 border border-green-300 hover:bg-green-50",
    },
    warning: {
      light: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
      solid: "bg-yellow-600 text-white hover:bg-yellow-700",
      outlined: "bg-transparent text-yellow-700 border border-yellow-300 hover:bg-yellow-50",
    },
    danger: {
      light: "bg-red-100 text-red-700 hover:bg-red-200",
      solid: "bg-red-600 text-white hover:bg-red-700",
      outlined: "bg-transparent text-red-700 border border-red-300 hover:bg-red-50",
    },
  };

  return (
    <span className={`${baseClasses} ${typeClasses[type][variant]} ${className}`}>
      {children}
    </span>
  );
}

