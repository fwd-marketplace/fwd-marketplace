"use client";

import { usePathname } from "next/navigation";

/**
 * Muestra el footer del área autenticada, EXCEPTO en `/gestion`, que es un hub tipo app a
 * altura completa (rail + paneles + chat): ahí el footer de marketing no aplica y llegaba a
 * tapar el chat. El `SiteFooter` (server component async) se renderiza en el layout y se pasa
 * como `children`; este wrapper cliente solo decide si mostrarlo según la ruta (un client
 * component no puede renderizar un server component async directamente, pero sí recibirlo por props).
 */
export function AppFooter({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.includes("/gestion")) return null;
  return <>{children}</>;
}
