"use client";

import { useState } from "react";
import { Button, Card, SectionTitle } from "@/components/ui";
import { useToast } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { createLot } from "@/lib/lots/actions";
import { Etage, TypeLogement } from "@/lib/lots/types";

// Données mockées pour générer 20 lots
const mockLotsData = [
  { codeProprietaire: "PROP001", codeLot: "LOT001", adresse: "15 Rue de la République", codePostal: "13001", ville: "Marseille", complementAdresse: "Appartement 3A", etage: "rez-de-chaussée" as Etage, typeLogement: 2 as TypeLogement, garageADiffAdresse: false },
  { codeProprietaire: "PROP002", codeLot: "LOT002", adresse: "42 Avenue du Prado", codePostal: "13008", ville: "Marseille", complementAdresse: "", etage: "intermédiaire" as Etage, typeLogement: 3 as TypeLogement, garageADiffAdresse: true, adresseGarage: "45 Avenue du Prado" },
  { codeProprietaire: "PROP003", codeLot: "LOT003", adresse: "8 Boulevard de la Corniche", codePostal: "13007", ville: "Marseille", complementAdresse: "Résidence Les Flots", etage: "dernier étage" as Etage, typeLogement: 4 as TypeLogement, garageADiffAdresse: false },
  { codeProprietaire: "PROP004", codeLot: "LOT004", adresse: "23 Rue Saint-Ferréol", codePostal: "13001", ville: "Marseille", complementAdresse: "", etage: "rez-de-chaussée" as Etage, typeLogement: 1 as TypeLogement, garageADiffAdresse: false },
  { codeProprietaire: "PROP005", codeLot: "LOT005", adresse: "67 Rue Paradis", codePostal: "13006", ville: "Marseille", complementAdresse: "Étage 2", etage: "intermédiaire" as Etage, typeLogement: 3 as TypeLogement, garageADiffAdresse: true, adresseGarage: "Parking souterrain - 67 Rue Paradis" },
  { codeProprietaire: "PROP006", codeLot: "LOT006", adresse: "12 Place Castellane", codePostal: "13006", ville: "Marseille", complementAdresse: "", etage: "dernier étage" as Etage, typeLogement: 5 as TypeLogement, garageADiffAdresse: false },
  { codeProprietaire: "PROP007", codeLot: "LOT007", adresse: "89 Boulevard Longchamp", codePostal: "13001", ville: "Marseille", complementAdresse: "Appartement 5B", etage: "intermédiaire" as Etage, typeLogement: 2 as TypeLogement, garageADiffAdresse: false },
  { codeProprietaire: "PROP008", codeLot: "LOT008", adresse: "34 Rue de Rome", codePostal: "13006", ville: "Marseille", complementAdresse: "", etage: "rez-de-chaussée" as Etage, typeLogement: 1 as TypeLogement, garageADiffAdresse: true, adresseGarage: "36 Rue de Rome" },
  { codeProprietaire: "PROP009", codeLot: "LOT009", adresse: "56 Cours Julien", codePostal: "13006", ville: "Marseille", complementAdresse: "Studio", etage: "dernier étage" as Etage, typeLogement: 1 as TypeLogement, garageADiffAdresse: false },
  { codeProprietaire: "PROP010", codeLot: "LOT010", adresse: "78 Avenue de la Plage", codePostal: "13008", ville: "Marseille", complementAdresse: "Résidence Le Phare", etage: "intermédiaire" as Etage, typeLogement: 4 as TypeLogement, garageADiffAdresse: false },
  { codeProprietaire: "PROP011", codeLot: "LOT011", adresse: "21 Rue de la Paix", codePostal: "13001", ville: "Marseille", complementAdresse: "", etage: "rez-de-chaussée" as Etage, typeLogement: 2 as TypeLogement, garageADiffAdresse: false },
  { codeProprietaire: "PROP012", codeLot: "LOT012", adresse: "45 Boulevard Michelet", codePostal: "13008", ville: "Marseille", complementAdresse: "Appartement 7C", etage: "dernier étage" as Etage, typeLogement: 3 as TypeLogement, garageADiffAdresse: true, adresseGarage: "Parking résidentiel - 45 Boulevard Michelet" },
  { codeProprietaire: "PROP013", codeLot: "LOT013", adresse: "9 Rue de la Canebière", codePostal: "13001", ville: "Marseille", complementAdresse: "", etage: "intermédiaire" as Etage, typeLogement: 2 as TypeLogement, garageADiffAdresse: false },
  { codeProprietaire: "PROP014", codeLot: "LOT014", adresse: "123 Avenue de Mazargues", codePostal: "13009", ville: "Marseille", complementAdresse: "Villa", etage: "rez-de-chaussée" as Etage, typeLogement: 5 as TypeLogement, garageADiffAdresse: false },
  { codeProprietaire: "PROP015", codeLot: "LOT015", adresse: "67 Rue Grignan", codePostal: "13001", ville: "Marseille", complementAdresse: "Étage 3", etage: "intermédiaire" as Etage, typeLogement: 3 as TypeLogement, garageADiffAdresse: false },
  { codeProprietaire: "PROP016", codeLot: "LOT016", adresse: "14 Place Jean Jaurès", codePostal: "13005", ville: "Marseille", complementAdresse: "", etage: "dernier étage" as Etage, typeLogement: 4 as TypeLogement, garageADiffAdresse: true, adresseGarage: "16 Place Jean Jaurès" },
  { codeProprietaire: "PROP017", codeLot: "LOT017", adresse: "32 Boulevard Baille", codePostal: "13005", ville: "Marseille", complementAdresse: "Appartement 2A", etage: "rez-de-chaussée" as Etage, typeLogement: 1 as TypeLogement, garageADiffAdresse: false },
  { codeProprietaire: "PROP018", codeLot: "LOT018", adresse: "91 Rue de la Joliette", codePostal: "13002", ville: "Marseille", complementAdresse: "", etage: "intermédiaire" as Etage, typeLogement: 2 as TypeLogement, garageADiffAdresse: false },
  { codeProprietaire: "PROP019", codeLot: "LOT019", adresse: "5 Avenue du Général de Gaulle", codePostal: "13008", ville: "Marseille", complementAdresse: "Résidence Les Palmiers", etage: "dernier étage" as Etage, typeLogement: 5 as TypeLogement, garageADiffAdresse: false },
  { codeProprietaire: "PROP020", codeLot: "LOT020", adresse: "28 Rue Saint-Antoine", codePostal: "13015", ville: "Marseille", complementAdresse: "Studio mezzanine", etage: "rez-de-chaussée" as Etage, typeLogement: 1 as TypeLogement, garageADiffAdresse: true, adresseGarage: "30 Rue Saint-Antoine" },
];

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

