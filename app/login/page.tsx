"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import BackgroundImage from "@/components/BackgroundImage";
import { Button, Input, Card, SectionTitle, useToast } from "@/components/ui";
import { loginUser } from "@/lib/firebase/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await loginUser(email, password);
      showToast("Connexion réussie", "success");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Erreur de connexion:", error);
      showToast(error.message || "Erreur de connexion", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BackgroundImage src="/if.jpeg" alt="Fond d'écran">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <Image
              src="/logo_allianz.svg"
              alt="Logo Allianz"
              width={250}
              height={64}
              className="object-contain"
              priority
            />
          </div>

          <Card className="bg-white/95 backdrop-blur-sm">
            <div className="space-y-[24px]">
              <div className="text-center">
                <SectionTitle className="text-[24px] font-semibold text-[#1e293b] mb-[16px]">
                  Connexion
                </SectionTitle>
                <p className="text-sm text-[#475569]">
                  Accédez à votre espace de gestion
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-[16px]">
                <div>
                  <Input
                    type="email"
                    label="Email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      label="Mot de passe"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-9 text-[#64748b] hover:text-[#475569] transition-colors"
                      aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    >
                      {showPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-[8px]">
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isLoading}
                    className="w-full"
                  >
                    Se connecter
                  </Button>
                </div>
              </form>

              <div className="text-center space-y-2">
                <Link
                  href="/"
                  className="text-sm text-[#2563eb] hover:text-[#1d4ed8] underline block"
                >
                  Retour à l'accueil
                </Link>
                <Link
                  href="/dev/setup"
                  className="text-xs text-[#64748b] hover:text-[#475569] underline block"
                >
                  Créer les utilisateurs de test
                </Link>
              </div>

              {/* Boutons de connexion rapide - DEV uniquement */}
              <div className="pt-4 border-t border-[#e5e7eb]">
                <p className="text-xs text-[#64748b] mb-3 text-center">Connexion rapide (DEV)</p>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="secondary"
                    onClick={async () => {
                      setIsLoading(true);
                      try {
                        await loginUser("jeanmichel@allianz-nogaro.fr", "allianz");
                        showToast("Connexion réussie", "success");
                        router.push("/dashboard");
                      } catch (error: any) {
                        console.error("Erreur de connexion:", error);
                        showToast(error.message || "Erreur de connexion", "error");
                        setIsLoading(false);
                      }
                    }}
                    disabled={isLoading}
                    className="w-full text-sm"
                  >
                    🔵 Admin Allianz
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={async () => {
                      setIsLoading(true);
                      try {
                        await loginUser("imrep@test.fr", "imrep1234");
                        showToast("Connexion réussie", "success");
                        router.push("/dashboard");
                      } catch (error: any) {
                        console.error("Erreur de connexion:", error);
                        showToast(error.message || "Erreur de connexion", "error");
                        setIsLoading(false);
                      }
                    }}
                    disabled={isLoading}
                    className="w-full text-sm"
                  >
                    🟢 IMREP Test
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </BackgroundImage>
  );
}

