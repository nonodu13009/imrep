"use client";

import { Card } from "@/components/ui";

interface StatsCardsProps {
  lotsAssures?: number; // Lots avec statut "valide"
  enAttenteValidation?: number; // Lots avec statut "en_attente"
  entreeRefusee?: number; // Lots avec statut "refuse"
  suppressionEnAttente?: number; // Suppressions avec statut "en_attente_allianz"
  suppressionAcceptee?: number; // Suppressions avec statut "suppression_validee"
  suppressionRefusee?: number; // Suppressions avec statut "refusee"
  sortieEnAttente?: number; // Sorties avec statut "en_attente_allianz"
  sortieValidee?: number; // Sorties avec statut "sortie_validee"
  sortieRefusee?: number; // Sorties avec statut "refusee"
}

export default function StatsCards({
  lotsAssures = 0,
  enAttenteValidation = 0,
  entreeRefusee = 0,
  suppressionEnAttente = 0,
  suppressionAcceptee = 0,
  suppressionRefusee = 0,
  sortieEnAttente = 0,
  sortieValidee = 0,
  sortieRefusee = 0,
}: StatsCardsProps) {
  const stats = [
    {
      label: "Lots assurés",
      value: lotsAssures,
      color: "text-[var(--color-success)]",
      show: true,
    },
    {
      label: "En attente de validation",
      value: enAttenteValidation,
      color: "text-[var(--color-warning)]",
      show: true,
    },
    {
      label: "Entrée refusée",
      value: entreeRefusee,
      color: "text-[var(--color-danger)]",
      show: true,
    },
    {
      label: "Suppression en attente",
      value: suppressionEnAttente,
      color: "text-[var(--color-warning)]",
      show: suppressionEnAttente > 0,
    },
    {
      label: "Suppression acceptée",
      value: suppressionAcceptee,
      color: "text-[var(--color-success)]",
      show: suppressionAcceptee > 0,
    },
    {
      label: "Suppression refusée",
      value: suppressionRefusee,
      color: "text-[var(--color-danger)]",
      show: suppressionRefusee > 0,
    },
    {
      label: "Sortie en attente",
      value: sortieEnAttente,
      color: "text-[var(--color-warning)]",
      show: sortieEnAttente > 0,
    },
    {
      label: "Sortie validée",
      value: sortieValidee,
      color: "text-[var(--color-success)]",
      show: sortieValidee > 0,
    },
    {
      label: "Sortie refusée",
      value: sortieRefusee,
      color: "text-[var(--color-danger)]",
      show: sortieRefusee > 0,
    },
  ].filter((stat) => stat.show);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-5">
          <p className="text-sm text-[var(--color-neutral-600)] mb-2">{stat.label}</p>
          <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
        </Card>
      ))}
    </div>
  );
}

