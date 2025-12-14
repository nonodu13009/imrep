/**
 * Notifications Slack pour les événements liés aux lots
 */
import { sendSlackNotification } from "@/lib/slack";
import { getUserData } from "@/lib/firebase/users";
import { Lot } from "@/lib/lots/types";

/**
 * Formate le nom d'utilisateur pour l'affichage
 */
async function formatUserInfo(userId: string): Promise<string> {
  try {
    const userData = await getUserData(userId);
    if (userData) {
      return userData.displayName || userData.email || userId;
    }
    return userId;
  } catch {
    return userId;
  }
}

/**
 * Notification : Lot créé
 */
export async function notifyLotCreated(data: {
  codeLot: string;
  adresse: string;
  createdBy: string;
  dateEffetDemandee?: Date;
}): Promise<void> {
  try {
    const userInfo = await formatUserInfo(data.createdBy);
    const dateEffet = data.dateEffetDemandee
      ? data.dateEffetDemandee.toLocaleDateString("fr-FR")
      : "N/A";

    const message = `🔔 [Création] — Nouveau lot créé\n` +
      `Détails : Code lot ${data.codeLot}, Adresse ${data.adresse}, Date d'effet ${dateEffet}, Créé par ${userInfo}`;

    const result = await sendSlackNotification(message);
    
    if (!result) {
      console.error("Échec de l'envoi de la notification Slack pour la création du lot");
      console.error("Vérifiez les logs ci-dessus pour plus de détails");
    } else {
      console.log("Notification Slack envoyée avec succès pour la création du lot");
    }
  } catch (error) {
    console.error("Erreur lors de la notification de création de lot:", error);
  }
}

/**
 * Notification : Lot modifié
 */
export async function notifyLotUpdated(data: {
  lotId: string;
  codeLot: string;
  adresse: string;
  updatedBy: string;
  changedFields: string[];
}): Promise<void> {
  try {
    const userInfo = await formatUserInfo(data.updatedBy);
    const fieldsList = data.changedFields.length > 0 ? data.changedFields.join(", ") : "Aucun";

    await sendSlackNotification(
      `🔔 [Modification] — Lot modifié\n` +
        `Détails : Code lot ${data.codeLot}, Adresse ${data.adresse}, Champs modifiés ${fieldsList}, Modifié par ${userInfo}`
    );
  } catch (error) {
    console.error("Erreur lors de la notification de modification de lot:", error);
  }
}

/**
 * Notification : Demande de sortie
 */
export async function notifySortieRequested(data: {
  lotId: string;
  codeLot: string;
  adresse: string;
  numeroContrat?: string;
  dateSortieDemandee: Date;
  motif: string;
  requestedBy: string;
}): Promise<void> {
  try {
    const userInfo = await formatUserInfo(data.requestedBy);
    const dateSortie = data.dateSortieDemandee.toLocaleDateString("fr-FR");
    const contrat = data.numeroContrat || "N/A";

    await sendSlackNotification(
      `🔔 [Sortie] — Demande de sortie\n` +
        `Détails : Code lot ${data.codeLot}, Adresse ${data.adresse}, Contrat ${contrat}, Date ${dateSortie}, Motif ${data.motif}, Demandé par ${userInfo}`
    );
  } catch (error) {
    console.error("Erreur lors de la notification de demande de sortie:", error);
  }
}

/**
 * Notification : Sortie validée
 */
export async function notifySortieValidated(data: {
  lotId: string;
  codeLot: string;
  adresse: string;
  numeroContrat?: string;
  validatedBy: string;
}): Promise<void> {
  try {
    const userInfo = await formatUserInfo(data.validatedBy);
    const contrat = data.numeroContrat || "N/A";

    await sendSlackNotification(
      `🔔 [Sortie] — Sortie validée\n` +
        `Détails : Code lot ${data.codeLot}, Adresse ${data.adresse}, Contrat ${contrat}, Validée par ${userInfo}`
    );
  } catch (error) {
    console.error("Erreur lors de la notification de validation de sortie:", error);
  }
}

/**
 * Notification : Sortie refusée
 */
export async function notifySortieRefused(data: {
  lotId: string;
  codeLot: string;
  adresse: string;
  numeroContrat?: string;
  motifRefus: string;
  refusedBy: string;
}): Promise<void> {
  try {
    const userInfo = await formatUserInfo(data.refusedBy);
    const contrat = data.numeroContrat || "N/A";

    await sendSlackNotification(
      `🔔 [Sortie] — Sortie refusée\n` +
        `Détails : Code lot ${data.codeLot}, Adresse ${data.adresse}, Contrat ${contrat}, Motif ${data.motifRefus}, Refusée par ${userInfo}`
    );
  } catch (error) {
    console.error("Erreur lors de la notification de refus de sortie:", error);
  }
}

/**
 * Notification : Entrée validée
 */
export async function notifyEntreeValidated(data: {
  lotId: string;
  codeLot: string;
  adresse: string;
  numeroContrat: string;
  validatedBy: string;
}): Promise<void> {
  try {
    const userInfo = await formatUserInfo(data.validatedBy);

    await sendSlackNotification(
      `🔔 [Validation] — Entrée validée\n` +
        `Détails : Code lot ${data.codeLot}, Adresse ${data.adresse}, Contrat ${data.numeroContrat}, Validée par ${userInfo}`
    );
  } catch (error) {
    console.error("Erreur lors de la notification de validation d'entrée:", error);
  }
}

/**
 * Notification : Entrée refusée
 */
export async function notifyEntreeRefused(data: {
  lotId: string;
  codeLot: string;
  adresse: string;
  motifRefus: string;
  refusedBy: string;
}): Promise<void> {
  try {
    const userInfo = await formatUserInfo(data.refusedBy);

    await sendSlackNotification(
      `🔔 [Refus] — Entrée refusée\n` +
        `Détails : Code lot ${data.codeLot}, Adresse ${data.adresse}, Motif ${data.motifRefus}, Refusée par ${userInfo}`
    );
  } catch (error) {
    console.error("Erreur lors de la notification de refus d'entrée:", error);
  }
}
