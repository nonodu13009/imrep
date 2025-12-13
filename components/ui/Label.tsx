import { LabelHTMLAttributes, ReactNode } from "react";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode;
}

export default function Label({ children, className = "", ...props }: LabelProps) {
  return (
    <label
      className={`block text-sm font-medium text-[var(--color-neutral-700)] mb-2 ${className}`}
      {...props}
    >
      {children}
    </label>
  );
}

