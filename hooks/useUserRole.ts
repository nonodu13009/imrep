"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { getUserData, getUserRole } from "@/lib/firebase/users";
import { User, UserRole } from "@/lib/lots/types";

export function useUserRole() {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setRole(null);
      setUserData(null);
      setLoading(false);
      return;
    }

    const fetchUserRole = async () => {
      try {
        const userRole = await getUserRole(user.uid);
        const data = await getUserData(user.uid);
        setRole(userRole);
        setUserData(data);
      } catch (error) {
        console.error("Erreur lors de la récupération du rôle:", error);
        setRole(null);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user, authLoading]);

  return {
    role,
    userData,
    loading: authLoading || loading,
    isImrep: role === "imrep",
    isAllianz: role === "allianz",
  };
}

