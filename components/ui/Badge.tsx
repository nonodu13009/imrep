import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  type?: "info" | "success" | "warning" | "danger";
  className?: string;
}

export default function Badge({ children, type = "info", className = "" }: BadgeProps) {
  const typeClasses = {
    info: "bg-blue-100 text-blue-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    danger: "bg-red-100 text-red-700",
  };

  return (
    <span className={`px-2 py-1 rounded-md text-sm ${typeClasses[type]} ${className}`}>
      {children}
    </span>
  );
}

