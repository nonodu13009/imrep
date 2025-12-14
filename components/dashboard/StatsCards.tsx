"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Card, Select } from "@/components/ui";
import PieChart from "@/components/ui/PieChart";
import { Lot } from "@/lib/lots/types";
import { TrendingUp, FileCheck, AlertCircle, CheckCircle2 } from "lucide-react";

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
  const [animatedValues, setAnimatedValues] = useState<Record<string, number>>({});
  const timersRef = useRef<Record<string, NodeJS.Timeout>>({});
  const previousValuesRef = useRef<Record<string, number>>({});
  const initializedRef = useRef(false);

  // KPIs principaux (3 espacés sur la largeur)
  const mainStats = [
    {
      label: "Lots assurés",
      value: lotsAssures,
      color: "text-[var(--color-success)]",
      icon: CheckCircle2,
      show: true,
    },
    {
      label: "En attente de validation",
      value: enAttenteValidation,
      color: "text-[var(--color-warning)]",
      icon: AlertCircle,
      show: true,
    },
    {
      label: "Suppression acceptée",
      value: suppressionAcceptee,
      color: "text-[var(--color-success)]",
      icon: FileCheck,
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

  // Initialiser les valeurs animées au premier rendu
  useEffect(() => {
    if (!initializedRef.current) {
      const initialValues = {
        "Lots assurés": lotsAssures,
        "En attente de validation": enAttenteValidation,
        "Suppression acceptée": suppressionAcceptee,
      };
      setAnimatedValues(initialValues);
      previousValuesRef.current = { ...initialValues };
      initializedRef.current = true;
    }
  }, [lotsAssures, enAttenteValidation, suppressionAcceptee]);

  // Animation count-up pour les valeurs (seulement quand elles changent)
  useEffect(() => {
    const animationDuration = 800; // 0.8 seconde
    const steps = 40;
    const stepDuration = animationDuration / steps;

    const animateValue = (key: string, targetValue: number) => {
      // Nettoyer le timer existant pour cette clé
      if (timersRef.current[key]) {
        clearInterval(timersRef.current[key]);
        delete timersRef.current[key];
      }

      // Obtenir la valeur de départ depuis l'état actuel
      setAnimatedValues((prevState) => {
        const startValue = prevState[key] ?? previousValuesRef.current[key] ?? 0;
        if (startValue === targetValue) return prevState; // Pas besoin d'animer si déjà à la valeur cible

        let currentStep = 0;
        const increment = (targetValue - startValue) / steps;

        const timer = setInterval(() => {
          currentStep++;
          const newValue = Math.min(
            Math.round(startValue + increment * currentStep),
            targetValue
          );

          setAnimatedValues((prevState) => {
            if (currentStep >= steps || newValue >= targetValue) {
              clearInterval(timer);
              delete timersRef.current[key];
              previousValuesRef.current[key] = targetValue;
              return { ...prevState, [key]: targetValue };
            }
            return { ...prevState, [key]: newValue };
          });
        }, stepDuration);

        timersRef.current[key] = timer;
        return prevState;
      });
    };

    // Animer les KPIs principaux seulement si la valeur a changé
    if (previousValuesRef.current["Lots assurés"] !== lotsAssures) {
      animateValue("Lots assurés", lotsAssures);
      previousValuesRef.current["Lots assurés"] = lotsAssures;
    }
    if (previousValuesRef.current["En attente de validation"] !== enAttenteValidation) {
      animateValue("En attente de validation", enAttenteValidation);
      previousValuesRef.current["En attente de validation"] = enAttenteValidation;
    }
    if (previousValuesRef.current["Suppression acceptée"] !== suppressionAcceptee) {
      animateValue("Suppression acceptée", suppressionAcceptee);
      previousValuesRef.current["Suppression acceptée"] = suppressionAcceptee;
    }

    // Animer les KPIs avec selects
    if (selectedType) {
      const key = `type-${selectedType}`;
      if (previousValuesRef.current[key] !== lotsByType) {
        animateValue(key, lotsByType);
        previousValuesRef.current[key] = lotsByType;
      }
    }
    if (selectedCodePostal) {
      const key = `postal-${selectedCodePostal}`;
      if (previousValuesRef.current[key] !== lotsByCodePostal) {
        animateValue(key, lotsByCodePostal);
        previousValuesRef.current[key] = lotsByCodePostal;
      }
    }

    // Cleanup function
    return () => {
      Object.values(timersRef.current).forEach((timer) => clearInterval(timer));
      timersRef.current = {};
    };
  }, [lotsAssures, enAttenteValidation, suppressionAcceptee, selectedType, lotsByType, selectedCodePostal, lotsByCodePostal]);

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
        {mainStats.map((stat) => {
          const Icon = stat.icon;
          const displayValue = animatedValues[stat.label] !== undefined ? animatedValues[stat.label] : stat.value;
          return (
            <Card key={stat.label} variant="elevated" className="p-5 animate-fade-in-up">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-[var(--color-neutral-600)]">{stat.label}</p>
                <Icon 
                  size={20} 
                  className={`${stat.color}`}
                />
              </div>
              <p className={`text-3xl font-bold ${stat.color} transition-all duration-[var(--transition-base)]`}>
                {displayValue}
              </p>
            </Card>
          );
        })}
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
            <p className="text-3xl font-bold text-[var(--color-primary)] transition-all duration-[var(--transition-base)]">
              {animatedValues[`type-${selectedType}`] !== undefined ? animatedValues[`type-${selectedType}`] : lotsByType}
            </p>
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
            <p className="text-3xl font-bold text-[var(--color-primary)] transition-all duration-[var(--transition-base)]">
              {animatedValues[`postal-${selectedCodePostal}`] !== undefined ? animatedValues[`postal-${selectedCodePostal}`] : lotsByCodePostal}
            </p>
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

