/**
 * Configuration Firebase Admin SDK
 * Utilisé uniquement côté serveur pour les opérations administratives
 * (suppression d'utilisateurs Auth, etc.)
 */

import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let adminApp: App | null = null;
let adminAuth: Auth | null = null;
let adminDb: Firestore | null = null;

/**
 * Initialise l'Admin SDK Firebase
 * Nécessite FIREBASE_SERVICE_ACCOUNT_KEY dans les variables d'environnement
 */
function initializeAdmin(): { auth: Auth; db: Firestore } {
  // Si déjà initialisé, retourner les instances existantes
  if (adminApp && adminAuth && adminDb) {
    return { auth: adminAuth, db: adminDb };
  }

  // Vérifier que nous sommes côté serveur
  if (typeof window !== "undefined") {
    throw new Error("Firebase Admin SDK ne peut être utilisé que côté serveur");
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountKey) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_KEY n'est pas configuré dans les variables d'environnement"
    );
  }

  try {
    // Parser la clé JSON depuis la variable d'environnement
    const serviceAccount = JSON.parse(serviceAccountKey);

    // Initialiser l'app si elle n'existe pas déjà
    if (getApps().length === 0) {
      adminApp = initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id,
      });
    } else {
      adminApp = getApps()[0];
    }

    adminAuth = getAuth(adminApp);
    adminDb = getFirestore(adminApp);

    return { auth: adminAuth, db: adminDb };
  } catch (error) {
    console.error("Erreur lors de l'initialisation de Firebase Admin:", error);
    throw new Error(
      "Impossible d'initialiser Firebase Admin SDK. Vérifiez FIREBASE_SERVICE_ACCOUNT_KEY."
    );
  }
}

/**
 * Obtient l'instance Auth de l'Admin SDK
 */
export function getAdminAuth(): Auth {
  const { auth } = initializeAdmin();
  return auth;
}

/**
 * Obtient l'instance Firestore de l'Admin SDK
 */
export function getAdminDb(): Firestore {
  const { db } = initializeAdmin();
  return db;
}
