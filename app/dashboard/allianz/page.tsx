"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { SectionTitle } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { getAllLots } from "@/lib/lots/queries";
import { getImrepList } from "@/lib/firebase/users";
import { Lot, LotStatus } from "@/lib/lots/types";
import { validateEntree, refuserEntree, validateSortie, refuserSortie } from "@/lib/lots/actions";
import StatsCards from "@/components/dashboard/StatsCards";
import FiltersBar from "@/components/dashboard/FiltersBar";
import LotsTable from "@/components/dashboard/LotsTable";
import { useToast } from "@/components/ui";

export default function DashboardAllianzPage() {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const router = useRouter();
  const { showToast } = useToast();
  const [lots, setLots] = useState<Lot[]>([]);
  const [filteredLots, setFilteredLots] = useState<Lot[]>([]);
  const [imrepList, setImrepList] = useState<Array<{ id: string; email: string }>>([]);
  const [statusFilter, setStatusFilter] = useState<LotStatus | "all">("all");
  const [imrepFilter, setImrepFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || roleLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (role !== "allianz") {
      router.push("/dashboard");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [allLots, imreps] = await Promise.all([getAllLots(), getImrepList()]);
        setLots(allLots);
        setFilteredLots(allLots);
        setImrepList(imreps);
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
        showToast("Erreur lors du chargement des données", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, role, authLoading, roleLoading, router, showToast]);

  useEffect(() => {
    let filtered = lots;

    if (statusFilter !== "all") {
      filtered = filtered.filter((lot) => lot.statut === statusFilter);
    }

    if (imrepFilter !== "all") {
      filtered = filtered.filter((lot) => lot.createdBy === imrepFilter);
    }

    setFilteredLots(filtered);
  }, [statusFilter, imrepFilter, lots]);

  const handleValidateEntree = async (lotId: string, numeroContrat: string) => {
    if (!user) return;
    try {
      await validateEntree(lotId, numeroContrat, user.uid);
      showToast("Entrée validée avec succès", "success");
      const updatedLots = await getAllLots();
      setLots(updatedLots);
    } catch (error: any) {
      showToast(error.message || "Erreur lors de la validation", "error");
    }
  };

  const handleRefuseEntree = async (lotId: string, motif: string) => {
    if (!user) return;
    try {
      await refuserEntree(lotId, motif, user.uid);
      showToast("Entrée refusée", "success");
      const updatedLots = await getAllLots();
      setLots(updatedLots);
    } catch (error: any) {
      showToast(error.message || "Erreur lors du refus", "error");
    }
  };

  const handleRefuseSortie = async (lotId: string, motif: string) => {
    if (!user) return;
    try {
      await refuserSortie(lotId, motif, user.uid);
      showToast("Sortie refusée", "success");
      const updatedLots = await getAllLots();
      setLots(updatedLots);
    } catch (error: any) {
      showToast(error.message || "Erreur lors du refus", "error");
    }
  };

  const handleValidateSortie = async (lotId: string) => {
    if (!user) return;
    try {
      await validateSortie(lotId, user.uid);
      showToast("Sortie validée avec succès", "success");
      const updatedLots = await getAllLots();
      setLots(updatedLots);
    } catch (error: any) {
      showToast(error.message || "Erreur lors de la validation", "error");
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
    total: lots.length,
    enAttente: lots.filter((l) => l.statut === "en_attente").length,
    valides: lots.filter((l) => l.statut === "valide").length,
    refuses: lots.filter((l) => l.statut === "refuse").length,
    sortiesEnAttente: lots.filter((l) => l.sortie?.statutSortie === "en_attente_allianz").length,
  };

  return (
    <DashboardLayout>
      <SectionTitle>Gestion des lots</SectionTitle>

      <StatsCards {...stats} />

      <FiltersBar
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        imrepFilter={imrepFilter}
        onImrepChange={setImrepFilter}
        imrepList={imrepList}
        showImrepFilter={true}
      />

      {filteredLots.length === 0 ? (
        <div className="text-center py-[40px]">
          <p className="text-base text-[var(--color-neutral-600)]">
            {lots.length === 0 ? "Aucun lot pour le moment" : "Aucun lot ne correspond aux filtres"}
          </p>
        </div>
      ) : (
        <LotsTable
          lots={filteredLots}
          role="allianz"
          onValidateEntree={handleValidateEntree}
          onRefuseEntree={handleRefuseEntree}
          onValidateSortie={handleValidateSortie}
          onRefuseSortie={handleRefuseSortie}
        />
      )}
    </DashboardLayout>
  );
}

