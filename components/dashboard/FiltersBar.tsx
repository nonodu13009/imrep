"use client";

import { LotStatus, Lot } from "@/lib/lots/types";
import { Select, Button } from "@/components/ui";
import { RotateCcw } from "lucide-react";

interface FiltersBarProps {
  statusFilter: LotStatus | "all";
  onStatusChange: (status: LotStatus | "all") => void;
  imrepFilter?: string;
  onImrepChange?: (imrepId: string) => void;
  imrepList?: Array<{ id: string; email: string }>;
  showImrepFilter?: boolean;
  proprietaireFilter?: string;
  onProprietaireChange?: (code: string) => void;
  typeFilter?: string;
  onTypeChange?: (type: string) => void;
  codePostalFilter?: string;
  onCodePostalChange?: (code: string) => void;
  lots?: Lot[];
  onReset?: () => void;
}

export default function FiltersBar({
  statusFilter,
  onStatusChange,
  imrepFilter,
  onImrepChange,
  imrepList = [],
  showImrepFilter = false,
  proprietaireFilter = "",
  onProprietaireChange,
  typeFilter = "",
  onTypeChange,
  codePostalFilter = "",
  onCodePostalChange,
  lots = [],
  onReset,
}: FiltersBarProps) {
  // Récupérer les codes propriétaires uniques
  const codesProprietaires = Array.from(
    new Set(lots.map((lot) => lot.codeProprietaire))
  ).sort();

  // Récupérer les codes postaux uniques
  const codesPostaux = Array.from(
    new Set(lots.map((lot) => lot.codePostal))
  ).sort();

  const hasActiveFilters =
    statusFilter !== "all" ||
    (imrepFilter && imrepFilter !== "all") ||
    proprietaireFilter !== "" ||
    typeFilter !== "" ||
    codePostalFilter !== "";

  return (
    <div className="bg-white rounded-[var(--radius-md)] p-4 shadow-sm border border-[var(--color-neutral-200)] mb-6">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <Select
            label="Statut"
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value as LotStatus | "all")}
          >
            <option value="all">Tous les statuts</option>
            <option value="en_attente">En attente</option>
            <option value="valide">Validé</option>
            <option value="refuse">Refusé</option>
          </Select>
        </div>

        {showImrepFilter && onImrepChange && (
          <div className="flex-1 min-w-[200px]">
            <Select
              label="IMREP"
              value={imrepFilter || "all"}
              onChange={(e) => onImrepChange(e.target.value)}
            >
              <option value="all">Tous les IMREP</option>
              {imrepList.map((imrep) => (
                <option key={imrep.id} value={imrep.id}>
                  {imrep.email}
                </option>
              ))}
            </Select>
          </div>
        )}

        {onProprietaireChange && (
          <div className="flex-1 min-w-[200px]">
            <Select
              label="Propriétaire"
              value={proprietaireFilter}
              onChange={(e) => onProprietaireChange(e.target.value)}
            >
              <option value="">Tous les propriétaires</option>
              {codesProprietaires.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </Select>
          </div>
        )}

        {onTypeChange && (
          <div className="flex-1 min-w-[200px]">
            <Select
              label="Type de logement"
              value={typeFilter}
              onChange={(e) => onTypeChange(e.target.value)}
            >
              <option value="">Tous les types</option>
              <option value="1">1 pièce</option>
              <option value="2">2 pièces</option>
              <option value="3">3 pièces</option>
              <option value="4">4 pièces</option>
              <option value="5">5 pièces</option>
            </Select>
          </div>
        )}

        {onCodePostalChange && (
          <div className="flex-1 min-w-[200px]">
            <Select
              label="Code postal"
              value={codePostalFilter}
              onChange={(e) => onCodePostalChange(e.target.value)}
            >
              <option value="">Tous les codes postaux</option>
              {codesPostaux.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </Select>
          </div>
        )}

        {hasActiveFilters && onReset && (
          <Button variant="secondary" onClick={onReset} className="flex items-center gap-2">
            <RotateCcw size={16} />
            Réinitialiser
          </Button>
        )}
      </div>
    </div>
  );
}

