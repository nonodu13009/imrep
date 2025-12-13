"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit, Eye, LogOut as SortieIcon, Check, X } from "lucide-react";
import { Table, TableRow, TableCell, Badge, Button } from "@/components/ui";
import { Lot, LotStatus } from "@/lib/lots/types";
import ConfirmModal from "@/components/ui/ConfirmModal";
import ValidationModal from "./ValidationModal";
import RefusModal from "./RefusModal";

interface LotsTableProps {
  lots: Lot[];
  role: "imrep" | "allianz";
  onValidateEntree?: (lotId: string, numeroContrat: string) => void;
  onRefuseEntree?: (lotId: string, motif: string) => void;
  onValidateSortie?: (lotId: string) => void;
  onRefuseSortie?: (lotId: string, motif: string) => void;
  onRequestSortie?: (lotId: string) => void;
}

export default function LotsTable({
  lots,
  role,
  onValidateEntree,
  onRefuseEntree,
  onValidateSortie,
  onRefuseSortie,
  onRequestSortie,
}: LotsTableProps) {
  const [validationModal, setValidationModal] = useState<{ isOpen: boolean; lotId: string; type: "entree" | "sortie" } | null>(null);
  const [refusModal, setRefusModal] = useState<{ isOpen: boolean; lotId: string; type: "entree" | "sortie" } | null>(null);
  const [sortieModal, setSortieModal] = useState<{ isOpen: boolean; lotId: string } | null>(null);

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

  const headers = role === "allianz" 
    ? ["Code Lot", "Adresse", "IMREP", "Statut", "Date effet", "Actions"]
    : ["Code Lot", "Adresse", "Statut", "Date effet", "Actions"];

  return (
    <>
      <Table headers={headers}>
        {lots.map((lot) => (
          <TableRow key={lot.id}>
            <TableCell className="font-medium">{lot.codeLot}</TableCell>
            <TableCell>{lot.adresse}</TableCell>
            {role === "allianz" && (
              <TableCell className="text-sm text-[#64748b]">
                {lot.createdBy}
              </TableCell>
            )}
            <TableCell>{getStatusBadge(lot.statut)}</TableCell>
            <TableCell>{formatDate(lot.dateEffetDemandee)}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Link href={`/lots/${lot.id}`}>
                  <Button variant="secondary" className="p-2">
                    <Eye size={16} />
                  </Button>
                </Link>

                {role === "imrep" && (
                  <>
                    {lot.statut === "en_attente" && (
                      <Link href={`/lots/${lot.id}/edit`}>
                        <Button variant="secondary" className="p-2">
                          <Edit size={16} />
                        </Button>
                      </Link>
                    )}
                    {lot.statut === "valide" && !lot.sortie && (
                      <Button
                        variant="secondary"
                        className="p-2"
                        onClick={() => setSortieModal({ isOpen: true, lotId: lot.id! })}
                      >
                        <SortieIcon size={16} />
                      </Button>
                    )}
                  </>
                )}

                {role === "allianz" && (
                  <>
                    {lot.statut === "en_attente" && (
                      <>
                        <Button
                          variant="primary"
                          className="p-2"
                          onClick={() => setValidationModal({ isOpen: true, lotId: lot.id!, type: "entree" })}
                        >
                          <Check size={16} />
                        </Button>
                        <Button
                          variant="danger"
                          className="p-2"
                          onClick={() => setRefusModal({ isOpen: true, lotId: lot.id!, type: "entree" })}
                        >
                          <X size={16} />
                        </Button>
                      </>
                    )}
                    {lot.sortie?.statutSortie === "en_attente_allianz" && (
                      <>
                        <Button
                          variant="primary"
                          className="p-2"
                          onClick={() => setValidationModal({ isOpen: true, lotId: lot.id!, type: "sortie" })}
                        >
                          <Check size={16} />
                        </Button>
                        <Button
                          variant="danger"
                          className="p-2"
                          onClick={() => setRefusModal({ isOpen: true, lotId: lot.id!, type: "sortie" })}
                        >
                          <X size={16} />
                        </Button>
                      </>
                    )}
                  </>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </Table>

      {validationModal && (
        <ValidationModal
          isOpen={validationModal.isOpen}
          onClose={() => setValidationModal(null)}
          onConfirm={(numeroContrat) => {
            if (validationModal.type === "entree" && onValidateEntree && numeroContrat) {
              onValidateEntree(validationModal.lotId, numeroContrat);
            } else if (validationModal.type === "sortie" && onValidateSortie) {
              onValidateSortie(validationModal.lotId);
            }
            setValidationModal(null);
          }}
          title={validationModal.type === "entree" ? "Valider l'entrée" : "Valider la sortie"}
          requireInput={validationModal.type === "entree"}
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
            }
            setRefusModal(null);
          }}
          title={refusModal.type === "entree" ? "Refuser l'entrée" : "Refuser la sortie"}
        />
      )}

      {sortieModal && (
        <ConfirmModal
          isOpen={sortieModal.isOpen}
          onClose={() => setSortieModal(null)}
          onConfirm={() => {
            if (onRequestSortie) {
              onRequestSortie(sortieModal.lotId);
            }
            setSortieModal(null);
          }}
          title="Demander une sortie"
          message="Êtes-vous sûr de vouloir demander la sortie de ce lot ?"
          variant="primary"
        />
      )}
    </>
  );
}

