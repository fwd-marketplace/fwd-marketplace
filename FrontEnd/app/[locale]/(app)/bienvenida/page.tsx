import { BienvenidaDashboard, type BienvenidaData } from '@/components/comp-bienvenida/bienvenida';
import { getMe } from '@/lib/api/profile';
import { getHeroJourney } from '@/lib/api/viaje';
import {
  getMyOffers,
  getProjects,
  getRecommendedProjects,
  getMisInvitaciones,
} from '@/lib/api/marketplace';
import { getNotificaciones } from '@/lib/api/notificaciones';
import { MOCK_HERO_JOURNEY, type HeroJourneyData } from '@/lib/hero-journey/mock';

const EMPTY_DATA: BienvenidaData = {
  stats: { proyectosDisponibles: 0, empresasActivas: 0, matchTop: 0, misPostulaciones: 0 },
  recomendados: [],
  actividad: [],
  invitaciones: [],
};

export default async function Page() {
  const [meResult, journeyResult] = await Promise.all([getMe(), getHeroJourney()]);
  const role = meResult.ok && meResult.data.profile ? meResult.data.profile.role.nombre : null;
  const isJunior = role === 'student';
  const heroJourney: HeroJourneyData = journeyResult.ok ? journeyResult.data : MOCK_HERO_JOURNEY;

  let data: BienvenidaData = EMPTY_DATA;
  if (isJunior) {
    const [offers, projects, recomendados, actividad, invitaciones] = await Promise.all([
      getMyOffers(),
      getProjects(),
      getRecommendedProjects(),
      getNotificaciones(),
      getMisInvitaciones(),
    ]);

    const proyectos = projects.ok ? projects.data.projects : [];
    const empresasActivas = new Set(
      proyectos.map((p) => p.empresa?.id ?? p.empresa?.nombre_comercial).filter(Boolean),
    ).size;
    const recomendadosData = recomendados.ok ? recomendados.data : [];
    const matchTop = recomendadosData.reduce((max, p) => Math.max(max, p.score), 0);

    // Postulaciones ACTIVAS = proyectos distintos con una oferta no rechazada. Cuenta por proyecto
    // (no por fila de oferta) para no inflar con versiones múltiples, y excluye 'no_seleccionada'.
    const misPostulaciones = offers.ok
      ? new Set(
          offers.data.ofertas
            .filter((o) => o.estado.nombre !== 'no_seleccionada')
            .map((o) => o.proyecto?.id)
            .filter(Boolean),
        ).size
      : 0;

    data = {
      stats: {
        proyectosDisponibles: proyectos.length,
        empresasActivas,
        matchTop,
        misPostulaciones,
      },
      recomendados: recomendadosData,
      actividad: actividad.ok ? actividad.data : [],
      invitaciones: invitaciones.ok ? invitaciones.data : [],
    };
  }

  return <BienvenidaDashboard isJunior={isJunior} heroJourney={heroJourney} data={data} />;
}
