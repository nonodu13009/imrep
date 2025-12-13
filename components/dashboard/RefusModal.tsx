"use client";

import { useState } from "react";
import { Input, Button } from "@/components/ui";
import { X } from "lucide-react";

interface RefusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (motif: string) => void;
  title: string;
  isLoading?: boolean;
}

export default function RefusModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  isLoading = false,
}: RefusModalProps) {
  const [motif, setMotif] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (motif.trim()) {
      onConfirm(motif.trim());
      setMotif("");
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

        <Input
          label="Motif de refus"
          value={motif}
          onChange={(e) => setMotif(e.target.value)}
          placeholder="Indiquez le motif de refus"
          required
          className="mb-6"
        />

        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleConfirm} isLoading={isLoading} disabled={!motif.trim()}>
            Confirmer
          </Button>
        </div>
      </div>
    </div>
  );
}

