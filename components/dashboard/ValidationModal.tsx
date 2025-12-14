"use client";

import { useState } from "react";
import { Input, Button } from "@/components/ui";
import { X } from "lucide-react";

interface ValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (numeroContrat?: string) => void;
  type: "entree" | "sortie" | "suppression";
  isLoading?: boolean;
}

export default function ValidationModal({
  isOpen,
  onClose,
  onConfirm,
  type,
  isLoading = false,
}: ValidationModalProps) {
  const [numeroContrat, setNumeroContrat] = useState("");

  if (!isOpen) return null;

  const getTitle = () => {
    switch (type) {
      case "entree":
        return "Valider l'entrée du lot";
      case "sortie":
        return "Valider la sortie du lot";
      case "suppression":
        return "Valider la suppression du lot";
      default:
        return "Valider";
    }
  };

  const getMessage = () => {
    switch (type) {
      case "entree":
        return "Vous êtes sur le point de valider l'entrée de ce lot dans le système. Le lot passera au statut 'Validé' et sera considéré comme assuré. Veuillez renseigner le numéro de contrat.";
      case "sortie":
        return "Vous êtes sur le point de valider la sortie de ce lot. La gestion du lot s'arrêtera à la date demandée. Le lot restera dans le système mais ne sera plus géré.";
      case "suppression":
        return "Vous êtes sur le point de valider la suppression de ce lot. Le lot sera définitivement retiré du système après validation.";
      default:
        return "";
    }
  };

  const requireInput = type === "entree";

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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 overflow-y-auto" onClick={onClose}>
      <div
        className="bg-white rounded-[var(--radius-md)] max-w-md w-full shadow-[var(--shadow-hover)] max-h-[calc(100vh-2rem)] flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 pb-4 border-b border-[var(--color-neutral-200)] flex-shrink-0">
          <h3 className="text-xl font-semibold text-[var(--color-dark)]">{getTitle()}</h3>
          <button
            onClick={onClose}
            className="text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-600)] transition-colors p-1"
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <p className="text-base text-[var(--color-neutral-600)] mb-6">{getMessage()}</p>

          {requireInput && (
            <div className="mb-6">
              <Input
                label="Numéro de contrat *"
                value={numeroContrat}
                onChange={(e) => setNumeroContrat(e.target.value)}
                placeholder="Entrez le numéro de contrat"
                required
              />
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end p-6 pt-4 border-t border-[var(--color-neutral-200)] flex-shrink-0">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleConfirm} isLoading={isLoading} disabled={requireInput && !numeroContrat.trim()}>
            Confirmer la validation
          </Button>
        </div>
      </div>
    </div>
  );
}

