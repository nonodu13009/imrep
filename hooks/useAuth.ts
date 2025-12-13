"use client";

import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import { onAuthChange, getCurrentUser } from "@/lib/firebase/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading, isAuthenticated: !!user };
}

export function useCurrentUser() {
  return getCurrentUser();
}

