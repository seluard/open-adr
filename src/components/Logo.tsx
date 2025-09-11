// components/Logo.tsx (simplified)
// Single PNG logo renderer. Drop /public/logo.png (square) and adjust size via prop.

import React from "react";
import Image from "next/image";

interface LogoProps {
  size?: number;      // pixel size (width & height)
  className?: string; // optional extra classes
  alt?: string;       // accessible alt text
  priority?: boolean; // Next/Image priority
}

export default function Logo({ size = 48, className = "", alt = "Open-ADR logo", priority = false }: LogoProps) {
  return (
    <Image
      src="/logo.png"
      alt={alt}
      width={size}
      height={size}
      className={className}
      priority={priority}
    />
  );
}
