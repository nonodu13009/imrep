"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { SectionTitle, Button, Card, Badge } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { getLotById } from "@/lib/lots/queries";
import { requestSuppression } from "@/lib/lots/actions";
import { Lot, LotStatus } from "@/lib/lots/types";
import { useToast } from "@/components/ui";
import SuppressionModal from "@/components/dashboard/SuppressionModal";

export default function LotDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const router = useRouter();
  const params = useParams();
  const { showToast } = useToast();
  const [lot, setLot] = useState<Lot | null>(null);
  const [loading, setLoading] = useState(true);
  const [suppressionModal, setSuppressionModal] = useState(false);

  const lotId = params?.id as string;

  useEffect(() => {
    if (authLoading || roleLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    const fetchLot = async () => {
      try {
        setLoading(true);
        const lotData = await getLotById(lotId);
        if (!lotData) {
          showToast("Lot non trouvé", "error");
          router.push("/dashboard");
          return;
        }

        setLot(lotData);
      } catch (error) {
        console.error("Erreur lors de la récupération du lot:", error);
        showToast("Erreur lors du chargement du lot", "error");
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchLot();
  }, [user, role, authLoading, roleLoading, router, lotId, showToast]);

  const handleRequestSuppression = async (
    suppressionData: { motif: import("@/lib/lots/types").MotifSuppression; motifAutre?: string; dateSuppressionDemandee: Date; dateSuppressionDeclaration: Date; noteSuppression?: string }
  ) => {
    if (!lot || !user) return;
    try {
      await requestSuppression(lot.id!, suppressionData, user.uid);
      showToast("Demande de suppression créée avec succès", "success");
      const updatedLot = await getLotById(lot.id!);
      setLot(updatedLot);
      setSuppressionModal(false);
    } catch (error: any) {
      showToast(error.message || "Erreur lors de la demande de suppression", "error");
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const getStatusBadge = (statut: LotStatus) => {
    const badges = {
      en_attente: <Badge type="warning">En attente</Badge>,
      valide: <Badge type="success">Validé</Badge>,
      refuse: <Badge type="danger">Refusé</Badge>,
    };
    return badges[statut];
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

  if (!lot) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-base text-[var(--color-neutral-600)]">Lot non trouvé</p>
        </div>
      </DashboardLayout>
    );
  }

  const canEdit = role === "imrep" && lot.statut === "en_attente" && lot.createdBy === user?.uid;
  const canRequestSuppression = role === "imrep" && lot.statut === "en_attente" && lot.createdBy === user?.uid && !lot.suppression;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-[var(--spacing-md)]">
        <div className="flex items-center gap-[var(--spacing-sm)]">
          <Link href="/dashboard">
            <Button variant="secondary" className="p-2">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <SectionTitle>Détails du lot</SectionTitle>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link href={`/lots/${lot.id}/edit`}>
              <Button variant="secondary">
                <Edit size={18} className="mr-2" />
                Modifier
              </Button>
            </Link>
          )}
          {canRequestSuppression && (
            <Button variant="danger" onClick={() => setSuppressionModal(true)}>
              <Trash2 size={18} className="mr-2" />
              Demander la suppression
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--spacing-md)]">
        {/* Informations principales */}
        <Card>
          <h3 className="text-[18px] font-semibold text-[var(--color-dark)] mb-[var(--spacing-sm)]">
            Informations principales
          </h3>
          <div className="space-y-[var(--spacing-sm)]">
            <div>
              <p className="text-sm text-[var(--color-neutral-500)] mb-1">Code propriétaire</p>
              <p className="text-base font-medium">{lot.codeProprietaire}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--color-neutral-500)] mb-1">Nom du propriétaire</p>
              <p className="text-base font-medium">{lot.nomProprietaire}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--color-neutral-500)] mb-1">Code lot</p>
              <p className="text-base font-medium">{lot.codeLot}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--color-neutral-500)] mb-1">Statut</p>
              {getStatusBadge(lot.statut)}
            </div>
            {lot.numeroContrat && (
              <div>
                <p className="text-sm text-[var(--color-neutral-500)] mb-1">Numéro de contrat</p>
                <p className="text-base font-medium">{lot.numeroContrat}</p>
              </div>
            )}
            {lot.motifRefus && (
              <div>
                <p className="text-sm text-[var(--color-neutral-500)] mb-1">Motif de refus</p>
                <p className="text-base text-[var(--color-danger)]">{lot.motifRefus}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Adresse */}
        <Card>
          <h3 className="text-[18px] font-semibold text-[var(--color-dark)] mb-[var(--spacing-sm)]">
            Adresse
          </h3>
          <div className="space-y-[var(--spacing-sm)]">
            <div>
              <p className="text-sm text-[var(--color-neutral-500)] mb-1">Adresse</p>
              <p className="text-base">{lot.adresse}</p>
            </div>
            {lot.complementAdresse && (
              <div>
                <p className="text-sm text-[var(--color-neutral-500)] mb-1">Complément</p>
                <p className="text-base">{lot.complementAdresse}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-[var(--color-neutral-500)] mb-1">Code postal</p>
              <p className="text-base">{lot.codePostal}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--color-neutral-500)] mb-1">Ville</p>
              <p className="text-base">{lot.ville}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--color-neutral-500)] mb-1">Étage</p>
              <p className="text-base capitalize">{lot.etage}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--color-neutral-500)] mb-1">Type de logement</p>
              <p className="text-base">{lot.typeLogement} pièce{lot.typeLogement > 1 ? "s" : ""}</p>
            </div>
          </div>
        </Card>

        {/* Garage */}
        <Card>
          <h3 className="text-[18px] font-semibold text-[var(--color-dark)] mb-[var(--spacing-sm)]">
            Garage
          </h3>
          <div className="space-y-[var(--spacing-sm)]">
            <div>
              <p className="text-sm text-[var(--color-neutral-500)] mb-1">Garage à adresse différente</p>
              <p className="text-base">{lot.garageADiffAdresse ? "Oui" : "Non"}</p>
            </div>
            {lot.garageADiffAdresse && lot.adresseGarage && (
              <div>
                <p className="text-sm text-[var(--color-neutral-500)] mb-1">Adresse du garage</p>
                <p className="text-base">{lot.adresseGarage}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Dates */}
        <Card>
          <h3 className="text-[18px] font-semibold text-[var(--color-dark)] mb-[var(--spacing-sm)]">
            Dates
          </h3>
          <div className="space-y-[var(--spacing-sm)]">
            <div>
              <p className="text-sm text-[var(--color-neutral-500)] mb-1">Date de début de gestion</p>
              <p className="text-base">{formatDate(lot.dateDebutGestion)}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--color-neutral-500)] mb-1">Date d'effet demandée</p>
              <p className="text-base">{formatDate(lot.dateEffetDemandee)}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--color-neutral-500)] mb-1">Date de création</p>
              <p className="text-base">{formatDate(lot.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--color-neutral-500)] mb-1">Dernière modification</p>
              <p className="text-base">{formatDate(lot.updatedAt)}</p>
            </div>
          </div>
        </Card>

        {/* Note */}
        {lot.note && (
          <Card className="lg:col-span-2">
            <h3 className="text-[18px] font-semibold text-[var(--color-dark)] mb-[var(--spacing-sm)]">
              Note
            </h3>
            <p className="text-base text-[var(--color-neutral-700)] whitespace-pre-wrap">{lot.note}</p>
          </Card>
        )}

        {/* Sortie */}
        {lot.sortie && (
          <Card className="lg:col-span-2">
            <h3 className="text-[18px] font-semibold text-[var(--color-dark)] mb-[var(--spacing-sm)]">
              Demande de sortie
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--spacing-sm)]">
              <div>
                <p className="text-sm text-[var(--color-neutral-500)] mb-1">Statut</p>
                <Badge
                  type={
                    lot.sortie.statutSortie === "sortie_validee"
                      ? "success"
                      : lot.sortie.statutSortie === "refusee"
                      ? "danger"
                      : "warning"
                  }
                >
                  {lot.sortie.statutSortie === "sortie_validee"
                    ? "Sortie validée"
                    : lot.sortie.statutSortie === "refusee"
                    ? "Sortie refusée"
                    : "En attente"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-[var(--color-neutral-500)] mb-1">Date de sortie demandée</p>
                <p className="text-base">{formatDate(lot.sortie.dateSortieDemandee)}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--color-neutral-500)] mb-1">Date de déclaration</p>
                <p className="text-base">{formatDate(lot.sortie.dateSortieDeclaration)}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--color-neutral-500)] mb-1">Motif</p>
                <p className="text-base">{lot.sortie.motif}</p>
              </div>
              {lot.sortie.noteSortie && (
                <div className="md:col-span-2">
                  <p className="text-sm text-[var(--color-neutral-500)] mb-1">Note de sortie</p>
                  <p className="text-base">{lot.sortie.noteSortie}</p>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      {suppressionModal && (
        <SuppressionModal
          isOpen={suppressionModal}
          onClose={() => setSuppressionModal(false)}
          onConfirm={handleRequestSuppression}
        />
      )}
    </DashboardLayout>
  );
}

