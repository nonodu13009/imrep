"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Card, SectionTitle } from "@/components/ui";
import { useToast } from "@/components/ui";
import { registerUser } from "@/lib/firebase/auth";
import { createUser, getUserData } from "@/lib/firebase/users";
import { getAuth } from "firebase/auth";
import { auth } from "@/lib/firebase/config";

export default function DevSetupPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const createTestUsers = async () => {
    // Créer l'utilisateur Allianz
    try {
      setLoading("allianz");
      let allianzUid: string;
      
      try {
        const allianzUser = await registerUser("jeanmichel@allianz-nogaro.fr", "allianz", "Admin Allianz");
        allianzUid = allianzUser.uid;
        showToast("Utilisateur Allianz créé dans Auth", "success");
      } catch (error: any) {
        // Vérifier si l'erreur est "email déjà utilisé"
        if (error?.code === "auth/email-already-in-use" || error?.message?.includes("email-already-in-use")) {
          // Récupérer l'UID de l'utilisateur existant en se connectant
          const { signInWithEmailAndPassword } = await import("firebase/auth");
          try {
            const userCred = await signInWithEmailAndPassword(auth, "jeanmichel@allianz-nogaro.fr", "allianz");
            allianzUid = userCred.user.uid;
            await auth.signOut();
            showToast("Utilisateur Allianz existe déjà dans Auth", "warning");
          } catch (loginError: any) {
            showToast("Impossible de récupérer l'utilisateur Allianz", "error");
            setLoading(null);
            return;
          }
        } else {
          // Autre erreur, on la propage
          throw error;
        }
      }

      // Vérifier si l'utilisateur existe dans Firestore
      try {
        const existingUser = await getUserData(allianzUid);
        if (!existingUser) {
          await createUser({
            email: "jeanmichel@allianz-nogaro.fr",
            role: "allianz",
            uid: allianzUid,
            displayName: "Admin Allianz",
          });
          showToast("Utilisateur Allianz créé dans Firestore", "success");
        } else {
          showToast("Utilisateur Allianz déjà configuré", "info");
        }
      } catch (firestoreError: any) {
        showToast(`Erreur Firestore Allianz: ${firestoreError.message}`, "error");
      }
    } catch (error: any) {
      console.error("Erreur création Allianz:", error);
      showToast(`Erreur création Allianz: ${error?.message || error}`, "error");
    } finally {
      setLoading(null);
    }

    // Créer l'utilisateur IMREP
    try {
      setLoading("imrep");
      let imrepUid: string;
      
      try {
        const imrepUser = await registerUser("imrep@test.fr", "imrep1234", "IMREP Test");
        imrepUid = imrepUser.uid;
        showToast("Utilisateur IMREP créé dans Auth", "success");
      } catch (error: any) {
        // Vérifier si l'erreur est "email déjà utilisé"
        if (error?.code === "auth/email-already-in-use" || error?.message?.includes("email-already-in-use")) {
          // Récupérer l'UID de l'utilisateur existant en se connectant
          const { signInWithEmailAndPassword } = await import("firebase/auth");
          try {
            const userCred = await signInWithEmailAndPassword(auth, "imrep@test.fr", "imrep1234");
            imrepUid = userCred.user.uid;
            await auth.signOut();
            showToast("Utilisateur IMREP existe déjà dans Auth", "warning");
          } catch (loginError: any) {
            showToast("Impossible de récupérer l'utilisateur IMREP", "error");
            setLoading(null);
            return;
          }
        } else {
          // Autre erreur, on la propage
          throw error;
        }
      }

      // Vérifier si l'utilisateur existe dans Firestore
      try {
        const existingUser = await getUserData(imrepUid);
        if (!existingUser) {
          await createUser({
            email: "imrep@test.fr",
            role: "imrep",
            uid: imrepUid,
            displayName: "IMREP Test",
          });
          showToast("Utilisateur IMREP créé dans Firestore", "success");
        } else {
          showToast("Utilisateur IMREP déjà configuré", "info");
        }
      } catch (firestoreError: any) {
        showToast(`Erreur Firestore IMREP: ${firestoreError.message}`, "error");
      }
    } catch (error: any) {
      console.error("Erreur création IMREP:", error);
      showToast(`Erreur création IMREP: ${error?.message || error}`, "error");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <SectionTitle>Configuration DEV</SectionTitle>
        <p className="text-sm text-[#64748b] mb-6">
          Créez les utilisateurs de test pour le développement
        </p>
        <Button
          variant="primary"
          onClick={createTestUsers}
          isLoading={loading !== null}
          className="w-full"
        >
          Créer les utilisateurs de test
        </Button>
        <div className="mt-6 p-4 bg-[#f1f5f9] rounded-[10px] text-sm">
          <p className="font-semibold mb-2">Utilisateurs à créer :</p>
          <ul className="space-y-1 text-[#64748b]">
            <li>• Admin Allianz : jeanmichel@allianz-nogaro.fr / allianz</li>
            <li>• IMREP Test : imrep@test.fr / imrep1234</li>
          </ul>
        </div>

        <div className="mt-4 pt-4 border-t border-[#e5e7eb] space-y-2">
          <a
            href="/dev/mock-lots"
            className="block w-full text-center px-4 py-2 bg-[var(--color-primary)] text-white rounded-[var(--radius-md)] hover:bg-[var(--color-primary-hover)] transition-colors text-sm font-medium"
          >
            Générer 20 lots mockés →
          </a>
          <a
            href="/dev/update-proprietaires"
            className="block w-full text-center px-4 py-2 bg-[var(--color-secondary)] text-white rounded-[var(--radius-md)] hover:opacity-90 transition-colors text-sm font-medium"
          >
            Mettre à jour les noms de propriétaires →
          </a>
        </div>
      </Card>
    </div>
  );
}

