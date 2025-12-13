"use client";

import { Card } from "@/components/ui";
import { LotStatus } from "@/lib/lots/types";

interface StatsCardsProps {
  total: number;
  enAttente: number;
  valides: number;
  refuses: number;
  sortiesEnAttente?: number;
}

export default function StatsCards({
  total,
  enAttente,
  valides,
  refuses,
  sortiesEnAttente = 0,
}: StatsCardsProps) {
  const stats = [
    { label: "Total", value: total, color: "text-[var(--color-primary)]" },
    { label: "En attente", value: enAttente, color: "text-[var(--color-warning)]" },
    { label: "Validés", value: valides, color: "text-[var(--color-success)]" },
    { label: "Refusés", value: refuses, color: "text-[var(--color-danger)]" },
  ];

  if (sortiesEnAttente > 0) {
    stats.push({ label: "Sorties en attente", value: sortiesEnAttente, color: "text-[var(--color-warning)]" });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[var(--spacing-sm)] mb-[var(--spacing-md)]">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-[20px]">
          <p className="text-sm text-[var(--color-neutral-600)] mb-2">{stat.label}</p>
          <p className={`text-[32px] font-bold ${stat.color}`}>{stat.value}</p>
        </Card>
      ))}
    </div>
  );
}

