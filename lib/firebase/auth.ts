import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "./config";

export async function loginUser(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    throw error;
  }
}

export async function registerUser(email: string, password: string, displayName?: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    if (displayName && userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
    }
    
    return userCredential.user;
  } catch (error: any) {
    // Ne pas logger l'erreur si c'est juste un email déjà utilisé
    if (error?.code !== "auth/email-already-in-use") {
      console.error("Erreur lors de l'inscription:", error);
    }
    throw error;
  }
}

export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Erreur lors de la déconnexion:", error);
    throw error;
  }
}

export async function resetPassword(email: string) {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email de réinitialisation:", error);
    throw error;
  }
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}

