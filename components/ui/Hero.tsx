import { ReactNode } from "react";
import Button from "./Button";

interface HeroProps {
  title: string;
  subtitle?: string;
  primaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  secondaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  children?: ReactNode;
}

export default function Hero({
  title,
  subtitle,
  primaryAction,
  secondaryAction,
  children,
}: HeroProps) {
  return (
    <section className="py-20 md:py-28 text-center max-w-3xl mx-auto animate-fade-in">
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] text-neutral-900 mb-6">
        {title}
      </h1>
      
      {subtitle && (
        <p className="text-lg md:text-xl text-neutral-600 mb-8">
          {subtitle}
        </p>
      )}

      {children}

      {(primaryAction || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
          {primaryAction && (
            primaryAction.href ? (
              <a href={primaryAction.href}>
                <Button variant="primary">{primaryAction.label}</Button>
              </a>
            ) : (
              <Button variant="primary" onClick={primaryAction.onClick}>
                {primaryAction.label}
              </Button>
            )
          )}
          
          {secondaryAction && (
            secondaryAction.href ? (
              <a href={secondaryAction.href}>
                <Button variant="secondary">{secondaryAction.label}</Button>
              </a>
            ) : (
              <Button variant="secondary" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )
          )}
        </div>
      )}
    </section>
  );
}

