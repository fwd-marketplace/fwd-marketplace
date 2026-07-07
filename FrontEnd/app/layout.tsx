import type { Metadata } from "next";
import { Archivo_Narrow, Figtree } from "next/font/google";
import { getLocale } from "next-intl/server";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme/theme-provider";
import { DarkModeStarfield } from "@/components/layout/dark-mode-starfield";

// Aplica la clase `dark` antes del primer paint para que no haya parpadeo claro->oscuro.
const THEME_INIT_SCRIPT = `try{if(localStorage.getItem('fwd-theme')==='dark'){document.documentElement.classList.add('dark')}}catch(e){}`;

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

const archivoNarrow = Archivo_Narrow({
  subsets: ["latin"],
  variable: "--font-archivo-narrow",
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FWD Marketplace",
  description:
    "Marketplace de proyectos freelance para juniors egresados de Fundación Forward Costa Rica.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // `getLocale()` lee el locale negociado por el middleware (funciona por encima
  // del segmento [locale]), para que <html lang> refleje el idioma real.
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`${figtree.variable} ${archivoNarrow.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full">
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <ThemeProvider>
          <DarkModeStarfield />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
