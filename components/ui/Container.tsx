import { HTMLAttributes, ReactNode } from "react";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export default function Container({ children, className = "", ...props }: ContainerProps) {
  return (
    <div
      className={`max-w-screen-xl mx-auto px-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

