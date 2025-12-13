import { collection, doc, setDoc, updateDoc, arrayUnion, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { getUserRole } from "@/lib/firebase/users";
import { getLotById } from "./queries";
import { Lot, LotStatus, Sortie, HistoryEntry, HistoryType } from "./types";

export async function createLot(lotData: Omit<Lot, "id" | "statut" | "createdAt" | "updatedAt" | "history" | "createdBy">, userId: string): Promise<string> {
  try {
    const role = await getUserRole(userId);
    if (role !== "imrep") {
      throw new Error("Seuls les utilisateurs IMREP peuvent créer des lots");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateEffet = lotData.dateEffetDemandee;
    dateEffet.setHours(0, 0, 0, 0);

    if (dateEffet < today) {
      throw new Error("La date d'effet ne peut pas être dans le passé");
    }

    const lotRef = doc(collection(db, "lots"));
    
    // Filtrer les valeurs undefined pour Firestore
    const cleanLotData: Record<string, any> = {};
    Object.keys(lotData).forEach((key) => {
      const value = lotData[key as keyof typeof lotData];
      if (value !== undefined) {
        cleanLotData[key] = value;
      }
    });

    const historyEntry: HistoryEntry = {
      type: "creation",
      timestamp: new Date(),
      userId,
      data: cleanLotData,
    };

    const firestoreData: Record<string, any> = {
      ...cleanLotData,
      statut: "en_attente" as LotStatus,
      createdBy: userId,
      history: [historyEntry],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      dateDebutGestion: Timestamp.fromDate(lotData.dateDebutGestion),
      dateEffetDemandee: Timestamp.fromDate(lotData.dateEffetDemandee),
    };

    await setDoc(lotRef, firestoreData);

    return lotRef.id;
  } catch (error) {
    console.error("Erreur lors de la création du lot:", error);
    throw error;
  }
}

export async function updateLot(lotId: string, updates: Partial<Lot>, userId: string): Promise<void> {
  try {
    const lot = await getLotById(lotId);
    if (!lot) {
      throw new Error("Lot non trouvé");
    }

    if (lot.statut !== "en_attente") {
      throw new Error("Seuls les lots en attente peuvent être modifiés");
    }

    if (lot.createdBy !== userId) {
      throw new Error("Vous ne pouvez modifier que vos propres lots");
    }

    const forbiddenFields = ["numeroContrat", "validatedBy", "statut", "sortie", "history", "createdBy"];
    for (const field of forbiddenFields) {
      if (field in updates) {
        throw new Error(`Le champ ${field} ne peut pas être modifié`);
      }
    }

    const changedFields: Record<string, unknown> = {};
    Object.keys(updates).forEach((key) => {
      if (updates[key as keyof Lot] !== lot[key as keyof Lot]) {
        changedFields[key] = updates[key as keyof Lot];
      }
    });

    if (Object.keys(changedFields).length === 0) {
      return;
    }

    const historyEntry: HistoryEntry = {
      type: "modification",
      timestamp: new Date(),
      userId,
      data: changedFields,
    };

    // Filtrer les valeurs undefined pour Firestore
    const cleanChangedFields: Record<string, any> = {};
    Object.keys(changedFields).forEach((key) => {
      const value = changedFields[key];
      if (value !== undefined) {
        cleanChangedFields[key] = value;
      }
    });

    const updateData: any = {
      ...cleanChangedFields,
      updatedAt: Timestamp.now(),
      history: arrayUnion(historyEntry),
    };

    if (updates.dateDebutGestion) {
      updateData.dateDebutGestion = Timestamp.fromDate(updates.dateDebutGestion);
    }
    if (updates.dateEffetDemandee) {
      updateData.dateEffetDemandee = Timestamp.fromDate(updates.dateEffetDemandee);
    }

    await updateDoc(doc(db, "lots", lotId), updateData);
  } catch (error) {
    console.error("Erreur lors de la modification du lot:", error);
    throw error;
  }
}

export async function requestSortie(lotId: string, sortieData: Omit<Sortie, "statutSortie">, userId: string): Promise<void> {
  try {
    const lot = await getLotById(lotId);
    if (!lot) {
      throw new Error("Lot non trouvé");
    }

    if (lot.statut !== "valide") {
      throw new Error("Seuls les lots validés peuvent faire l'objet d'une demande de sortie");
    }

    if (lot.createdBy !== userId) {
      throw new Error("Vous ne pouvez demander la sortie que de vos propres lots");
    }

    if (lot.sortie && (lot.sortie.statutSortie === "en_attente_allianz" || lot.sortie.statutSortie === "sortie_validee")) {
      throw new Error("Une sortie est déjà en cours ou validée");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateSortie = sortieData.dateSortieDemandee;
    dateSortie.setHours(0, 0, 0, 0);

    if (dateSortie < today) {
      throw new Error("La date de sortie ne peut pas être dans le passé");
    }

    const historyEntry: HistoryEntry = {
      type: "demande_sortie",
      timestamp: new Date(),
      userId,
      data: { motif: sortieData.motif, dateSortieDemandee: sortieData.dateSortieDemandee },
    };

    await updateDoc(doc(db, "lots", lotId), {
      sortie: {
        ...sortieData,
        statutSortie: "en_attente_allianz",
        dateSortieDemandee: Timestamp.fromDate(sortieData.dateSortieDemandee),
        dateSortieDeclaration: Timestamp.fromDate(sortieData.dateSortieDeclaration),
      },
      updatedAt: Timestamp.now(),
      history: arrayUnion(historyEntry),
    });
  } catch (error) {
    console.error("Erreur lors de la demande de sortie:", error);
    throw error;
  }
}

export async function validateEntree(lotId: string, numeroContrat: string, validatedBy: string): Promise<void> {
  try {
    const role = await getUserRole(validatedBy);
    if (role !== "allianz") {
      throw new Error("Seuls les utilisateurs Allianz peuvent valider une entrée");
    }

    const lot = await getLotById(lotId);
    if (!lot) {
      throw new Error("Lot non trouvé");
    }

    if (lot.statut !== "en_attente") {
      throw new Error("Seuls les lots en attente peuvent être validés");
    }

    if (!numeroContrat || numeroContrat.trim() === "") {
      throw new Error("Le numéro de contrat est obligatoire");
    }

    const historyEntry: HistoryEntry = {
      type: "validation_entree",
      timestamp: new Date(),
      userId: validatedBy,
      data: { numeroContrat },
    };

    await updateDoc(doc(db, "lots", lotId), {
      statut: "valide" as LotStatus,
      numeroContrat,
      validatedBy,
      updatedAt: Timestamp.now(),
      history: arrayUnion(historyEntry),
    });
  } catch (error) {
    console.error("Erreur lors de la validation de l'entrée:", error);
    throw error;
  }
}

export async function refuserEntree(lotId: string, motifRefus: string, validatedBy: string): Promise<void> {
  try {
    const role = await getUserRole(validatedBy);
    if (role !== "allianz") {
      throw new Error("Seuls les utilisateurs Allianz peuvent refuser une entrée");
    }

    const lot = await getLotById(lotId);
    if (!lot) {
      throw new Error("Lot non trouvé");
    }

    if (lot.statut !== "en_attente") {
      throw new Error("Seuls les lots en attente peuvent être refusés");
    }

    if (!motifRefus || motifRefus.trim() === "") {
      throw new Error("Le motif de refus est obligatoire");
    }

    const historyEntry: HistoryEntry = {
      type: "refus_entree",
      timestamp: new Date(),
      userId: validatedBy,
      data: { motifRefus },
    };

    await updateDoc(doc(db, "lots", lotId), {
      statut: "refuse" as LotStatus,
      motifRefus,
      validatedBy,
      updatedAt: Timestamp.now(),
      history: arrayUnion(historyEntry),
    });
  } catch (error) {
    console.error("Erreur lors du refus de l'entrée:", error);
    throw error;
  }
}

export async function validateSortie(lotId: string, validatedBy: string): Promise<void> {
  try {
    const role = await getUserRole(validatedBy);
    if (role !== "allianz") {
      throw new Error("Seuls les utilisateurs Allianz peuvent valider une sortie");
    }

    const lot = await getLotById(lotId);
    if (!lot) {
      throw new Error("Lot non trouvé");
    }

    if (!lot.sortie || lot.sortie.statutSortie !== "en_attente_allianz") {
      throw new Error("Aucune sortie en attente pour ce lot");
    }

    const historyEntry: HistoryEntry = {
      type: "validation_sortie",
      timestamp: new Date(),
      userId: validatedBy,
      data: {},
    };

    await updateDoc(doc(db, "lots", lotId), {
      "sortie.statutSortie": "sortie_validee",
      "sortie.validatedBy": validatedBy,
      updatedAt: Timestamp.now(),
      history: arrayUnion(historyEntry),
    });
  } catch (error) {
    console.error("Erreur lors de la validation de la sortie:", error);
    throw error;
  }
}

export async function refuserSortie(lotId: string, motifRefus: string, validatedBy: string): Promise<void> {
  try {
    const role = await getUserRole(validatedBy);
    if (role !== "allianz") {
      throw new Error("Seuls les utilisateurs Allianz peuvent refuser une sortie");
    }

    const lot = await getLotById(lotId);
    if (!lot) {
      throw new Error("Lot non trouvé");
    }

    if (!lot.sortie || lot.sortie.statutSortie !== "en_attente_allianz") {
      throw new Error("Aucune sortie en attente pour ce lot");
    }

    if (!motifRefus || motifRefus.trim() === "") {
      throw new Error("Le motif de refus est obligatoire");
    }

    const historyEntry: HistoryEntry = {
      type: "refus_sortie",
      timestamp: new Date(),
      userId: validatedBy,
      data: { motifRefus },
    };

    await updateDoc(doc(db, "lots", lotId), {
      "sortie.statutSortie": "refusee",
      "sortie.validatedBy": validatedBy,
      updatedAt: Timestamp.now(),
      history: arrayUnion(historyEntry),
    });
  } catch (error) {
    console.error("Erreur lors du refus de la sortie:", error);
    throw error;
  }
}

export async function deleteLot(lotId: string, userId: string): Promise<void> {
  try {
    const role = await getUserRole(userId);
    if (role !== "imrep") {
      throw new Error("Seuls les utilisateurs IMREP peuvent supprimer des lots");
    }

    const lot = await getLotById(lotId);
    if (!lot) {
      throw new Error("Lot non trouvé");
    }

    if (lot.statut !== "en_attente") {
      throw new Error("Seuls les lots en attente peuvent être supprimés");
    }

    if (lot.createdBy !== userId) {
      throw new Error("Vous ne pouvez supprimer que vos propres lots");
    }

    // Suppression du document
    await updateDoc(doc(db, "lots", lotId), {
      statut: "refuse" as LotStatus, // On marque comme refusé plutôt que de supprimer pour garder l'historique
      motifRefus: "Supprimé par l'IMREP",
      updatedAt: Timestamp.now(),
    });

    // Note: On ne supprime pas vraiment le document pour garder l'historique
    // Si vous voulez une vraie suppression, utilisez deleteDoc au lieu de updateDoc
    // await deleteDoc(doc(db, "lots", lotId));
  } catch (error) {
    console.error("Erreur lors de la suppression du lot:", error);
    throw error;
  }
}

