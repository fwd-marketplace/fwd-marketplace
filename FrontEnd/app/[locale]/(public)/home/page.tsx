import HeroSection from "@/components/home/HeroSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import FeaturedProjectsSection from "@/components/home/FeaturedProjectsSection";
import ValuePropositionSection from "@/components/home/ValuePropositionSection";
import StatsSection from "@/components/home/StatsSection";
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
      <HowItWorksSection />
      <FeaturedProjectsSection locale={locale} />
      <ValuePropositionSection />
      <StatsSection />
      <SiteFooter />
    </div>
  );
}
