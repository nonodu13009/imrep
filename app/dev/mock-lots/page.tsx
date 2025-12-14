"use client";

import { useState } from "react";
import { Button, Card, SectionTitle } from "@/components/ui";
import { useToast } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { createLot } from "@/lib/lots/actions";
import { Etage, TypeLogement } from "@/lib/lots/types";

// Données mockées supprimées - cette page nécessite maintenant des données externes
const mockLotsData: Array<{
  codeProprietaire: string;
  nomProprietaire: string;
  codeLot: string;
  adresse: string;
  codePostal: string;
  ville: string;
  complementAdresse?: string;
  etage: Etage;
  typeLogement: TypeLogement;
  garageADiffAdresse: boolean;
  adresseGarage?: string;
}> = [];

export default function MockLotsPage() {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ created: 0, total: 0 });

  const createMockLots = async () => {
    if (!user) {
      showToast("Vous devez être connecté", "error");
      return;
    }

    if (role !== "imrep") {
      showToast("Seuls les utilisateurs IMREP peuvent créer des lots", "error");
      return;
    }

    setLoading(true);
    setProgress({ created: 0, total: mockLotsData.length });

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < mockLotsData.length; i++) {
      const lotData = mockLotsData[i];
      
      try {
        // Générer des dates variées
        const today = new Date();
        const dateDebutGestion = new Date(today);
        dateDebutGestion.setDate(today.getDate() - Math.floor(Math.random() * 30)); // Entre aujourd'hui et il y a 30 jours
        
        const dateEffetDemandee = new Date(today);
        dateEffetDemandee.setDate(today.getDate() + Math.floor(Math.random() * 7) + 1); // Entre J+1 et J+7

        await createLot(
          {
            ...lotData,
            dateDebutGestion,
            dateEffetDemandee,
            note: i % 3 === 0 ? `Note pour le lot ${lotData.codeLot}` : undefined,
          },
          user.uid
        );

        successCount++;
        setProgress({ created: successCount, total: mockLotsData.length });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
        console.error(`Erreur lors de la création du lot ${lotData.codeLot}:`, errorMessage);
        errorCount++;
      }

      // Petit délai pour éviter de surcharger Firebase
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    setLoading(false);

    if (successCount > 0) {
      showToast(`${successCount} lots créés avec succès${errorCount > 0 ? `, ${errorCount} erreurs` : ""}`, "success");
    } else {
      showToast("Aucun lot n'a pu être créé", "error");
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
        <SectionTitle>Génération de lots mockés</SectionTitle>
        <p className="text-sm text-slate-500 mb-6">
          Créez 20 lots de test avec des données réalistes pour le développement
        </p>

        {progress.total > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">
                Progression : {progress.created} / {progress.total}
              </span>
              <span className="text-sm font-medium text-blue-600">
                {Math.round((progress.created / progress.total) * 100)}%
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(progress.created / progress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        <Button
          variant="primary"
          onClick={createMockLots}
          isLoading={loading}
          className="w-full"
          disabled={role !== "imrep"}
        >
          {loading ? "Création en cours..." : "Créer 20 lots mockés"}
        </Button>

        {role !== "imrep" && (
          <p className="text-xs text-red-500 mt-2 text-center">
            Seuls les utilisateurs IMREP peuvent créer des lots
          </p>
        )}

        <div className="mt-6 p-4 bg-slate-50 rounded-lg text-sm">
          <p className="font-semibold mb-2">Lots à créer :</p>
          <ul className="space-y-1 text-slate-500">
            <li>• 20 lots avec adresses marseillaises</li>
            <li>• Dates variées (début gestion et effet)</li>
            <li>• Types de logements variés (1 à 5 pièces)</li>
            <li>• Garages avec/sans adresse différente</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}

