"use server";

/**
 * Server Actions pour les opérations administratives Firebase
 * Utilise l'Admin SDK pour supprimer les utilisateurs de Firebase Auth
 */

import { getAdminAuth, getAdminDb } from "./admin";
import { UserRole } from "@/lib/lots/types";

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

/**
 * Crée un nouvel utilisateur dans Firebase Auth ET Firestore
 * Nécessite FIREBASE_SERVICE_ACCOUNT_KEY dans les variables d'environnement
 * @param email - L'email de l'utilisateur
 * @param password - Le mot de passe (minimum 6 caractères)
 * @param role - Le rôle de l'utilisateur (imrep ou allianz)
 * @param displayName - Le nom d'affichage (optionnel)
 */
export async function createUserWithAdmin(
  email: string,
  password: string,
  role: UserRole,
  displayName?: string
): Promise<{ uid: string; email: string }> {
  try {
    // Vérifier que FIREBASE_SERVICE_ACCOUNT_KEY est configuré
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      throw new Error(
        "FIREBASE_SERVICE_ACCOUNT_KEY n'est pas configuré. Impossible de créer l'utilisateur."
      );
    }

    // Validation
    if (!email || !email.includes("@")) {
      throw new Error("Email invalide");
    }

    if (!password || password.length < 6) {
      throw new Error("Le mot de passe doit contenir au moins 6 caractères");
    }

    // Le type UserRole garantit déjà que role est "imrep" ou "allianz"

    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();

    // Créer l'utilisateur dans Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: displayName || email.split("@")[0],
      emailVerified: false,
    });

    const uid = userRecord.uid;

    // Créer l'utilisateur dans Firestore
    await adminDb.collection("users").doc(uid).set({
      email,
      role,
      isActive: true,
      createdAt: new Date(),
      displayName: displayName || email.split("@")[0],
    });

    console.log(`[Admin] Utilisateur créé: ${email} (${uid}) avec le rôle ${role}`);

    return { uid, email };
  } catch (error: any) {
    console.error("[Admin] Erreur lors de la création de l'utilisateur:", error);
    
    // Si l'utilisateur existe déjà dans Auth, essayer de le récupérer et créer dans Firestore
    if (error?.code === "auth/email-already-exists") {
      try {
        const adminAuth = getAdminAuth();
        const userRecord = await adminAuth.getUserByEmail(email);
        const uid = userRecord.uid;

        // Vérifier si l'utilisateur existe déjà dans Firestore
        const userDoc = await adminDb.collection("users").doc(uid).get();
        if (!userDoc.exists) {
          // Créer dans Firestore seulement
          await adminDb.collection("users").doc(uid).set({
            email,
            role,
            isActive: true,
            createdAt: new Date(),
            displayName: displayName || email.split("@")[0],
          });
          console.log(`[Admin] Utilisateur ajouté à Firestore: ${email} (${uid})`);
          return { uid, email };
        } else {
          throw new Error("Cet utilisateur existe déjà");
        }
      } catch (recoveryError: any) {
        throw new Error(recoveryError.message || "Cet utilisateur existe déjà");
      }
    }

    throw new Error(
      error.message || "Erreur lors de la création de l'utilisateur"
    );
  }
}
