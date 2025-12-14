"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { logoutUser } from "@/lib/firebase/auth";

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes en millisecondes

/**
 * Hook pour gérer la déconnexion automatique après une période d'inactivité
 * @param isAuthenticated - Indique si l'utilisateur est authentifié
 * @param enabled - Active ou désactive le hook (par défaut: true)
 */
export function useInactivityLogout(isAuthenticated: boolean, enabled: boolean = true) {
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const resetTimer = useCallback(() => {
    if (!enabled || !isAuthenticated) return;

    // Nettoyer le timer existant
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Mettre à jour la dernière activité
    lastActivityRef.current = Date.now();

    // Créer un nouveau timer
    timeoutRef.current = setTimeout(async () => {
      try {
        await logoutUser();
        router.push("/login");
      } catch (error) {
        console.error("Erreur lors de la déconnexion automatique:", error);
      }
    }, INACTIVITY_TIMEOUT);
  }, [enabled, isAuthenticated, router]);

  useEffect(() => {
    if (!enabled || !isAuthenticated) {
      // Nettoyer le timer si désactivé ou non authentifié
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    // Événements qui indiquent une activité utilisateur
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
      "keydown",
    ];

    // Initialiser le timer
    resetTimer();

    // Ajouter les écouteurs d'événements
    events.forEach((event) => {
      document.addEventListener(event, resetTimer, true);
    });

    // Nettoyage
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer, true);
      });
    };
  }, [isAuthenticated, enabled, resetTimer]);
}
