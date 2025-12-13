"use client";

import { useState } from "react";
import { Input, Button } from "@/components/ui";
import { X } from "lucide-react";

interface ValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (numeroContrat?: string) => void;
  title: string;
  isLoading?: boolean;
  requireInput?: boolean;
}

export default function ValidationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  isLoading = false,
  requireInput = true,
}: ValidationModalProps) {
  const [numeroContrat, setNumeroContrat] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (requireInput) {
      if (numeroContrat.trim()) {
        onConfirm(numeroContrat.trim());
        setNumeroContrat("");
      }
    } else {
      onConfirm();
      setNumeroContrat("");
    }
  };

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

        {requireInput && (
          <Input
            label="Numéro de contrat"
            value={numeroContrat}
            onChange={(e) => setNumeroContrat(e.target.value)}
            placeholder="Entrez le numéro de contrat"
            required
            className="mb-6"
          />
        )}

        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleConfirm} isLoading={isLoading} disabled={requireInput && !numeroContrat.trim()}>
            Confirmer
          </Button>
        </div>
      </div>
    </div>
  );
}

