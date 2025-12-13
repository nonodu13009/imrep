import { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export default function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={`bg-white rounded-lg border border-[#e5e7eb] p-5 shadow-[0_2px_6px_rgba(0,0,0,0.06)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

