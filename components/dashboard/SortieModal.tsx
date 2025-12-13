"use client";

import { useState, useEffect } from "react";
import { Input, Button } from "@/components/ui";
import { X } from "lucide-react";

interface SortieModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (sortieData: { motif: string; dateSortieDemandee: Date; dateSortieDeclaration: Date; noteSortie?: string }) => void;
  isLoading?: boolean;
}

export default function SortieModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: SortieModalProps) {
  const [motif, setMotif] = useState("");
  const [dateSortieDemandee, setDateSortieDemandee] = useState("");
  const [dateSortieDeclaration, setDateSortieDeclaration] = useState("");
  const [noteSortie, setNoteSortie] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialiser la date de déclaration à aujourd'hui quand la modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split("T")[0];
      if (!dateSortieDeclaration) {
        setDateSortieDeclaration(today);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!motif.trim()) {
      newErrors.motif = "Le motif est obligatoire";
    }

    if (!dateSortieDemandee) {
      newErrors.dateSortieDemandee = "La date de sortie demandée est obligatoire";
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dateSortie = new Date(dateSortieDemandee);
      dateSortie.setHours(0, 0, 0, 0);

      if (dateSortie < today) {
        newErrors.dateSortieDemandee = "La date de sortie ne peut pas être dans le passé";
      }
    }

    if (!dateSortieDeclaration) {
      newErrors.dateSortieDeclaration = "La date de déclaration est obligatoire";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (!validateForm()) {
      return;
    }

    onConfirm({
      motif: motif.trim(),
      dateSortieDemandee: new Date(dateSortieDemandee),
      dateSortieDeclaration: new Date(dateSortieDeclaration),
      noteSortie: noteSortie.trim() || undefined,
    });

    // Réinitialiser le formulaire
    setMotif("");
    setDateSortieDemandee("");
    setDateSortieDeclaration(new Date().toISOString().split("T")[0]);
    setNoteSortie("");
    setErrors({});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-[var(--radius-md)] p-[var(--spacing-md)] max-w-md w-full mx-4 shadow-[var(--shadow-hover)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[20px] font-semibold text-[var(--color-dark)]">Demander une sortie</h3>
          <button
            onClick={onClose}
            className="text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-600)] transition-colors"
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-[var(--spacing-sm)]">
          <Input
            label="Motif de sortie *"
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            placeholder="Indiquez le motif de la sortie"
            error={errors.motif}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--spacing-sm)]">
            <Input
              type="date"
              label="Date de sortie demandée *"
              value={dateSortieDemandee}
              onChange={(e) => setDateSortieDemandee(e.target.value)}
              error={errors.dateSortieDemandee}
              required
              min={new Date().toISOString().split("T")[0]}
            />

            <Input
              type="date"
              label="Date de déclaration *"
              value={dateSortieDeclaration}
              onChange={(e) => setDateSortieDeclaration(e.target.value)}
              error={errors.dateSortieDeclaration}
              required
              max={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div>
            <label className="block text-[14px] font-medium text-[var(--color-dark)] mb-2">
              Note de sortie (optionnel)
            </label>
            <textarea
              value={noteSortie}
              onChange={(e) => setNoteSortie(e.target.value)}
              placeholder="Ajoutez une note si nécessaire..."
              className="w-full border border-[var(--color-neutral-200)] rounded-[var(--radius-md)] px-3 py-2 focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none min-h-[80px]"
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-[var(--spacing-md)]">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleConfirm} isLoading={isLoading} disabled={!motif.trim() || !dateSortieDemandee || !dateSortieDeclaration}>
            Confirmer
          </Button>
        </div>
      </div>
    </div>
  );
}

