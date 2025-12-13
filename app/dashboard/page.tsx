"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const router = useRouter();

  useEffect(() => {
    if (authLoading || roleLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (role === "imrep") {
      router.push("/dashboard/imrep");
    } else if (role === "allianz") {
      router.push("/dashboard/allianz");
    } else {
      router.push("/login");
    }
  }, [user, role, authLoading, roleLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-base text-[#475569]">Redirection...</p>
    </div>
  );
}

