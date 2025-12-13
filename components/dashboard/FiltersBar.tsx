"use client";

import { LotStatus } from "@/lib/lots/types";
import { Select, Button } from "@/components/ui";

interface FiltersBarProps {
  statusFilter: LotStatus | "all";
  onStatusChange: (status: LotStatus | "all") => void;
  imrepFilter?: string;
  onImrepChange?: (imrepId: string) => void;
  imrepList?: Array<{ id: string; email: string }>;
  showImrepFilter?: boolean;
}

export default function FiltersBar({
  statusFilter,
  onStatusChange,
  imrepFilter,
  onImrepChange,
  imrepList = [],
  showImrepFilter = false,
}: FiltersBarProps) {
  return (
    <div className="flex flex-wrap gap-[16px] mb-[24px]">
      <Select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value as LotStatus | "all")}
        className="min-w-[200px]"
      >
        <option value="all">Tous les statuts</option>
        <option value="en_attente">En attente</option>
        <option value="valide">Validé</option>
        <option value="refuse">Refusé</option>
      </Select>

      {showImrepFilter && onImrepChange && (
        <Select
          value={imrepFilter || "all"}
          onChange={(e) => onImrepChange(e.target.value)}
          className="min-w-[200px]"
        >
          <option value="all">Tous les IMREP</option>
          {imrepList.map((imrep) => (
            <option key={imrep.id} value={imrep.id}>
              {imrep.email}
            </option>
          ))}
        </Select>
      )}

      {statusFilter !== "all" && (
        <Button variant="secondary" onClick={() => onStatusChange("all")}>
          Réinitialiser
        </Button>
      )}
    </div>
  );
}

