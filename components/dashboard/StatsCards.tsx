"use client";

import { useState, useMemo } from "react";
import { Card, Select } from "@/components/ui";
import PieChart from "@/components/ui/PieChart";
import { Lot } from "@/lib/lots/types";

interface StatsCardsProps {
  lotsAssures?: number; // Lots avec statut "valide"
  enAttenteValidation?: number; // Lots avec statut "en_attente"
  suppressionAcceptee?: number; // Suppressions avec statut "suppression_validee"
  sortieEnAttente?: number; // Sorties avec statut "en_attente_allianz"
  sortieValidee?: number; // Sorties avec statut "sortie_validee"
  lots?: Lot[]; // Liste des lots pour le filtre par type
}

export default function StatsCards({
  lotsAssures = 0,
  enAttenteValidation = 0,
  suppressionAcceptee = 0,
  sortieEnAttente = 0,
  sortieValidee = 0,
  lots = [],
}: StatsCardsProps) {
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedCodePostal, setSelectedCodePostal] = useState<string>("");

  // KPIs principaux (3 espacés sur la largeur)
  const mainStats = [
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
      label: "Suppression acceptée",
      value: suppressionAcceptee,
      color: "text-[var(--color-success)]",
      show: suppressionAcceptee > 0,
    },
  ].filter((stat) => stat.show);

  // KPIs secondaires (affichés si > 0)
  const secondaryStats = [
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
  ].filter((stat) => stat.show);

  // Calculer le nombre de lots pour le type sélectionné
  const lotsByType = selectedType
    ? lots.filter((lot) => lot.typeLogement === Number(selectedType)).length
    : 0;

  // Récupérer tous les codes postaux uniques
  const codesPostaux = useMemo(() => {
    const uniqueCodes = Array.from(new Set(lots.map((lot) => lot.codePostal))).sort();
    return uniqueCodes;
  }, [lots]);

  // Calculer le nombre de lots pour le code postal sélectionné
  const lotsByCodePostal = useMemo(() => {
    if (!selectedCodePostal) return 0;
    return lots.filter((lot) => lot.codePostal === selectedCodePostal).length;
  }, [lots, selectedCodePostal]);

  // Couleurs pour les camemberts
  const typeColors = [
    "#2563EB", // Bleu
    "#22C55E", // Vert
    "#FACC15", // Jaune
    "#F97316", // Orange
    "#EF4444", // Rouge
  ];

  const motifColors = [
    "#2563EB", // Perte de la gestion
    "#22C55E", // Vente
    "#FACC15", // Autre
  ];

  // Fonction pour calculer la répartition par type de logement
  const getTypeDistribution = (filteredLots: Lot[]) => {
    const distribution = [1, 2, 3, 4, 5].map((type) => ({
      label: `${type} pièce${type > 1 ? "s" : ""}`,
      value: filteredLots.filter((lot) => lot.typeLogement === type).length,
      color: typeColors[type - 1],
    }));
    return distribution;
  };

  // Fonction pour calculer la répartition par motif de suppression
  const getMotifDistribution = (filteredLots: Lot[]) => {
    const motifs = ["perte_gestion", "vente", "autre"] as const;
    const motifLabels = {
      perte_gestion: "Perte de la gestion",
      vente: "Vente",
      autre: "Autre",
    };

    const distribution = motifs.map((motif, index) => ({
      label: motifLabels[motif],
      value: filteredLots.filter(
        (lot) => lot.suppression?.motif === motif && lot.suppression?.statutSuppression === "suppression_validee"
      ).length,
      color: motifColors[index],
    }));
    return distribution;
  };

  // Calculer les répartitions globales pour les camemberts
  const typeDistributionData = useMemo(() => getTypeDistribution(lots), [lots]);

  const codePostalDistributionData = useMemo(() => {
    const distribution = codesPostaux.map((code, index) => {
      const count = lots.filter((lot) => lot.codePostal === code).length;
      return {
        label: code,
        value: count,
        color: typeColors[index % typeColors.length],
      };
    });
    return distribution;
  }, [lots, codesPostaux]);

  return (
    <div className="mb-6">
      {/* 3 KPIs principaux espacés sur la largeur */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {mainStats.map((stat) => (
          <Card key={stat.label} className="p-5">
            <p className="text-sm text-[var(--color-neutral-600)] mb-2">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* KPIs avec selects : Type et Code postal côte à côte */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* KPI avec select pour filtrer par type */}
        <Card className="p-5">
          <p className="text-sm text-[var(--color-neutral-600)] mb-3">Lots par type</p>
          <div className="mb-3">
            <Select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="text-sm"
            >
              <option value="">Sélectionner le type</option>
              <option value="1">1 pièce</option>
              <option value="2">2 pièces</option>
              <option value="3">3 pièces</option>
              <option value="4">4 pièces</option>
              <option value="5">5 pièces</option>
            </Select>
          </div>
          {selectedType ? (
            <p className="text-3xl font-bold text-[var(--color-primary)]">{lotsByType}</p>
          ) : (
            <p className="text-sm text-[var(--color-neutral-500)] italic">Sélectionner le type</p>
          )}
        </Card>

        {/* KPI avec select pour filtrer par code postal */}
        <Card className="p-5">
          <p className="text-sm text-[var(--color-neutral-600)] mb-3">Lots par code postal</p>
          <div className="mb-3">
            <Select
              value={selectedCodePostal}
              onChange={(e) => setSelectedCodePostal(e.target.value)}
              className="text-sm"
            >
              <option value="">Sélectionner le code postal</option>
              {codesPostaux.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </Select>
          </div>
          {selectedCodePostal ? (
            <p className="text-3xl font-bold text-[var(--color-primary)]">{lotsByCodePostal}</p>
          ) : (
            <p className="text-sm text-[var(--color-neutral-500)] italic">Sélectionner le code postal</p>
          )}
        </Card>
      </div>

      {/* Camemberts de répartition globale */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Camembert par type de logement */}
        <Card className="p-5">
          <p className="text-sm text-[var(--color-neutral-600)] mb-4 font-medium">
            Répartition par type de logement
          </p>
          <PieChart data={typeDistributionData} />
        </Card>

        {/* Camembert par code postal */}
        <Card className="p-5">
          <p className="text-sm text-[var(--color-neutral-600)] mb-4 font-medium">
            Répartition par code postal
          </p>
          <PieChart data={codePostalDistributionData} />
        </Card>
      </div>
    </div>
  );
}

