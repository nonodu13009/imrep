"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { SectionTitle, Button } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { getAllLots } from "@/lib/lots/queries";
import { requestSortie, requestSuppression } from "@/lib/lots/actions";
import { Lot, LotStatus } from "@/lib/lots/types";
import StatsCards from "@/components/dashboard/StatsCards";
import FiltersBar from "@/components/dashboard/FiltersBar";
import LotsTable from "@/components/dashboard/LotsTable";
import { useToast } from "@/components/ui";

export default function DashboardImrepPage() {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const router = useRouter();
  const { showToast } = useToast();
  const [lots, setLots] = useState<Lot[]>([]);
  const [filteredLots, setFilteredLots] = useState<Lot[]>([]);
  const [statusFilter, setStatusFilter] = useState<LotStatus | "all">("all");
  const [proprietaireFilter, setProprietaireFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [codePostalFilter, setCodePostalFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || roleLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (role !== "imrep") {
      router.push("/dashboard");
      return;
    }

    const fetchLots = async () => {
      try {
        setLoading(true);
        const allLots = await getAllLots();
        setLots(allLots);
        setFilteredLots(allLots);
      } catch (error) {
        console.error("Erreur lors de la récupération des lots:", error);
        showToast("Erreur lors du chargement des lots", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchLots();
  }, [user, role, authLoading, roleLoading, router, showToast]);

  useEffect(() => {
    let filtered = lots;

    if (statusFilter !== "all") {
      filtered = filtered.filter((lot) => lot.statut === statusFilter);
    }

    if (proprietaireFilter) {
      filtered = filtered.filter((lot) => lot.codeProprietaire === proprietaireFilter);
    }

    if (typeFilter) {
      filtered = filtered.filter((lot) => lot.typeLogement === Number(typeFilter));
    }

    if (codePostalFilter) {
      filtered = filtered.filter((lot) => lot.codePostal === codePostalFilter);
    }

    setFilteredLots(filtered);
  }, [statusFilter, proprietaireFilter, typeFilter, codePostalFilter, lots]);

  const handleResetFilters = () => {
    setStatusFilter("all");
    setProprietaireFilter("");
    setTypeFilter("");
    setCodePostalFilter("");
  };

  const handleRequestSortie = async (
    lotId: string,
    sortieData: { motif: string; dateSortieDemandee: Date; dateSortieDeclaration: Date; noteSortie?: string }
  ) => {
    if (!user) return;
    try {
      await requestSortie(lotId, sortieData, user.uid);
      showToast("Demande de sortie créée avec succès", "success");
      const updatedLots = await getAllLots();
      setLots(updatedLots);
    } catch (error: any) {
      showToast(error.message || "Erreur lors de la demande de sortie", "error");
    }
  };

  const handleRequestSuppression = async (
    lotId: string,
    suppressionData: { motif: import("@/lib/lots/types").MotifSuppression; motifAutre?: string; dateSuppressionDemandee: Date; dateSuppressionDeclaration: Date; noteSuppression?: string }
  ) => {
    if (!user) return;
    try {
      await requestSuppression(lotId, suppressionData, user.uid);
      showToast("Demande de suppression créée avec succès", "success");
      const updatedLots = await getAllLots();
      setLots(updatedLots);
    } catch (error: any) {
      showToast(error.message || "Erreur lors de la demande de suppression", "error");
    }
  };

  if (authLoading || roleLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-base text-[var(--color-neutral-600)]">Chargement...</p>
        </div>
      </DashboardLayout>
    );
  }

  const stats = {
    lotsAssures: lots.filter((l) => l.statut === "valide").length,
    enAttenteValidation: lots.filter((l) => l.statut === "en_attente").length,
    suppressionAcceptee: lots.filter((l) => l.suppression?.statutSuppression === "suppression_validee").length,
    sortieEnAttente: lots.filter((l) => l.sortie?.statutSortie === "en_attente_allianz").length,
    sortieValidee: lots.filter((l) => l.sortie?.statutSortie === "sortie_validee").length,
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-[24px]">
        <SectionTitle>Gestion des lots</SectionTitle>
        <Link href="/lots/nouveau">
          <Button variant="primary">
            <Plus size={18} className="mr-2" />
            Créer un lot
          </Button>
        </Link>
      </div>

      <StatsCards {...stats} lots={lots} />

      <FiltersBar
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        proprietaireFilter={proprietaireFilter}
        onProprietaireChange={setProprietaireFilter}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        codePostalFilter={codePostalFilter}
        onCodePostalChange={setCodePostalFilter}
        lots={lots}
        onReset={handleResetFilters}
      />

      {filteredLots.length === 0 ? (
        <div className="text-center py-[40px]">
          <p className="text-base text-[var(--color-neutral-600)]">
            {lots.length === 0 ? "Aucun lot pour le moment" : "Aucun lot ne correspond aux filtres"}
          </p>
        </div>
      ) : (
        <LotsTable lots={filteredLots} role="imrep" currentUserId={user?.uid} onRequestSortie={handleRequestSortie} onRequestSuppression={handleRequestSuppression} />
      )}
    </DashboardLayout>
  );
}
