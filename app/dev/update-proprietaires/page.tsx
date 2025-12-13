"use client";

import { useState } from "react";
import { Button, Card, SectionTitle } from "@/components/ui";
import { useToast } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { getAllLots } from "@/lib/lots/queries";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Lot } from "@/lib/lots/types";

// Listes de prénoms et noms français courants
const prenoms = [
  "Jean", "Marie", "Pierre", "Sophie", "Luc", "Isabelle", "François", "Catherine",
  "Antoine", "Nathalie", "Philippe", "Valérie", "Stéphane", "Claire", "Thomas",
  "Julie", "Marc", "Sandrine", "Olivier", "Emilie", "Laurent", "Anne", "David",
  "Sylvie", "Nicolas", "Caroline", "Julien", "Patricia", "Sébastien", "Martine"
];

const noms = [
  "Dupont", "Martin", "Bernard", "Dubois", "Moreau", "Laurent", "Petit", "Roux",
  "Simon", "Michel", "Garcia", "David", "Bertrand", "Rousseau", "Vincent",
  "Fournier", "Lefebvre", "Girard", "Bonnet", "Durand", "Leroy", "Morel",
  "Garnier", "Faure", "Blanc", "Lopez", "Perrin", "Rousseau", "Henry", "Muller"
];

// Noms de SCI courants
const sciNames = [
  "SCI Les Oliviers", "SCI Le Domaine", "SCI Les Jardins", "SCI La Résidence",
  "SCI Les Terrasses", "SCI Le Parc", "SCI Les Vignes", "SCI La Villa",
  "SCI Les Cyprès", "SCI Le Clos", "SCI Les Pins", "SCI La Source",
  "SCI Les Chênes", "SCI Le Mas", "SCI Les Platanes", "SCI La Bastide"
];

// Générer un nom de propriétaire aléatoire (soit prénom+nom, soit SCI)
function generateNomProprietaire(): string {
  const isSCI = Math.random() < 0.3; // 30% de chance d'être une SCI
  
  if (isSCI) {
    return sciNames[Math.floor(Math.random() * sciNames.length)];
  } else {
    const prenom = prenoms[Math.floor(Math.random() * prenoms.length)];
    const nom = noms[Math.floor(Math.random() * noms.length)];
    return `${prenom} ${nom}`;
  }
}

export default function UpdateProprietairesPage() {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ updated: 0, total: 0, skipped: 0 });

  const updateLots = async () => {
    if (!user) {
      showToast("Vous devez être connecté", "error");
      return;
    }

    if (role !== "allianz") {
      showToast("Seuls les utilisateurs Allianz peuvent exécuter ce script", "error");
      return;
    }

    setLoading(true);
    setProgress({ updated: 0, total: 0, skipped: 0 });

    try {
      // Récupérer tous les lots
      const lots = await getAllLots();
      setProgress({ updated: 0, total: lots.length, skipped: 0 });

      let updatedCount = 0;
      let skippedCount = 0;

      for (const lot of lots) {
        // Vérifier si le lot a déjà un nomProprietaire
        if (lot.nomProprietaire && lot.nomProprietaire.trim() !== "") {
          skippedCount++;
          setProgress({ updated: updatedCount, total: lots.length, skipped: skippedCount });
          continue;
        }

        // Générer un nom de propriétaire
        const nomProprietaire = generateNomProprietaire();

        // Mettre à jour le lot dans Firestore
        if (lot.id) {
          await updateDoc(doc(db, "lots", lot.id), {
            nomProprietaire: nomProprietaire,
          });
          updatedCount++;
          setProgress({ updated: updatedCount, total: lots.length, skipped: skippedCount });
        }

        // Petit délai pour éviter de surcharger Firebase
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      setLoading(false);

      if (updatedCount > 0) {
        showToast(
          `${updatedCount} lots mis à jour${skippedCount > 0 ? `, ${skippedCount} déjà à jour` : ""}`,
          "success"
        );
      } else {
        showToast("Tous les lots ont déjà un nom de propriétaire", "info");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      console.error("Erreur lors de la mise à jour:", errorMessage);
      showToast(`Erreur: ${errorMessage}`, "error");
      setLoading(false);
    }
  };

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <p className="text-base text-slate-600">Chargement...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <SectionTitle>Mise à jour des noms de propriétaires</SectionTitle>
        <p className="text-sm text-slate-500 mb-6">
          Ce script ajoute un nom de propriétaire (prénom + nom ou SCI) aux lots qui n'en ont pas encore.
        </p>

        {progress.total > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">
                Progression : {progress.updated} / {progress.total}
              </span>
              <span className="text-sm font-medium text-blue-600">
                {Math.round((progress.updated / progress.total) * 100)}%
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(progress.updated / progress.total) * 100}%` }}
              />
            </div>
            {progress.skipped > 0 && (
              <p className="text-xs text-slate-500 mt-2">
                {progress.skipped} lots déjà à jour
              </p>
            )}
          </div>
        )}

        <Button
          variant="primary"
          onClick={updateLots}
          isLoading={loading}
          className="w-full"
          disabled={role !== "allianz"}
        >
          {loading ? "Mise à jour en cours..." : "Mettre à jour les lots"}
        </Button>

        {role !== "allianz" && (
          <p className="text-xs text-red-500 mt-2 text-center">
            Seuls les utilisateurs Allianz peuvent exécuter ce script
          </p>
        )}

        <div className="mt-6 p-4 bg-slate-50 rounded-lg text-sm">
          <p className="font-semibold mb-2">Fonctionnalités :</p>
          <ul className="space-y-1 text-slate-500">
            <li>• Ajoute un nom de propriétaire aux lots qui n'en ont pas</li>
            <li>• Génère soit un prénom + nom (70%), soit une SCI (30%)</li>
            <li>• Ignore les lots qui ont déjà un nom de propriétaire</li>
            <li>• Affiche la progression en temps réel</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}

