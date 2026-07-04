import HeroSection from "@/components/home/HeroSection";
import CosmosProfesional from "@/components/home/CosmosProfesional";
import ValuePropositionSection from "@/components/home/ValuePropositionSection";
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
      <CosmosProfesional />
      <ValuePropositionSection />
      <SiteFooter />
    </div>
  );
}
