"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { SectionTitle, Card, Badge, Select } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { getAllLots } from "@/lib/lots/queries";
import { Lot, HistoryEntry, HistoryType, UserRole } from "@/lib/lots/types";
import { getUserData } from "@/lib/firebase/users";
import { FileText, Edit, LogOut, Trash2, Check, X, Shield, Building2 } from "lucide-react";
import Link from "next/link";

interface LogEntry {
  id: string;
  type: HistoryType;
  timestamp: Date;
  lotId: string;
  lotCode: string;
  lotCodeProprietaire: string;
  lotAdresse: string;
  userId: string;
  userRole?: UserRole;
  data: Record<string, unknown>;
}

export default function JournalPage() {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const router = useRouter();
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmails, setUserEmails] = useState<Record<string, string>>({});
  const [userRoles, setUserRoles] = useState<Record<string, UserRole>>({});
  const [filterRole, setFilterRole] = useState<"all" | "imrep" | "allianz">("all");

  useEffect(() => {
    if (authLoading || roleLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (role !== "imrep" && role !== "allianz") {
      router.push("/dashboard");
      return;
    }

    const fetchLots = async () => {
      try {
        setLoading(true);
        const allLots = await getAllLots();
        setLots(allLots);

        // Récupérer tous les userIds uniques des logs
        const imrepActionTypes: HistoryType[] = ["creation", "modification", "demande_sortie", "demande_suppression"];
        const allianzActionTypes: HistoryType[] = ["validation_entree", "refus_entree", "validation_sortie", "refus_sortie", "validation_suppression", "refus_suppression"];
        const allActionTypes = [...imrepActionTypes, ...allianzActionTypes];
        const userIds = new Set<string>();
        
        allLots.forEach((lot) => {
          if (lot.history && Array.isArray(lot.history)) {
            lot.history.forEach((entry: HistoryEntry) => {
              if (allActionTypes.includes(entry.type)) {
                userIds.add(entry.userId);
              }
            });
          }
        });

        // Récupérer les emails et rôles des utilisateurs
        const emailsMap: Record<string, string> = {};
        const rolesMap: Record<string, UserRole> = {};
        await Promise.all(
          Array.from(userIds).map(async (userId) => {
            try {
              const userData = await getUserData(userId);
              if (userData) {
                emailsMap[userId] = userData.email;
                rolesMap[userId] = userData.role;
              } else {
                emailsMap[userId] = "Utilisateur inconnu";
              }
            } catch (error) {
              console.error(`Erreur lors de la récupération de l'utilisateur ${userId}:`, error);
              emailsMap[userId] = "Utilisateur inconnu";
            }
          })
        );

        setUserEmails(emailsMap);
        setUserRoles(rolesMap);
      } catch (error) {
        console.error("Erreur lors de la récupération des lots:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLots();
  }, [user, role, authLoading, roleLoading, router]);

  // Extraire tous les logs selon le rôle
  const allLogs = useMemo(() => {
    const logs: LogEntry[] = [];
    const imrepActionTypes: HistoryType[] = ["creation", "modification", "demande_sortie", "demande_suppression"];
    const allianzActionTypes: HistoryType[] = ["validation_entree", "refus_entree", "validation_sortie", "refus_sortie", "validation_suppression", "refus_suppression"];

    // Déterminer quelles actions afficher selon le rôle
    let actionTypesToShow: HistoryType[] = [];
    if (role === "imrep") {
      // IMREP voit uniquement ses actions
      actionTypesToShow = imrepActionTypes;
    } else if (role === "allianz") {
      // Allianz voit toutes les actions
      actionTypesToShow = [...imrepActionTypes, ...allianzActionTypes];
    }

    lots.forEach((lot) => {
      if (lot.history && Array.isArray(lot.history)) {
        lot.history.forEach((entry: HistoryEntry) => {
          if (actionTypesToShow.includes(entry.type)) {
            const isImrepAction = imrepActionTypes.includes(entry.type);
            logs.push({
              id: `${lot.id}-${entry.timestamp.getTime()}`,
              type: entry.type,
              timestamp: entry.timestamp,
              lotId: lot.id || "",
              lotCode: lot.codeLot,
              lotCodeProprietaire: lot.codeProprietaire,
              lotAdresse: `${lot.adresse}, ${lot.codePostal} ${lot.ville}`,
              userId: entry.userId,
              userRole: userRoles[entry.userId],
              data: entry.data,
            });
          }
        });
      }
    });

    // Trier par ordre chronologique décroissant (plus récent en premier)
    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [lots, role, userRoles]);

  // Filtrer les logs selon le filtre sélectionné (pour Allianz uniquement)
  const filteredLogs = useMemo(() => {
    if (role !== "allianz" || filterRole === "all") {
      return allLogs;
    }
    return allLogs.filter((log) => {
      const isImrepAction = ["creation", "modification", "demande_sortie", "demande_suppression"].includes(log.type);
      if (filterRole === "imrep") {
        return isImrepAction;
      } else if (filterRole === "allianz") {
        return !isImrepAction;
      }
      return true;
    });
  }, [allLogs, filterRole, role]);

  const getActionLabel = (type: HistoryType): string => {
    const labels: Record<HistoryType, string> = {
      creation: "Création de lot",
      modification: "Modification de lot",
      demande_sortie: "Demande de sortie",
      validation_entree: "Validation d'entrée",
      refus_entree: "Refus d'entrée",
      validation_sortie: "Validation de sortie",
      refus_sortie: "Refus de sortie",
      demande_suppression: "Demande de suppression",
      validation_suppression: "Validation de suppression",
      refus_suppression: "Refus de suppression",
    };
    return labels[type] || type;
  };

  const getActionIcon = (type: HistoryType) => {
    switch (type) {
      case "creation":
        return <FileText size={18} className="text-[var(--color-success)]" />;
      case "modification":
        return <Edit size={18} className="text-[var(--color-primary)]" />;
      case "demande_sortie":
        return <LogOut size={18} className="text-[var(--color-warning)]" />;
      case "demande_suppression":
        return <Trash2 size={18} className="text-[var(--color-danger)]" />;
      case "validation_entree":
      case "validation_sortie":
      case "validation_suppression":
        return <Check size={18} className="text-[var(--color-success)]" />;
      case "refus_entree":
      case "refus_sortie":
      case "refus_suppression":
        return <X size={18} className="text-[var(--color-danger)]" />;
      default:
        return <FileText size={18} />;
    }
  };

  const getActionBadge = (type: HistoryType) => {
    switch (type) {
      case "creation":
        return <Badge type="success">Création</Badge>;
      case "modification":
        return <Badge type="info">Modification</Badge>;
      case "demande_sortie":
        return <Badge type="warning">Sortie</Badge>;
      case "demande_suppression":
        return <Badge type="danger">Suppression</Badge>;
      case "validation_entree":
      case "validation_sortie":
      case "validation_suppression":
        return <Badge type="success">Validation</Badge>;
      case "refus_entree":
      case "refus_sortie":
      case "refus_suppression":
        return <Badge type="danger">Refus</Badge>;
      default:
        return <Badge type="info">{type}</Badge>;
    }
  };

  const getRoleBadge = (logEntry: LogEntry) => {
    const isImrepAction = ["creation", "modification", "demande_sortie", "demande_suppression"].includes(logEntry.type);
    if (isImrepAction) {
      return (
        <Badge type="info" className="bg-blue-100 text-blue-700">
          <Building2 size={12} className="inline mr-1" />
          IMREP
        </Badge>
      );
    } else {
      return (
        <Badge type="info" className="bg-slate-100 text-slate-700">
          <Shield size={12} className="inline mr-1" />
          Allianz
        </Badge>
      );
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatModificationData = (data: Record<string, unknown>): string => {
    const fields = Object.keys(data).filter((key) => !["createdAt", "updatedAt", "history"].includes(key));
    if (fields.length === 0) return "Aucun champ modifié";
    return `Champs modifiés : ${fields.join(", ")}`;
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

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <SectionTitle>Journal des actions</SectionTitle>
        {role === "allianz" && (
          <div className="w-64">
            <Select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as "all" | "imrep" | "allianz")}
            >
              <option value="all">Tous les rôles</option>
              <option value="imrep">IMREP uniquement</option>
              <option value="allianz">Allianz uniquement</option>
            </Select>
          </div>
        )}
      </div>

      {filteredLogs.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-base text-[var(--color-neutral-600)]">Aucune action enregistrée pour le moment</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredLogs.map((log) => (
            <Card key={log.id} className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">{getActionIcon(log.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    {getActionBadge(log.type)}
                    {role === "allianz" && getRoleBadge(log)}
                    <span className="text-sm font-medium text-[var(--color-dark)]">
                      {getActionLabel(log.type)}
                    </span>
                    <span className="text-xs text-[var(--color-neutral-500)]">
                      {formatDate(log.timestamp)}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm text-[var(--color-neutral-700)]">
                    <p>
                      <strong>Lot :</strong>{" "}
                      <Link
                        href={`/lots/${log.lotId}`}
                        className="text-[var(--color-primary)] hover:underline font-medium"
                      >
                        {log.lotCodeProprietaire} - {log.lotCode}
                      </Link>
                    </p>
                    <p>
                      <strong>Adresse :</strong> {log.lotAdresse}
                    </p>
                    <p>
                      <strong>Par :</strong>{" "}
                      <span className="text-[var(--color-primary)] font-medium">
                        {userEmails[log.userId] || "Chargement..."}
                      </span>
                    </p>

                    {log.type === "creation" && (
                      <p className="mt-2 text-xs text-[var(--color-neutral-600)] italic">
                        Lot créé avec succès
                      </p>
                    )}

                    {log.type === "modification" && (
                      <p className="mt-2 text-xs text-[var(--color-neutral-600)]">
                        {formatModificationData(log.data)}
                      </p>
                    )}

                    {log.type === "demande_sortie" && (
                      <div className="mt-2 space-y-1 text-xs text-[var(--color-neutral-600)]">
                        {log.data.motif && <p><strong>Motif :</strong> {String(log.data.motif)}</p>}
                        {log.data.dateSortieDemandee && (
                          <p>
                            <strong>Date de sortie demandée :</strong>{" "}
                            {formatDate(
                              log.data.dateSortieDemandee instanceof Date
                                ? log.data.dateSortieDemandee
                                : (log.data.dateSortieDemandee as any)?.toDate
                                ? (log.data.dateSortieDemandee as any).toDate()
                                : new Date(log.data.dateSortieDemandee as string)
                            )}
                          </p>
                        )}
                      </div>
                    )}

                    {log.type === "demande_suppression" && (
                      <div className="mt-2 space-y-1 text-xs text-[var(--color-neutral-600)]">
                        {log.data.motif && (
                          <p>
                            <strong>Motif :</strong>{" "}
                            {String(log.data.motif) === "perte_gestion"
                              ? "Perte de la gestion"
                              : String(log.data.motif) === "vente"
                              ? "Vente"
                              : String(log.data.motif) === "autre"
                              ? `Autre : ${log.data.motifAutre || ""}`
                              : String(log.data.motif)}
                          </p>
                        )}
                        {log.data.dateSuppressionDemandee && (
                          <p>
                            <strong>Date de suppression demandée :</strong>{" "}
                            {formatDate(
                              log.data.dateSuppressionDemandee instanceof Date
                                ? log.data.dateSuppressionDemandee
                                : (log.data.dateSuppressionDemandee as any)?.toDate
                                ? (log.data.dateSuppressionDemandee as any).toDate()
                                : new Date(log.data.dateSuppressionDemandee as string)
                            )}
                          </p>
                        )}
                      </div>
                    )}

                    {(log.type === "validation_entree" || log.type === "validation_sortie" || log.type === "validation_suppression") && (
                      <div className="mt-2 space-y-1 text-xs text-[var(--color-neutral-600)]">
                        {log.data.numeroContrat && (
                          <p>
                            <strong>Numéro de contrat :</strong> {String(log.data.numeroContrat)}
                          </p>
                        )}
                        {log.data.commentaire && (
                          <p>
                            <strong>Commentaire :</strong> {String(log.data.commentaire)}
                          </p>
                        )}
                      </div>
                    )}

                    {(log.type === "refus_entree" || log.type === "refus_sortie" || log.type === "refus_suppression") && (
                      <div className="mt-2 space-y-1 text-xs text-[var(--color-neutral-600)]">
                        {log.data.motifRefus && (
                          <p>
                            <strong>Motif du refus :</strong> {String(log.data.motifRefus)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
