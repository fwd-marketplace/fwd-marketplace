import HeroSection from '@/components/home/HeroSection';
import HowItWorksSection from '@/components/home/HowItWorksSection';
import FeaturedProjectsSection from '@/components/home/FeaturedProjectsSection';
import ValuePropositionSection from '@/components/home/ValuePropositionSection';
import StatsSection from '@/components/home/StatsSection';
import CtaSection from '@/components/home/CtaSection';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-canvas">
      <HeroSection />
      <HowItWorksSection />
      <FeaturedProjectsSection />
      <ValuePropositionSection />
      <StatsSection />
      <CtaSection />
    </div>
  );
}
