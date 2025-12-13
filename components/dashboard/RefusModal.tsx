"use client";

import { useState } from "react";
import { Input, Button } from "@/components/ui";
import { X } from "lucide-react";

interface RefusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (motif: string) => void;
  type: "entree" | "sortie" | "suppression";
  isLoading?: boolean;
}

export default function RefusModal({
  isOpen,
  onClose,
  onConfirm,
  type,
  isLoading = false,
}: RefusModalProps) {
  const [motif, setMotif] = useState("");

  if (!isOpen) return null;

  const getTitle = () => {
    switch (type) {
      case "entree":
        return "Refuser l'entrée du lot";
      case "sortie":
        return "Refuser la sortie du lot";
      case "suppression":
        return "Refuser la suppression du lot";
      default:
        return "Refuser";
    }
  };

  const getMessage = () => {
    switch (type) {
      case "entree":
        return "Vous êtes sur le point de refuser l'entrée de ce lot dans le système. Le lot passera au statut 'Refusé'. Veuillez indiquer le motif du refus.";
      case "sortie":
        return "Vous êtes sur le point de refuser la demande de sortie de ce lot. Le lot restera dans le système avec son statut actuel. Veuillez indiquer le motif du refus.";
      case "suppression":
        return "Vous êtes sur le point de refuser la demande de suppression de ce lot. Le lot restera dans le système avec son statut actuel. Veuillez indiquer le motif du refus.";
      default:
        return "";
    }
  };

  const handleConfirm = () => {
    if (motif.trim()) {
      onConfirm(motif.trim());
      setMotif("");
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 overflow-y-auto" onClick={onClose}>
      <div
        className="bg-white rounded-[var(--radius-md)] p-6 max-w-md w-full my-auto shadow-[var(--shadow-hover)] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-[var(--color-dark)]">{getTitle()}</h3>
          <button
            onClick={onClose}
            className="text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-600)] transition-colors p-1"
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-base text-[var(--color-neutral-600)] mb-6">{getMessage()}</p>

        <div className="mb-6">
          <Input
            label="Motif de refus *"
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            placeholder="Indiquez le motif de refus"
            required
          />
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-[var(--color-neutral-200)]">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleConfirm} isLoading={isLoading} disabled={!motif.trim()}>
            Confirmer le refus
          </Button>
        </div>
      </div>
    </div>
  );
}

