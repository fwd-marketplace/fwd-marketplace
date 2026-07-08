"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/layout/site-footer";

/**
 * Footer del área autenticada. Se oculta en `/gestion`, que es un hub tipo app a altura
 * completa (rail + paneles + chat): el footer de marketing no aplica ahí y llegaba a tapar
 * el chat. En el resto de las pantallas del grupo (bienvenida, marketplace, perfil) sí se muestra.
 */
export function AppFooter() {
  const pathname = usePathname();
  if (pathname.includes("/gestion")) return null;
  return <SiteFooter />;
}
