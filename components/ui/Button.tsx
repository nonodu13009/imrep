"use client";

import { ButtonHTMLAttributes, ReactNode, useRef, useState } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  isLoading?: boolean;
  children: ReactNode;
}

export default function Button({
  variant = "primary",
  isLoading = false,
  children,
  className = "",
  disabled,
  onClick,
  ...props
}: ButtonProps) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rippleIdRef = useRef(0);

  const baseClasses = "relative px-4 py-2 rounded-[var(--radius-md)] font-medium transition-all duration-[var(--transition-base)] overflow-hidden active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variantClasses = {
    primary: "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] hover:shadow-lg hover:-translate-y-0.5 focus:ring-[var(--color-primary)]",
    secondary: "bg-[var(--color-neutral-200)] text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-300)] hover:shadow-md focus:ring-[var(--color-neutral-500)]",
    danger: "bg-[var(--color-danger)] text-white hover:bg-[#dc2626] hover:shadow-lg hover:-translate-y-0.5 focus:ring-[var(--color-danger)]",
    ghost: "bg-transparent text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 hover:shadow-sm focus:ring-[var(--color-primary)]",
  };

  const isDisabled = disabled || isLoading;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled || isLoading) return;

    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = rippleIdRef.current++;

    setRipples((prev) => [...prev, { x, y, id }]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== id));
    }, 600);

    onClick?.(e);
  };

  return (
    <button
      ref={buttonRef}
      className={`${baseClasses} ${variantClasses[variant]} ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${className}`}
      disabled={isDisabled}
      onClick={handleClick}
      {...props}
    >
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 pointer-events-none"
          style={{
            left: `${ripple.x}px`,
            top: `${ripple.y}px`,
            width: "10px",
            height: "10px",
            transform: "translate(-50%, -50%)",
            animation: "ripple 600ms ease-out",
          }}
        />
      ))}
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Chargement…</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}

