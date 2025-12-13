"use client";

import { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, LayoutDashboard, Users, FileText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { logoutUser } from "@/lib/firebase/auth";
import { Button } from "@/components/ui";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();
  const { role, loading } = useUserRole();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push("/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-base text-[#475569]">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      <header className="bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-white shadow-md">
        <div className="max-w-screen-xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="flex items-center gap-3">
                <Image
                  src="/logo_allianz.svg"
                  alt="Logo Allianz"
                  width={150}
                  height={40}
                  className="object-contain"
                />
              </Link>
              <nav className="hidden md:flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-3 py-2 rounded-[10px] hover:bg-white/10 transition-colors"
                >
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </Link>
                {role === "allianz" && (
                  <Link
                    href="/utilisateurs"
                    className="flex items-center gap-2 px-3 py-2 rounded-[10px] hover:bg-white/10 transition-colors"
                  >
                    <Users size={18} />
                    <span>Utilisateurs</span>
                  </Link>
                )}
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm hidden md:block">{user?.email}</span>
              <Button variant="secondary" onClick={handleLogout} className="text-white border-white/30 hover:bg-white/10">
                <LogOut size={18} className="mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-6 py-[40px]">
        {children}
      </main>
    </div>
  );
}
