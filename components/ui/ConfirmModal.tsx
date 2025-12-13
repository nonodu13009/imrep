"use client";

import { ReactNode } from "react";
import Button from "./Button";
import { X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary";
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  variant = "primary",
  isLoading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-[var(--radius-md)] p-[var(--spacing-md)] max-w-md w-full mx-4 shadow-[var(--shadow-hover)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[20px] font-semibold text-[var(--color-dark)]">{title}</h3>
          <button
            onClick={onClose}
            className="text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-600)] transition-colors"
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-base text-[var(--color-neutral-600)] mb-6">{message}</p>

        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button variant={variant} onClick={onConfirm} isLoading={isLoading}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

