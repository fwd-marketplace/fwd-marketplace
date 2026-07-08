import HeroSection from "@/components/home/HeroSection";
import CosmosProfesional from "@/components/home/CosmosProfesional";
import MarketplacePreviewSection from "@/components/home/MarketplacePreviewSection";
import DiferenciadoresSection from "@/components/home/DiferenciadoresSection";
import FaqSection from "@/components/home/FaqSection";
import { SiteFooter } from "@/components/layout/site-footer";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="min-h-screen bg-canvas">
      <HeroSection locale={locale} />
      <MarketplacePreviewSection />
      <CosmosProfesional />
      <DiferenciadoresSection />
      <FaqSection />
      <SiteFooter />
    </div>
  );
}
