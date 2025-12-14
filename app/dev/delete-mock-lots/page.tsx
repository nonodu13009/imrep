"use client";

import { useState } from "react";
import { Button, Card, SectionTitle } from "@/components/ui";
import { useToast } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { getAllLots } from "@/lib/lots/queries";
import { deleteDocument } from "@/lib/firebase/firestore";
import { Lot } from "@/lib/lots/types";

export default function DeleteMockLotsPage() {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ deleted: 0, total: 0, found: 0 });

  // Pattern pour identifier les lots mockés : LOT001 à LOT020
  const isMockLot = (codeLot: string): boolean => {
    const mockPattern = /^LOT\d{3}$/;
    return mockPattern.test(codeLot);
  };

  const deleteMockLots = async () => {
    if (!user) {
      showToast("Vous devez être connecté", "error");
      return;
    }

    if (role !== "allianz") {
      showToast("Seuls les utilisateurs Allianz peuvent supprimer des lots", "error");
      return;
    }

    setLoading(true);
    setProgress({ deleted: 0, total: 0, found: 0 });

    try {
      // Récupérer tous les lots
      const allLots = await getAllLots();
      
      // Filtrer les lots mockés
      const mockLots = allLots.filter((lot) => isMockLot(lot.codeLot));
      
      if (mockLots.length === 0) {
        showToast("Aucun lot mocké trouvé", "info");
        setLoading(false);
        return;
      }

      setProgress({ deleted: 0, total: mockLots.length, found: mockLots.length });

      let deletedCount = 0;
      let errorCount = 0;

      for (const lot of mockLots) {
        if (!lot.id) {
          console.error(`Lot sans ID: ${lot.codeLot}`);
          errorCount++;
          continue;
        }

        try {
          await deleteDocument("lots", lot.id);
          deletedCount++;
          setProgress({ deleted: deletedCount, total: mockLots.length, found: mockLots.length });
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
          console.error(`Erreur lors de la suppression du lot ${lot.codeLot}:`, errorMessage);
          errorCount++;
        }

        // Petit délai pour éviter de surcharger Firebase
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      setLoading(false);

      if (deletedCount > 0) {
        showToast(
          `${deletedCount} lots mockés supprimés${errorCount > 0 ? `, ${errorCount} erreurs` : ""}`,
          "success"
        );
      } else {
        showToast("Aucun lot n'a pu être supprimé", "error");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      console.error("Erreur lors de la suppression:", errorMessage);
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
        <SectionTitle>Suppression des lots mockés</SectionTitle>
        <p className="text-sm text-slate-500 mb-6">
          Supprime tous les lots dont le code commence par "LOT" suivi de 3 chiffres (LOT001 à LOT020)
        </p>

        {progress.total > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">
                Progression : {progress.deleted} / {progress.total}
              </span>
              <span className="text-sm font-medium text-red-600">
                {Math.round((progress.deleted / progress.total) * 100)}%
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-red-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(progress.deleted / progress.total) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {progress.found} lots mockés trouvés
            </p>
          </div>
        )}

        <Button
          variant="primary"
          onClick={deleteMockLots}
          isLoading={loading}
          className="w-full bg-red-600 hover:bg-red-700"
          disabled={role !== "allianz"}
        >
          {loading ? "Suppression en cours..." : "Supprimer les lots mockés"}
        </Button>

        {role !== "allianz" && (
          <p className="text-xs text-red-500 mt-2 text-center">
            Seuls les utilisateurs Allianz peuvent supprimer des lots
          </p>
        )}

        <div className="mt-6 p-4 bg-red-50 rounded-lg text-sm border border-red-200">
          <p className="font-semibold mb-2 text-red-800">⚠️ Attention :</p>
          <ul className="space-y-1 text-red-700">
            <li>• Cette action est irréversible</li>
            <li>• Seuls les lots avec code "LOT001" à "LOT020" seront supprimés</li>
            <li>• Les autres lots ne seront pas affectés</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
