import { BienvenidaDashboard } from '@/components/comp-bienvenida/bienvenida';
import { getMe } from '@/lib/api/profile';
import { getHeroJourney } from '@/lib/api/viaje';
import { getDashboardData } from '@/lib/api/dashboard';
import { getNotificaciones } from '@/lib/api/notificaciones';
import { MOCK_HERO_JOURNEY, type HeroJourneyData } from '@/lib/hero-journey/mock';
import { MOCK_DASHBOARD, type JuniorDashboardData } from '@/lib/api/dashboard';
import type { ApiNotificacion } from '@/lib/api/types';

export default async function Page() {
  const [meResult, journeyResult, dashboardResult, notifResult] = await Promise.all([
    getMe(),
    getHeroJourney(),
    getDashboardData(),
    getNotificaciones(),
  ]);

  const role = meResult.ok && meResult.data.profile ? meResult.data.profile.role.nombre : null;
  const isJunior = role === 'student';

  const heroJourney: HeroJourneyData = journeyResult.ok ? journeyResult.data : MOCK_HERO_JOURNEY;
  const dashboardData: JuniorDashboardData = dashboardResult.ok ? dashboardResult.data : MOCK_DASHBOARD;
  const notificaciones: ApiNotificacion[] = notifResult.ok ? notifResult.data : [];

  return (
    <BienvenidaDashboard
      isJunior={isJunior}
      heroJourney={heroJourney}
      dashboardData={dashboardData}
      notificaciones={notificaciones}
    />
  );
}
