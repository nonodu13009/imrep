import { collection, query, where, getDocs, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Lot, LotStatus } from "./types";

export async function getLotsByImrep(uid: string): Promise<Lot[]> {
  try {
    // Note: On filtre côté serveur mais on trie côté client pour éviter l'index composite
    // Pour de meilleures performances, créer l'index via Firebase Console
    const q = query(
      collection(db, "lots"),
      where("createdBy", "==", uid)
    );
    const snapshot = await getDocs(q);
    const lots = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      dateDebutGestion: doc.data().dateDebutGestion?.toDate() ?? new Date(),
      dateEffetDemandee: doc.data().dateEffetDemandee?.toDate() ?? new Date(),
      createdAt: doc.data().createdAt?.toDate() ?? new Date(),
      updatedAt: doc.data().updatedAt?.toDate() ?? new Date(),
      sortie: doc.data().sortie
        ? {
            ...doc.data().sortie,
            dateSortieDemandee: doc.data().sortie.dateSortieDemandee?.toDate() ?? new Date(),
            dateSortieDeclaration: doc.data().sortie.dateSortieDeclaration?.toDate() ?? new Date(),
          }
        : undefined,
      suppression: doc.data().suppression
        ? {
            ...doc.data().suppression,
            dateSuppressionDemandee:
              (doc.data().suppression.dateSuppressionDemandee as any)?.toDate?.() ?? new Date(doc.data().suppression.dateSuppressionDemandee),
            dateSuppressionDeclaration:
              (doc.data().suppression.dateSuppressionDeclaration as any)?.toDate?.() ?? new Date(doc.data().suppression.dateSuppressionDeclaration),
          }
        : undefined,
      history: doc.data().history?.map((h: any) => ({
        ...h,
        timestamp: h.timestamp?.toDate() ?? new Date(),
      })) ?? [],
    })) as Lot[];
    
    // Tri côté client par dateEffetDemandee décroissante
    return lots.sort((a, b) => b.dateEffetDemandee.getTime() - a.dateEffetDemandee.getTime());
  } catch (error) {
    console.error("Erreur lors de la récupération des lots IMREP:", error);
    throw error;
  }
}

export async function getAllLots(): Promise<Lot[]> {
  try {
    const q = query(collection(db, "lots"), orderBy("dateEffetDemandee", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      dateDebutGestion: doc.data().dateDebutGestion?.toDate() ?? new Date(),
      dateEffetDemandee: doc.data().dateEffetDemandee?.toDate() ?? new Date(),
      createdAt: doc.data().createdAt?.toDate() ?? new Date(),
      updatedAt: doc.data().updatedAt?.toDate() ?? new Date(),
      sortie: doc.data().sortie
        ? {
            ...doc.data().sortie,
            dateSortieDemandee: doc.data().sortie.dateSortieDemandee?.toDate() ?? new Date(),
            dateSortieDeclaration: doc.data().sortie.dateSortieDeclaration?.toDate() ?? new Date(),
          }
        : undefined,
      suppression: doc.data().suppression
        ? {
            ...doc.data().suppression,
            dateSuppressionDemandee:
              (doc.data().suppression.dateSuppressionDemandee as any)?.toDate?.() ?? new Date(doc.data().suppression.dateSuppressionDemandee),
            dateSuppressionDeclaration:
              (doc.data().suppression.dateSuppressionDeclaration as any)?.toDate?.() ?? new Date(doc.data().suppression.dateSuppressionDeclaration),
          }
        : undefined,
      history: doc.data().history?.map((h: any) => ({
        ...h,
        timestamp: h.timestamp?.toDate() ?? new Date(),
      })) ?? [],
    })) as Lot[];
  } catch (error) {
    console.error("Erreur lors de la récupération de tous les lots:", error);
    throw error;
  }
}

export async function getLotById(lotId: string): Promise<Lot | null> {
  try {
    const { getDocument } = await import("@/lib/firebase/firestore");
    const lot = await getDocument<Lot>("lots", lotId);
    if (!lot) return null;

    return {
      ...lot,
      dateDebutGestion: (lot.dateDebutGestion as any)?.toDate?.() ?? new Date(lot.dateDebutGestion),
      dateEffetDemandee: (lot.dateEffetDemandee as any)?.toDate?.() ?? new Date(lot.dateEffetDemandee),
      createdAt: (lot.createdAt as any)?.toDate?.() ?? new Date(lot.createdAt),
      updatedAt: (lot.updatedAt as any)?.toDate?.() ?? new Date(lot.updatedAt),
      sortie: lot.sortie
        ? {
            ...lot.sortie,
            dateSortieDemandee:
              (lot.sortie.dateSortieDemandee as any)?.toDate?.() ?? new Date(lot.sortie.dateSortieDemandee),
            dateSortieDeclaration:
              (lot.sortie.dateSortieDeclaration as any)?.toDate?.() ?? new Date(lot.sortie.dateSortieDeclaration),
          }
        : undefined,
      suppression: lot.suppression
        ? {
            ...lot.suppression,
            dateSuppressionDemandee:
              (lot.suppression.dateSuppressionDemandee as any)?.toDate?.() ?? new Date(lot.suppression.dateSuppressionDemandee),
            dateSuppressionDeclaration:
              (lot.suppression.dateSuppressionDeclaration as any)?.toDate?.() ?? new Date(lot.suppression.dateSuppressionDeclaration),
          }
        : undefined,
      history: lot.history?.map((h: any) => ({
        ...h,
        timestamp: h.timestamp?.toDate?.() ?? new Date(h.timestamp),
      })) ?? [],
    };
  } catch (error) {
    console.error("Erreur lors de la récupération du lot:", error);
    throw error;
  }
}

/**
 * Vérifie si un numéro de contrat est déjà utilisé par un autre lot validé
 * @param numeroContrat Le numéro de contrat à vérifier
 * @param excludeLotId L'ID du lot à exclure de la vérification (le lot en cours de validation)
 * @returns true si le numéro de contrat est déjà utilisé, false sinon
 */
export async function isNumeroContratAlreadyUsed(numeroContrat: string, excludeLotId?: string): Promise<boolean> {
  try {
    const q = query(
      collection(db, "lots"),
      where("numeroContrat", "==", numeroContrat.trim()),
      where("statut", "==", "valide")
    );
    const snapshot = await getDocs(q);
    
    // Si un excludeLotId est fourni, filtrer les résultats pour exclure ce lot
    if (excludeLotId) {
      const lotsWithSameContract = snapshot.docs.filter((doc) => doc.id !== excludeLotId);
      return lotsWithSameContract.length > 0;
    }
    
    return !snapshot.empty;
  } catch (error) {
    console.error("Erreur lors de la vérification du numéro de contrat:", error);
    throw error;
  }
}

