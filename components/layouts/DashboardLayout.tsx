"use client";

import { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, LayoutDashboard, Users, HelpCircle, FileText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useInactivityLogout } from "@/hooks/useInactivityLogout";
import { logoutUser } from "@/lib/firebase/auth";
import { Button, Breadcrumb } from "@/components/ui";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isAuthenticated } = useAuth();
  const { role, loading } = useUserRole();
  const router = useRouter();
  const pathname = usePathname();

  // Déconnexion automatique après 5 minutes d'inactivité
  useInactivityLogout(isAuthenticated);

  const handleLogout = async () => {
    try {
    await logoutUser();
      router.push("/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  const getBreadcrumbItems = (path: string) => {
    const items: Array<{ label: string; href?: string }> = [];
    const pathParts = path.split("/").filter(Boolean);

    if (pathParts.length === 0) return items;

    // Ignorer "dashboard" comme premier élément
    if (pathParts[0] === "dashboard") {
      pathParts.shift();
    }

    // Construire les breadcrumbs
    let currentPath = "";
    pathParts.forEach((part, index) => {
      currentPath += `/${part}`;
      const label = part
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      if (index === pathParts.length - 1) {
        items.push({ label });
      } else {
        items.push({ label, href: currentPath });
      }
    });

    return items;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-base text-[var(--color-neutral-600)]">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-light)]">
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
                  className="object-contain brightness-0 invert"
              />
              </Link>
              <nav className="hidden md:flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className={`flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] transition-all duration-[var(--transition-base)] relative ${
                    pathname?.startsWith("/dashboard") && !pathname?.startsWith("/dashboard/imrep") && !pathname?.startsWith("/dashboard/allianz")
                      ? "bg-white text-[var(--color-primary)] font-medium shadow-sm after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-white after:rounded-full"
                      : "text-white/90 hover:bg-white/20 hover:text-white hover:scale-105"
                  }`}
                >
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </Link>
                {role === "allianz" && (
                  <Link
                    href="/utilisateurs"
                    className={`flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] transition-all duration-[var(--transition-base)] ${
                      pathname === "/utilisateurs"
                        ? "bg-white text-[var(--color-primary)] font-medium shadow-sm"
                        : "text-white/90 hover:bg-white/20 hover:text-white hover:scale-105"
                    }`}
                  >
                    <Users size={18} />
                    <span>Utilisateurs</span>
                  </Link>
                )}
                {(role === "imrep" || role === "allianz") && (
                  <Link
                    href="/journal"
                    className={`flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] transition-all duration-[var(--transition-base)] ${
                      pathname === "/journal"
                        ? "bg-white text-[var(--color-primary)] font-medium shadow-sm"
                        : "text-white/90 hover:bg-white/20 hover:text-white hover:scale-105"
                    }`}
                  >
                    <FileText size={18} />
                    <span>Journal</span>
                  </Link>
                )}
                <Link
                  href="/aide"
                  className={`flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] transition-all duration-[var(--transition-base)] ${
                    pathname === "/aide"
                      ? "bg-white text-[var(--color-primary)] font-medium shadow-sm"
                      : "text-white/90 hover:bg-white/20 hover:text-white hover:scale-105"
                  }`}
                >
                  <HelpCircle size={18} />
                  <span>Aide</span>
            </Link>
              </nav>
          </div>
          <div className="flex items-center gap-4">
              <span className="text-sm hidden md:block text-white/90">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)] bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors text-sm font-medium"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-6 py-[var(--spacing-lg)] animate-fade-in-up">
        {pathname && pathname !== "/dashboard" && pathname !== "/dashboard/imrep" && pathname !== "/dashboard/allianz" && (
          <Breadcrumb
            items={getBreadcrumbItems(pathname)}
          />
        )}
        {children}
      </main>
    </div>
  );
}
