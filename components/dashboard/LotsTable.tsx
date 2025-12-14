"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Edit, Eye, LogOut as SortieIcon, Check, X, Trash2, MapPin, ArrowUpDown, ArrowUp, ArrowDown, FileCheck, FileX, Ban } from "lucide-react";
import { TableRow, TableCell, Badge, Button, Card, Tooltip } from "@/components/ui";
import { Lot, LotStatus } from "@/lib/lots/types";
import ConfirmModal from "@/components/ui/ConfirmModal";
import ValidationModal from "./ValidationModal";
import RefusModal from "./RefusModal";
import SortieModal from "./SortieModal";
import SuppressionModal from "./SuppressionModal";

interface LotsTableProps {
  lots: Lot[];
  role: "imrep" | "allianz";
  currentUserId?: string; // Pour vérifier si l'utilisateur est le créateur du lot
  onValidateEntree?: (lotId: string, numeroContrat: string) => void;
  onRefuseEntree?: (lotId: string, motif: string) => void;
  onValidateSortie?: (lotId: string) => void;
  onRefuseSortie?: (lotId: string, motif: string) => void;
  onRequestSortie?: (lotId: string, sortieData: { motif: string; dateSortieDemandee: Date; dateSortieDeclaration: Date; noteSortie?: string }) => void;
  onRequestSuppression?: (lotId: string, suppressionData: { motif: import("@/lib/lots/types").MotifSuppression; motifAutre?: string; dateSuppressionDemandee: Date; dateSuppressionDeclaration: Date; noteSuppression?: string }) => void;
  onValidateSuppression?: (lotId: string) => void;
  onRefuseSuppression?: (lotId: string, motif: string) => void;
}

export default function LotsTable({
  lots,
  role,
  currentUserId,
  onValidateEntree,
  onRefuseEntree,
  onValidateSortie,
  onRefuseSortie,
  onRequestSortie,
  onRequestSuppression,
  onValidateSuppression,
  onRefuseSuppression,
}: LotsTableProps) {
  const [validationModal, setValidationModal] = useState<{ isOpen: boolean; lotId: string; type: "entree" | "sortie" | "suppression" } | null>(null);
  const [refusModal, setRefusModal] = useState<{ isOpen: boolean; lotId: string; type: "entree" | "sortie" | "suppression" } | null>(null);
  const [sortieModal, setSortieModal] = useState<{ isOpen: boolean; lotId: string } | null>(null);
  const [suppressionModal, setSuppressionModal] = useState<{ isOpen: boolean; lotId: string } | null>(null);
  const [tooltipLotId, setTooltipLotId] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const getStatusBadge = (statut: LotStatus) => {
    const badges = {
      en_attente: <Badge type="warning">En attente</Badge>,
      valide: <Badge type="success">Validé</Badge>,
      refuse: <Badge type="danger">Refusé</Badge>,
    };
    return badges[statut];
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const formatTypeLogement = (type: number) => {
    return `${type} pièce${type > 1 ? "s" : ""}`;
  };

  const getFullAddress = (lot: Lot) => {
    const parts = [lot.adresse];
    if (lot.complementAdresse) parts.push(lot.complementAdresse);
    parts.push(`${lot.codePostal} ${lot.ville}`);
    return parts.join(", ");
  };

  type SortableColumn = "codeProprietaire" | "codeLot" | "codePostal" | "ville" | "typeLogement" | "statut" | "dateEffetDemandee" | "nomProprietaire";

  const handleSort = (column: SortableColumn) => {
    if (sortColumn === column) {
      // Inverser la direction si on clique sur la même colonne
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Nouvelle colonne, trier par ordre croissant
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedLots = useMemo(() => {
    if (!sortColumn) return lots;

    return [...lots].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortColumn) {
        case "codeProprietaire":
          aValue = a.codeProprietaire.toLowerCase();
          bValue = b.codeProprietaire.toLowerCase();
          break;
        case "codeLot":
          aValue = a.codeLot.toLowerCase();
          bValue = b.codeLot.toLowerCase();
          break;
        case "codePostal":
          aValue = a.codePostal;
          bValue = b.codePostal;
          break;
        case "ville":
          aValue = a.ville.toLowerCase();
          bValue = b.ville.toLowerCase();
          break;
        case "typeLogement":
          aValue = a.typeLogement;
          bValue = b.typeLogement;
          break;
        case "statut":
          aValue = a.statut;
          bValue = b.statut;
          break;
        case "dateEffetDemandee":
          aValue = a.dateEffetDemandee.getTime();
          bValue = b.dateEffetDemandee.getTime();
          break;
        case "nomProprietaire":
          aValue = (a.nomProprietaire || "").toLowerCase();
          bValue = (b.nomProprietaire || "").toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [lots, sortColumn, sortDirection]);

  const getSortIcon = (column: SortableColumn) => {
    if (sortColumn !== column) {
      return <ArrowUpDown size={14} className="text-[var(--color-neutral-400)]" />;
    }
    return sortDirection === "asc" 
      ? <ArrowUp size={14} className="text-[var(--color-primary)]" />
      : <ArrowDown size={14} className="text-[var(--color-primary)]" />;
  };

  const SortableHeader = ({ label, column, className = "" }: { label: string; column: SortableColumn; className?: string }) => (
    <th
      className={`px-6 py-4 text-left uppercase text-xs tracking-wide text-neutral-500 font-semibold cursor-pointer hover:bg-neutral-100 transition-all duration-[var(--transition-base)] hover:scale-[1.02] ${className}`}
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center gap-2">
        <span className="transition-colors duration-[var(--transition-base)]">{label}</span>
        <span className="transition-transform duration-[var(--transition-base)]">{getSortIcon(column)}</span>
      </div>
    </th>
  );

  return (
    <>
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-50">
                <SortableHeader label="Code propriétaire" column="codeProprietaire" />
                <SortableHeader label="Code Lot" column="codeLot" />
                <th className="px-6 py-4 text-left uppercase text-xs tracking-wide text-neutral-500 font-semibold">
                  Adresse
                </th>
                <SortableHeader label="Code postal" column="codePostal" />
                <SortableHeader label="Ville" column="ville" />
                <SortableHeader label="Type" column="typeLogement" />
                <SortableHeader label="Statut" column="statut" />
                <SortableHeader label="Date effet" column="dateEffetDemandee" />
                <th className="px-6 py-4 text-left uppercase text-xs tracking-wide text-neutral-500 font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
        {sortedLots.map((lot, index) => (
          <TableRow key={lot.id} className="animate-fade-in" style={{ animationDelay: `${index * 20}ms` }}>
            <TableCell className="font-medium">{lot.codeProprietaire}</TableCell>
            <TableCell className="font-medium">{lot.codeLot}</TableCell>
            <TableCell>
              <div className="relative inline-block">
                <button
                  onMouseEnter={() => setTooltipLotId(lot.id!)}
                  onMouseLeave={() => setTooltipLotId(null)}
                  className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
                  aria-label="Voir l'adresse complète"
                >
                  <MapPin size={18} />
                </button>
                {tooltipLotId === lot.id && (
                  <div className="absolute z-50 left-0 bottom-full mb-2 w-64">
                    <div className="relative p-3 bg-[var(--color-dark)] text-white text-sm rounded-[var(--radius-md)] shadow-[var(--shadow-hover)]">
                      <div className="space-y-1">
                        <p className="font-medium">{lot.adresse}</p>
                        {lot.complementAdresse && <p className="text-white/90">{lot.complementAdresse}</p>}
                        <p className="text-white/90">{lot.codePostal} {lot.ville}</p>
                        {lot.adresseGarage && (
                          <div className="mt-2 pt-2 border-t border-white/20">
                            <p className="text-white/80 text-xs">Garage:</p>
                            <p className="text-white/90">{lot.adresseGarage}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="absolute left-4 bottom-0 transform translate-y-1/2 rotate-45 w-3 h-3 bg-[var(--color-dark)] rounded-[2px]"></div>
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell>{lot.codePostal}</TableCell>
            <TableCell>{lot.ville}</TableCell>
            <TableCell className="text-sm text-[var(--color-neutral-600)]">
              {formatTypeLogement(lot.typeLogement)}
            </TableCell>
            <TableCell>{getStatusBadge(lot.statut)}</TableCell>
            <TableCell>{formatDate(lot.dateEffetDemandee)}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1.5">
                <Tooltip content="Voir les détails du lot" position="top">
                  <Link href={`/lots/${lot.id}`}>
                    <Button variant="secondary" className="p-1.5 min-w-[32px] h-[32px]">
                      <Eye size={14} />
                    </Button>
                  </Link>
                </Tooltip>

                {role === "imrep" && (
                  <>
                    {lot.statut === "en_attente" && !lot.suppression && (
                      <>
                        <Tooltip content="Modifier le lot" position="top">
                          <Link href={`/lots/${lot.id}/edit`}>
                            <Button variant="secondary" className="p-1.5 min-w-[32px] h-[32px]">
                              <Edit size={14} />
                            </Button>
                          </Link>
                        </Tooltip>
                        {onRequestSuppression && (
                          <Tooltip
                            content="Demander la suppression du lot. Motifs : perte de la gestion, vente ou autre."
                            position="top"
                          >
                            <Button
                              variant="danger"
                              className="p-1.5 min-w-[32px] h-[32px]"
                              onClick={() => setSuppressionModal({ isOpen: true, lotId: lot.id! })}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </Tooltip>
                        )}
                      </>
                    )}
                    {lot.statut === "valide" && !lot.sortie && (
                      <Tooltip
                        content="Demander l'arrêt de la gestion du lot. Le lot reste dans le système mais la gestion s'arrêtera après validation par Allianz."
                        position="top"
                      >
                        <Button
                          variant="secondary"
                          className="p-1.5 min-w-[32px] h-[32px]"
                          onClick={() => setSortieModal({ isOpen: true, lotId: lot.id! })}
                        >
                          <SortieIcon size={14} />
                        </Button>
                      </Tooltip>
                    )}
                  </>
                )}

                {role === "allianz" && (
                  <>
                    {lot.statut === "en_attente" && (
                      <>
                        <Tooltip content="Valider l'entrée du lot dans le système. Le lot passera au statut 'Validé' et sera considéré comme assuré." position="top">
                          <Button
                            variant="primary"
                            className="p-1.5 min-w-[32px] h-[32px]"
                            onClick={() => setValidationModal({ isOpen: true, lotId: lot.id!, type: "entree" })}
                          >
                            <FileCheck size={14} />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Refuser l'entrée du lot. Le lot passera au statut 'Refusé'." position="top">
                          <Button
                            variant="danger"
                            className="p-1.5 min-w-[32px] h-[32px]"
                            onClick={() => setRefusModal({ isOpen: true, lotId: lot.id!, type: "entree" })}
                          >
                            <FileX size={14} />
                          </Button>
                        </Tooltip>
                      </>
                    )}
                    {lot.sortie?.statutSortie === "en_attente_allianz" && (
                      <>
                        <Tooltip content="Valider la sortie du lot. La gestion s'arrêtera à la date demandée. Le lot restera dans le système mais ne sera plus géré." position="top">
                          <Button
                            variant="primary"
                            className="p-1.5 min-w-[32px] h-[32px]"
                            onClick={() => setValidationModal({ isOpen: true, lotId: lot.id!, type: "sortie" })}
                          >
                            <SortieIcon size={14} />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Refuser la demande de sortie. Le lot restera dans le système avec son statut actuel." position="top">
                          <Button
                            variant="danger"
                            className="p-1.5 min-w-[32px] h-[32px]"
                            onClick={() => setRefusModal({ isOpen: true, lotId: lot.id!, type: "sortie" })}
                          >
                            <Ban size={14} />
                          </Button>
                        </Tooltip>
                      </>
                    )}
                    {lot.suppression?.statutSuppression === "en_attente_allianz" && (
                      <>
                        <Tooltip content="Valider la suppression du lot. Le lot sera définitivement retiré du système." position="top">
                          <Button
                            variant="danger"
                            className="p-1.5 min-w-[32px] h-[32px]"
                            onClick={() => setValidationModal({ isOpen: true, lotId: lot.id!, type: "suppression" })}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Refuser la demande de suppression. Le lot restera dans le système avec son statut actuel." position="top">
                          <Button
                            variant="secondary"
                            className="p-1.5 min-w-[32px] h-[32px]"
                            onClick={() => setRefusModal({ isOpen: true, lotId: lot.id!, type: "suppression" })}
                          >
                            <X size={14} />
                          </Button>
                        </Tooltip>
                      </>
                    )}
                  </>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
            </tbody>
          </table>
        </div>
      </Card>

      {validationModal && (
        <ValidationModal
          isOpen={validationModal.isOpen}
          onClose={() => setValidationModal(null)}
          onConfirm={(numeroContrat) => {
            if (validationModal.type === "entree" && onValidateEntree && numeroContrat) {
              onValidateEntree(validationModal.lotId, numeroContrat);
            } else if (validationModal.type === "sortie" && onValidateSortie) {
              onValidateSortie(validationModal.lotId);
            } else if (validationModal.type === "suppression" && onValidateSuppression) {
              onValidateSuppression(validationModal.lotId);
            }
            setValidationModal(null);
          }}
          type={validationModal.type}
        />
      )}

      {refusModal && (
        <RefusModal
          isOpen={refusModal.isOpen}
          onClose={() => setRefusModal(null)}
          onConfirm={(motif) => {
            if (refusModal.type === "entree" && onRefuseEntree) {
              onRefuseEntree(refusModal.lotId, motif);
            } else if (refusModal.type === "sortie" && onRefuseSortie) {
              onRefuseSortie(refusModal.lotId, motif);
            } else if (refusModal.type === "suppression" && onRefuseSuppression) {
              onRefuseSuppression(refusModal.lotId, motif);
            }
            setRefusModal(null);
          }}
          type={refusModal.type}
        />
      )}

      {sortieModal && (
        <SortieModal
          isOpen={sortieModal.isOpen}
          onClose={() => setSortieModal(null)}
          onConfirm={(sortieData) => {
            if (onRequestSortie) {
              onRequestSortie(sortieModal.lotId, sortieData);
            }
            setSortieModal(null);
          }}
        />
      )}

      {suppressionModal && (
        <SuppressionModal
          isOpen={suppressionModal.isOpen}
          onClose={() => setSuppressionModal(null)}
          onConfirm={(suppressionData) => {
            if (onRequestSuppression) {
              onRequestSuppression(suppressionModal.lotId, suppressionData);
            }
            setSuppressionModal(null);
          }}
        />
      )}
    </>
  );
}

