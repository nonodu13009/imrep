import { collection, doc, setDoc, updateDoc, arrayUnion, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { getUserRole } from "@/lib/firebase/users";
import { getLotById, isNumeroContratAlreadyUsed } from "./queries";
import { Lot, LotStatus, Sortie, Suppression, HistoryEntry, HistoryType } from "./types";
import {
  notifyLotCreated,
  notifyLotUpdated,
  notifySortieRequested,
  notifySortieValidated,
  notifySortieRefused,
  notifyEntreeValidated,
  notifyEntreeRefused,
} from "@/lib/notifications/lots";

// Helper function to remove undefined values from an object recursively
function removeUndefinedValues(obj: Record<string, any>): Record<string, any> {
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value instanceof Date) {
        cleaned[key] = value;
      } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        const cleanedNested = removeUndefinedValues(value);
        if (Object.keys(cleanedNested).length > 0) {
          cleaned[key] = cleanedNested;
        }
      } else {
        cleaned[key] = value;
      }
    }
  }
  return cleaned;
}

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
    const cleanLotData = removeUndefinedValues(lotData as Record<string, any>);

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

    // Notification Slack
    try {
      await notifyLotCreated({
        codeLot: lotData.codeLot,
        adresse: lotData.adresse,
        createdBy: userId,
        dateEffetDemandee: lotData.dateEffetDemandee,
      });
    } catch (notificationError) {
      // Ne pas faire échouer la création si la notification échoue
      console.error("Erreur lors de l'envoi de la notification Slack (création de lot):", notificationError);
    }

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

    // Tous les utilisateurs IMREP peuvent modifier tous les lots en attente
    // L'action sera tracée dans l'historique avec le userId

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

    // Filtrer les valeurs undefined pour Firestore
    const cleanChangedFields = removeUndefinedValues(changedFields);

    const historyEntry: HistoryEntry = {
      type: "modification",
      timestamp: new Date(),
      userId,
      data: cleanChangedFields,
    };

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

    // Notification Slack
    if (lot) {
      await notifyLotUpdated({
        lotId,
        codeLot: lot.codeLot,
        adresse: lot.adresse,
        updatedBy: userId,
        changedFields: Object.keys(changedFields),
      });
    }
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

    // Tous les utilisateurs IMREP peuvent demander la sortie de tous les lots validés
    // L'action sera tracée dans l'historique avec le userId

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

    const historyData = removeUndefinedValues({
      motif: sortieData.motif,
      dateSortieDemandee: sortieData.dateSortieDemandee,
      dateSortieDeclaration: sortieData.dateSortieDeclaration,
      noteSortie: sortieData.noteSortie,
    });

    const historyEntry: HistoryEntry = {
      type: "demande_sortie",
      timestamp: new Date(),
      userId,
      data: historyData,
    };

    const sortieDataClean = removeUndefinedValues({
      ...sortieData,
      statutSortie: "en_attente_allianz",
      dateSortieDemandee: Timestamp.fromDate(sortieData.dateSortieDemandee),
      dateSortieDeclaration: Timestamp.fromDate(sortieData.dateSortieDeclaration),
    });

    await updateDoc(doc(db, "lots", lotId), {
      sortie: sortieDataClean,
      updatedAt: Timestamp.now(),
      history: arrayUnion(historyEntry),
    });

    // Notification Slack
    if (lot) {
      await notifySortieRequested({
        lotId,
        codeLot: lot.codeLot,
        adresse: lot.adresse,
        numeroContrat: lot.numeroContrat,
        dateSortieDemandee: sortieData.dateSortieDemandee,
        motif: sortieData.motif,
        requestedBy: userId,
      });
    }
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

    // Vérifier que le numéro de contrat n'est pas déjà utilisé par un autre lot validé
    const isAlreadyUsed = await isNumeroContratAlreadyUsed(numeroContrat, lotId);
    if (isAlreadyUsed) {
      throw new Error("Ce numéro de contrat est déjà utilisé par un autre lot validé");
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

    // Notification Slack
    if (lot) {
      await notifyEntreeValidated({
        lotId,
        codeLot: lot.codeLot,
        adresse: lot.adresse,
        numeroContrat,
        validatedBy,
      });
    }
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

    // Notification Slack
    if (lot) {
      await notifyEntreeRefused({
        lotId,
        codeLot: lot.codeLot,
        adresse: lot.adresse,
        motifRefus,
        refusedBy: validatedBy,
      });
    }
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

    // Notification Slack
    if (lot && lot.sortie) {
      await notifySortieValidated({
        lotId,
        codeLot: lot.codeLot,
        adresse: lot.adresse,
        numeroContrat: lot.numeroContrat,
        validatedBy,
      });
    }
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

    // Notification Slack
    if (lot && lot.sortie) {
      await notifySortieRefused({
        lotId,
        codeLot: lot.codeLot,
        adresse: lot.adresse,
        numeroContrat: lot.numeroContrat,
        motifRefus,
        refusedBy: validatedBy,
      });
    }
  } catch (error) {
    console.error("Erreur lors du refus de la sortie:", error);
    throw error;
  }
}

export async function requestSuppression(
  lotId: string,
  suppressionData: Omit<import("./types").Suppression, "statutSuppression" | "validatedBy">,
  userId: string
): Promise<void> {
  try {
    const role = await getUserRole(userId);
    if (role !== "imrep") {
      throw new Error("Seuls les utilisateurs IMREP peuvent demander la suppression d'un lot");
    }

    const lot = await getLotById(lotId);
    if (!lot) {
      throw new Error("Lot non trouvé");
    }

    if (lot.statut !== "en_attente") {
      throw new Error("Seuls les lots en attente peuvent faire l'objet d'une demande de suppression");
    }

    // Tous les utilisateurs IMREP peuvent demander la suppression de tous les lots en attente
    // L'action sera tracée dans l'historique avec le userId

    if (lot.suppression && (lot.suppression.statutSuppression === "en_attente_allianz" || lot.suppression.statutSuppression === "suppression_validee")) {
      throw new Error("Une demande de suppression est déjà en cours ou validée");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateSuppression = suppressionData.dateSuppressionDemandee;
    dateSuppression.setHours(0, 0, 0, 0);

    if (dateSuppression < today) {
      throw new Error("La date de suppression ne peut pas être dans le passé");
    }

    const historyData = removeUndefinedValues({
      motif: suppressionData.motif,
      motifAutre: suppressionData.motifAutre,
      dateSuppressionDemandee: suppressionData.dateSuppressionDemandee,
      dateSuppressionDeclaration: suppressionData.dateSuppressionDeclaration,
      noteSuppression: suppressionData.noteSuppression,
    });

    const historyEntry: HistoryEntry = {
      type: "demande_suppression",
      timestamp: new Date(),
      userId,
      data: historyData,
    };

    const suppressionDataClean = removeUndefinedValues({
      ...suppressionData,
      statutSuppression: "en_attente_allianz",
      dateSuppressionDemandee: Timestamp.fromDate(suppressionData.dateSuppressionDemandee),
      dateSuppressionDeclaration: Timestamp.fromDate(suppressionData.dateSuppressionDeclaration),
    });

    await updateDoc(doc(db, "lots", lotId), {
      suppression: suppressionDataClean,
      updatedAt: Timestamp.now(),
      history: arrayUnion(historyEntry),
    });
  } catch (error) {
    console.error("Erreur lors de la demande de suppression:", error);
    throw error;
  }
}

export async function validateSuppression(lotId: string, validatedBy: string): Promise<void> {
  try {
    const role = await getUserRole(validatedBy);
    if (role !== "allianz") {
      throw new Error("Seuls les utilisateurs Allianz peuvent valider une suppression");
    }

    const lot = await getLotById(lotId);
    if (!lot) {
      throw new Error("Lot non trouvé");
    }

    if (!lot.suppression || lot.suppression.statutSuppression !== "en_attente_allianz") {
      throw new Error("Aucune demande de suppression en attente pour ce lot");
    }

    const historyEntry: HistoryEntry = {
      type: "validation_suppression",
      timestamp: new Date(),
      userId: validatedBy,
      data: {},
    };

    // Marquer le lot comme refusé (suppression validée)
    await updateDoc(doc(db, "lots", lotId), {
      statut: "refuse" as LotStatus,
      motifRefus: "Suppression validée par Allianz",
      "suppression.statutSuppression": "suppression_validee",
      "suppression.validatedBy": validatedBy,
      updatedAt: Timestamp.now(),
      history: arrayUnion(historyEntry),
    });
  } catch (error) {
    console.error("Erreur lors de la validation de la suppression:", error);
    throw error;
  }
}

export async function refuserSuppression(lotId: string, motifRefus: string, validatedBy: string): Promise<void> {
  try {
    const role = await getUserRole(validatedBy);
    if (role !== "allianz") {
      throw new Error("Seuls les utilisateurs Allianz peuvent refuser une suppression");
    }

    const lot = await getLotById(lotId);
    if (!lot) {
      throw new Error("Lot non trouvé");
    }

    if (!lot.suppression || lot.suppression.statutSuppression !== "en_attente_allianz") {
      throw new Error("Aucune demande de suppression en attente pour ce lot");
    }

    if (!motifRefus || motifRefus.trim() === "") {
      throw new Error("Le motif de refus est obligatoire");
    }

    const historyEntry: HistoryEntry = {
      type: "refus_suppression",
      timestamp: new Date(),
      userId: validatedBy,
      data: { motifRefus },
    };

    await updateDoc(doc(db, "lots", lotId), {
      "suppression.statutSuppression": "refusee",
      "suppression.validatedBy": validatedBy,
      updatedAt: Timestamp.now(),
      history: arrayUnion(historyEntry),
    });
  } catch (error) {
    console.error("Erreur lors du refus de la suppression:", error);
    throw error;
  }
}

