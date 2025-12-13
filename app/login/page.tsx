"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import BackgroundImage from "@/components/BackgroundImage";
import { Button, Input, Card, SectionTitle } from "@/components/ui";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // TODO: Implémenter la logique de connexion Firebase
    console.log("Connexion:", { email, password });
    
    // Simuler un délai
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
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

              <div className="text-center text-sm text-[#475569]">
                <Link
                  href="/"
                  className="text-[#2563eb] hover:text-[#1d4ed8] underline"
                >
                  Retour à l'accueil
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </BackgroundImage>
  );
}

