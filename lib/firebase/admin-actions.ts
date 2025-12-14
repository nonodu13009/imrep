"use server";

/**
 * Server Actions pour les opérations administratives Firebase
 * Utilise l'Admin SDK pour supprimer les utilisateurs de Firebase Auth
 */

import { getAdminAuth, getAdminDb } from "./admin";

const ROOT_ADMIN_EMAIL = "jeanmichel@allianz-nogaro.fr";

/**
 * Supprime un utilisateur de Firebase Auth ET Firestore
 * Nécessite FIREBASE_SERVICE_ACCOUNT_KEY dans les variables d'environnement
 */
export async function deleteUserWithAdmin(uid: string, userEmail: string): Promise<void> {
  try {
    // Vérifier que ce n'est pas le root admin
    if (userEmail === ROOT_ADMIN_EMAIL) {
      throw new Error("Le root admin ne peut pas être supprimé");
    }

    // Vérifier que FIREBASE_SERVICE_ACCOUNT_KEY est configuré
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      throw new Error(
        "FIREBASE_SERVICE_ACCOUNT_KEY n'est pas configuré. Impossible de supprimer l'utilisateur de Firebase Auth."
      );
    }

    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();

    // Supprimer de Firebase Auth
    try {
      await adminAuth.deleteUser(uid);
      console.log(`[Admin] Utilisateur ${uid} supprimé de Firebase Auth`);
    } catch (authError: any) {
      // Si l'utilisateur n'existe pas dans Auth, continuer quand même
      if (authError?.code !== "auth/user-not-found") {
        console.error("[Admin] Erreur lors de la suppression de Firebase Auth:", authError);
        throw new Error(`Erreur Firebase Auth: ${authError.message}`);
      }
    }

    // Supprimer de Firestore
    try {
      await adminDb.collection("users").doc(uid).delete();
      console.log(`[Admin] Utilisateur ${uid} supprimé de Firestore`);
    } catch (firestoreError: any) {
      console.error("[Admin] Erreur lors de la suppression de Firestore:", firestoreError);
      // Ne pas bloquer si l'utilisateur n'existe pas dans Firestore
      if (firestoreError?.code !== "not-found") {
        throw new Error(`Erreur Firestore: ${firestoreError.message}`);
      }
    }
  } catch (error) {
    console.error("[Admin] Erreur lors de la suppression complète de l'utilisateur:", error);
    throw error;
  }
}

/**
 * Modifie le mot de passe d'un utilisateur dans Firebase Auth
 * Nécessite FIREBASE_SERVICE_ACCOUNT_KEY dans les variables d'environnement
 * @param uid - L'UID de l'utilisateur
 * @param newPassword - Le nouveau mot de passe (minimum 6 caractères)
 * @param userEmail - L'email de l'utilisateur (pour vérification)
 */
export async function updateUserPassword(
  uid: string,
  newPassword: string,
  userEmail: string
): Promise<void> {
  try {
    // Vérifier que FIREBASE_SERVICE_ACCOUNT_KEY est configuré
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      throw new Error(
        "FIREBASE_SERVICE_ACCOUNT_KEY n'est pas configuré. Impossible de modifier le mot de passe."
      );
    }

    // Vérifier la longueur du mot de passe
    if (!newPassword || newPassword.length < 6) {
      throw new Error("Le mot de passe doit contenir au moins 6 caractères");
    }

    const adminAuth = getAdminAuth();

    // Modifier le mot de passe dans Firebase Auth
    await adminAuth.updateUser(uid, {
      password: newPassword,
    });

    console.log(`[Admin] Mot de passe modifié pour l'utilisateur ${userEmail} (${uid})`);
  } catch (error: any) {
    console.error("[Admin] Erreur lors de la modification du mot de passe:", error);
    throw new Error(
      error.message || "Erreur lors de la modification du mot de passe"
    );
  }
}
