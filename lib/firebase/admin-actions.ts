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
