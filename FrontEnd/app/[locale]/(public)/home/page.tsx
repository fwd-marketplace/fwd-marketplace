import { PublicNav } from "@/components/layout/public-nav";
import HeroSection from "@/components/home/HeroSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import FeaturedProjectsSection from "@/components/home/FeaturedProjectsSection";
import ValuePropositionSection from "@/components/home/ValuePropositionSection";
import StatsSection from "@/components/home/StatsSection";
import CtaSection from "@/components/home/CtaSection";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="min-h-screen bg-canvas">
      <PublicNav />
      <HeroSection locale={locale} />
      <HowItWorksSection />
      <FeaturedProjectsSection locale={locale} />
      <ValuePropositionSection />
      <StatsSection />
      <CtaSection locale={locale} />
    </div>
  );
}
