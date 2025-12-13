import Image from "next/image";
import Link from "next/link";
import BackgroundImage from "@/components/BackgroundImage";
import { Button } from "@/components/ui";

export default function Home() {
  return (
    <BackgroundImage src="/if.jpeg" alt="Fond d'écran">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-2xl text-center space-y-8">
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

          <h1 className="text-[32px] md:text-[40px] font-bold text-white drop-shadow-lg">
            Allianz Marseille — IMREP
          </h1>

          <p className="text-base text-white/90 drop-shadow-md max-w-xl mx-auto leading-relaxed">
            Plateforme de gestion PNO pour l'agence Allianz Marseille. 
            Accédez à vos dossiers, suivez vos contrats et gérez vos sinistres 
            en toute simplicité.
          </p>

          <div className="pt-[16px]">
            <Link href="/login">
              <Button variant="primary" className="text-lg px-8 py-3">
                Se connecter
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </BackgroundImage>
  );
}
