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
    { label: "Total", value: total, color: "text-[#2563eb]" },
    { label: "En attente", value: enAttente, color: "text-[#facc15]" },
    { label: "Validés", value: valides, color: "text-[#22c55e]" },
    { label: "Refusés", value: refuses, color: "text-[#ef4444]" },
  ];

  if (sortiesEnAttente > 0) {
    stats.push({ label: "Sorties en attente", value: sortiesEnAttente, color: "text-[#facc15]" });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[16px] mb-[24px]">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-5">
          <p className="text-sm text-[#64748b] mb-2">{stat.label}</p>
          <p className={`text-[32px] font-bold ${stat.color}`}>{stat.value}</p>
        </Card>
      ))}
    </div>
  );
}

