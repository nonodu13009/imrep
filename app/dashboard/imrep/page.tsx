"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { SectionTitle, Button } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { getLotsByImrep } from "@/lib/lots/queries";
import { deleteLot, requestSortie } from "@/lib/lots/actions";
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
        const userLots = await getLotsByImrep(user.uid);
        setLots(userLots);
        setFilteredLots(userLots);
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
    if (statusFilter === "all") {
      setFilteredLots(lots);
    } else {
      setFilteredLots(lots.filter((lot) => lot.statut === statusFilter));
    }
  }, [statusFilter, lots]);

  const handleDeleteLot = async (lotId: string) => {
    if (!user) return;
    try {
      await deleteLot(lotId, user.uid);
      showToast("Lot supprimé avec succès", "success");
      const updatedLots = await getLotsByImrep(user.uid);
      setLots(updatedLots);
    } catch (error: any) {
      showToast(error.message || "Erreur lors de la suppression", "error");
    }
  };

  const handleRequestSortie = async (
    lotId: string,
    sortieData: { motif: string; dateSortieDemandee: Date; dateSortieDeclaration: Date; noteSortie?: string }
  ) => {
    if (!user) return;
    try {
      await requestSortie(lotId, sortieData, user.uid);
      showToast("Demande de sortie créée avec succès", "success");
      const updatedLots = await getLotsByImrep(user.uid);
      setLots(updatedLots);
    } catch (error: any) {
      showToast(error.message || "Erreur lors de la demande de sortie", "error");
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
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-[24px]">
        <SectionTitle>Mes lots</SectionTitle>
        <Link href="/lots/nouveau">
          <Button variant="primary">
            <Plus size={18} className="mr-2" />
            Créer un lot
          </Button>
        </Link>
      </div>

      <StatsCards {...stats} />

      <FiltersBar statusFilter={statusFilter} onStatusChange={setStatusFilter} />

      {filteredLots.length === 0 ? (
        <div className="text-center py-[40px]">
          <p className="text-base text-[var(--color-neutral-600)]">
            {lots.length === 0 ? "Aucun lot pour le moment" : "Aucun lot ne correspond aux filtres"}
          </p>
        </div>
      ) : (
        <LotsTable lots={filteredLots} role="imrep" onDeleteLot={handleDeleteLot} onRequestSortie={handleRequestSortie} />
      )}
    </DashboardLayout>
  );
}
