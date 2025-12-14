"use client";

import { useState, useEffect } from "react";
import { Input, Button, Select } from "@/components/ui";
import { X } from "lucide-react";
import { MotifSuppression } from "@/lib/lots/types";

interface SuppressionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (suppressionData: { motif: MotifSuppression; motifAutre?: string; dateSuppressionDemandee: Date; dateSuppressionDeclaration: Date; noteSuppression?: string }) => void;
  isLoading?: boolean;
}

export default function SuppressionModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: SuppressionModalProps) {
  const [motif, setMotif] = useState<MotifSuppression>("perte_gestion");
  const [motifAutre, setMotifAutre] = useState("");
  const [dateSuppressionDemandee, setDateSuppressionDemandee] = useState("");
  const [dateSuppressionDeclaration, setDateSuppressionDeclaration] = useState("");
  const [noteSuppression, setNoteSuppression] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialiser la date de déclaration à aujourd'hui quand la modal s'ouvre
  useEffect(() => {
    if (isOpen && !dateSuppressionDeclaration) {
      const today = new Date().toISOString().split("T")[0];
      setDateSuppressionDeclaration(today);
    }
  }, [isOpen, dateSuppressionDeclaration]);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!dateSuppressionDemandee) {
      newErrors.dateSuppressionDemandee = "La date de suppression demandée est obligatoire";
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dateSuppression = new Date(dateSuppressionDemandee);
      dateSuppression.setHours(0, 0, 0, 0);

      if (dateSuppression < today) {
        newErrors.dateSuppressionDemandee = "La date de suppression ne peut pas être dans le passé";
      }
    }

    if (!dateSuppressionDeclaration) {
      newErrors.dateSuppressionDeclaration = "La date de déclaration est obligatoire";
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const declarationDate = new Date(dateSuppressionDeclaration);
      declarationDate.setHours(0, 0, 0, 0);

      if (declarationDate > today) {
        newErrors.dateSuppressionDeclaration = "La date de déclaration ne peut pas être dans le futur";
      }
    }

    if (motif === "autre" && !motifAutre.trim()) {
      newErrors.motifAutre = "Veuillez préciser le motif";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (!validateForm()) {
      return;
    }

    onConfirm({
      motif,
      motifAutre: motif === "autre" ? motifAutre.trim() : undefined,
      dateSuppressionDemandee: new Date(dateSuppressionDemandee),
      dateSuppressionDeclaration: new Date(dateSuppressionDeclaration),
      noteSuppression: noteSuppression.trim() || undefined,
    });

    // Réinitialiser le formulaire
    setMotif("perte_gestion");
    setMotifAutre("");
    setDateSuppressionDemandee("");
    setDateSuppressionDeclaration(new Date().toISOString().split("T")[0]);
    setNoteSuppression("");
    setErrors({});
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 overflow-y-auto" onClick={onClose}>
      <div
        className="bg-white rounded-[var(--radius-md)] max-w-lg w-full shadow-[var(--shadow-hover)] max-h-[calc(100vh-2rem)] flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 pb-4 border-b border-[var(--color-neutral-200)] flex-shrink-0">
          <h3 className="text-xl font-semibold text-[var(--color-dark)]">Demander la suppression</h3>
          <button
            onClick={onClose}
            className="text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-600)] transition-colors p-1"
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-5">
          <div className="w-full">
            <Select
              label="Motif de suppression *"
              value={motif}
              onChange={(e) => setMotif(e.target.value as MotifSuppression)}
              error={errors.motif}
              required
            >
              <option value="perte_gestion">Perte de la gestion</option>
              <option value="vente">Vente</option>
              <option value="autre">Autre</option>
            </Select>
          </div>

          {motif === "autre" && (
            <div className="w-full">
              <Input
                label="Préciser le motif *"
                value={motifAutre}
                onChange={(e) => setMotifAutre(e.target.value)}
                placeholder="Indiquez le motif de suppression"
                error={errors.motifAutre}
                required
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="w-full flex flex-col">
              <label className="block text-[14px] font-medium text-[var(--color-dark)] mb-2 min-h-[20px]">
                Date de suppression demandée *
              </label>
              <input
                type="date"
                value={dateSuppressionDemandee}
                onChange={(e) => setDateSuppressionDemandee(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className={`w-full border border-[var(--color-neutral-200)] rounded-[var(--radius-md)] px-3 py-2 focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none ${errors.dateSuppressionDemandee ? "border-[var(--color-danger)] focus:ring-[var(--color-danger)]" : ""}`}
                required
              />
              {errors.dateSuppressionDemandee && (
                <p className="mt-2 text-sm text-[var(--color-danger)]">{errors.dateSuppressionDemandee}</p>
              )}
            </div>

            <div className="w-full flex flex-col">
              <label className="block text-[14px] font-medium text-[var(--color-dark)] mb-2 min-h-[20px]">
                Date de déclaration *
              </label>
              <input
                type="date"
                value={dateSuppressionDeclaration}
                onChange={(e) => setDateSuppressionDeclaration(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className={`w-full border border-[var(--color-neutral-200)] rounded-[var(--radius-md)] px-3 py-2 focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none ${errors.dateSuppressionDeclaration ? "border-[var(--color-danger)] focus:ring-[var(--color-danger)]" : ""}`}
                required
              />
              {errors.dateSuppressionDeclaration && (
                <p className="mt-2 text-sm text-[var(--color-danger)]">{errors.dateSuppressionDeclaration}</p>
              )}
            </div>
          </div>

          <div className="w-full">
            <label className="block text-[14px] font-medium text-[var(--color-dark)] mb-2">
              Note de suppression (optionnel)
            </label>
            <textarea
              value={noteSuppression}
              onChange={(e) => setNoteSuppression(e.target.value)}
              placeholder="Ajoutez une note si nécessaire..."
              className="w-full border border-[var(--color-neutral-200)] rounded-[var(--radius-md)] px-3 py-2 focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none min-h-[80px] resize-none"
            />
          </div>
        </div>
        </div>

        <div className="flex gap-3 justify-end p-6 pt-4 border-t border-[var(--color-neutral-200)] flex-shrink-0">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleConfirm} isLoading={isLoading} disabled={!dateSuppressionDemandee || !dateSuppressionDeclaration || (motif === "autre" && !motifAutre.trim())}>
            Confirmer
          </Button>
        </div>
      </div>
    </div>
  );
}

