export type LotStatus = "en_attente" | "valide" | "refuse";
export type SortieStatus = "en_attente_allianz" | "sortie_validee" | "refusee";
export type SuppressionStatus = "en_attente_allianz" | "suppression_validee" | "refusee";
export type MotifSuppression = "perte_gestion" | "vente" | "autre";
export type UserRole = "imrep" | "allianz";
export type Etage = "rez-de-chaussée" | "intermédiaire" | "dernier étage";
export type TypeLogement = 1 | 2 | 3 | 4 | 5;
export type HistoryType =
  | "creation"
  | "modification"
  | "demande_sortie"
  | "validation_entree"
  | "refus_entree"
  | "validation_sortie"
  | "refus_sortie"
  | "demande_suppression"
  | "validation_suppression"
  | "refus_suppression";

export interface Sortie {
  motif: string;
  dateSortieDemandee: Date;
  dateSortieDeclaration: Date;
  noteSortie?: string;
  statutSortie: SortieStatus;
  validatedBy?: string;
}

export interface Suppression {
  motif: MotifSuppression;
  motifAutre?: string; // Si motif = "autre"
  dateSuppressionDemandee: Date;
  dateSuppressionDeclaration: Date;
  noteSuppression?: string;
  statutSuppression: SuppressionStatus;
  validatedBy?: string;
}

export interface HistoryEntry {
  type: HistoryType;
  timestamp: Date;
  userId: string;
  data: Record<string, unknown>;
}

export interface Lot {
  id?: string;
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
  dateDebutGestion: Date;
  dateEffetDemandee: Date;
  note?: string;
  createdBy: string;
  statut: LotStatus;
  numeroContrat?: string;
  validatedBy?: string;
  motifRefus?: string;
  sortie?: Sortie;
  suppression?: Suppression;
  history: HistoryEntry[];
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  displayName?: string;
}

