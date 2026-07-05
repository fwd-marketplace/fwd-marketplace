import { BienvenidaDashboard } from '@/components/comp-bienvenida/bienvenida';
import { getMe } from '@/lib/api/profile';
import { getHeroJourney } from '@/lib/api/viaje';
import { MOCK_HERO_JOURNEY, type HeroJourneyData } from '@/lib/hero-journey/mock';

export default async function Page() {
  const [meResult, journeyResult] = await Promise.all([getMe(), getHeroJourney()]);

  const role = meResult.ok && meResult.data.profile ? meResult.data.profile.role.nombre : null;
  const isJunior = role === 'student';

  const heroJourney: HeroJourneyData = journeyResult.ok ? journeyResult.data : MOCK_HERO_JOURNEY;

  return <BienvenidaDashboard isJunior={isJunior} heroJourney={heroJourney} />;
}
