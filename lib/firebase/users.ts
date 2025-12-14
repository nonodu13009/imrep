import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./config";
import { User, UserRole } from "@/lib/lots/types";
import { deleteUserWithAdmin } from "./admin-actions";

export const ROOT_ADMIN_EMAIL = "jeanmichel@allianz-nogaro.fr";

export async function getUserRole(uid: string): Promise<UserRole | null> {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return userDoc.data().role as UserRole;
    }
    return null;
  } catch (error) {
    console.error("Erreur lors de la récupération du rôle:", error);
    throw error;
  }
}

export async function getUserData(uid: string): Promise<User | null> {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        id: userDoc.id,
        email: data.email,
        role: data.role,
        isActive: data.isActive ?? true,
        createdAt: data.createdAt?.toDate() ?? new Date(),
        displayName: data.displayName,
      };
    }
    return null;
  } catch (error) {
    console.error("Erreur lors de la récupération des données utilisateur:", error);
    throw error;
  }
}

export async function createUser(userData: {
  email: string;
  role: UserRole;
  uid: string;
  displayName?: string;
}): Promise<void> {
  try {
    await setDoc(doc(db, "users", userData.uid), {
      email: userData.email,
      role: userData.role,
      isActive: true,
      createdAt: new Date(),
      displayName: userData.displayName || "",
    });
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur:", error);
    throw error;
  }
}

export async function updateUserRole(uid: string, newRole: UserRole): Promise<void> {
  try {
    const userData = await getUserData(uid);
    if (!userData) {
      throw new Error("Utilisateur non trouvé");
    }

    if (userData.email === ROOT_ADMIN_EMAIL) {
      throw new Error("Le root admin ne peut pas être modifié");
    }

    await updateDoc(doc(db, "users", uid), {
      role: newRole,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Erreur lors de la modification du rôle:", error);
    throw error;
  }
}

export async function toggleUserStatus(uid: string, isActive: boolean): Promise<void> {
  try {
    const userData = await getUserData(uid);
    if (!userData) {
      throw new Error("Utilisateur non trouvé");
    }

    if (userData.email === ROOT_ADMIN_EMAIL) {
      throw new Error("Le root admin ne peut pas être désactivé");
    }

    await updateDoc(doc(db, "users", uid), {
      isActive,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Erreur lors de la modification du statut:", error);
    throw error;
  }
}

export async function deleteUser(uid: string): Promise<void> {
  try {
    const userData = await getUserData(uid);
    if (!userData) {
      throw new Error("Utilisateur non trouvé");
    }

    if (userData.email === ROOT_ADMIN_EMAIL) {
      throw new Error("Le root admin ne peut pas être supprimé");
    }

    // Essayer d'abord avec l'Admin SDK (supprime Auth + Firestore)
    // Si FIREBASE_SERVICE_ACCOUNT_KEY n'est pas configuré, fallback sur Firestore uniquement
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      try {
        await deleteUserWithAdmin(uid, userData.email);
        return; // Succès avec Admin SDK
      } catch (adminError: any) {
        console.warn("[deleteUser] Erreur avec Admin SDK, fallback sur Firestore:", adminError.message);
        // Continuer avec la suppression Firestore uniquement
      }
    }

    // Fallback : supprimer uniquement de Firestore (si Admin SDK non disponible)
    await deleteDoc(doc(db, "users", uid));
    console.log(`[deleteUser] Utilisateur ${uid} supprimé de Firestore uniquement`);
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error);
    throw error;
  }
}

export async function getAllUsers(): Promise<User[]> {
  try {
    const usersSnapshot = await getDocs(collection(db, "users"));
    return usersSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email,
        role: data.role,
        isActive: data.isActive ?? true,
        createdAt: data.createdAt?.toDate() ?? new Date(),
        displayName: data.displayName,
      };
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    throw error;
  }
}

export async function getImrepList(): Promise<User[]> {
  try {
    const q = query(collection(db, "users"), where("role", "==", "imrep"), where("isActive", "==", true));
    const usersSnapshot = await getDocs(q);
    return usersSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email,
        role: data.role as UserRole,
        isActive: true,
        createdAt: data.createdAt?.toDate() ?? new Date(),
        displayName: data.displayName,
      };
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de la liste IMREP:", error);
    throw error;
  }
}

