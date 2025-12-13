"use client";

import Image from "next/image";

interface BackgroundImageProps {
  src: string;
  alt?: string;
  children: React.ReactNode;
}

export default function BackgroundImage({ src, alt = "Background", children }: BackgroundImageProps) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover blur-sm"
          priority
          quality={90}
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>
      <div className="relative z-10 min-h-screen">
        {children}
      </div>
    </div>
  );
}

