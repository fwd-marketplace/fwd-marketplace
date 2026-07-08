/**
 * Mock data for the Hero Journey.
 * Replace this with a real API call to GET /api/junior/hero-journey when the backend is ready.
 * Shape mirrors the expected API response so the swap is a one-liner.
 */

export type HeroMilestoneStatus = 'done' | 'progress' | 'pending';

export interface HeroMilestone {
  status: HeroMilestoneStatus;
  date: string;
  /** Only used by 'transformacion': 0-100 learning journey percentage. */
  learningPct: number | null;
}

export interface HeroJourneyData {
  llamado:        HeroMilestone;
  preparacion:    HeroMilestone;
  desafio:        HeroMilestone;
  transformacion: HeroMilestone;
  reconocimiento: HeroMilestone;
}

export const MOCK_HERO_JOURNEY: HeroJourneyData = {
  llamado:        { status: 'done',    date: '12 mar 2026', learningPct: null },
  preparacion:    { status: 'done',    date: '2 abr 2026',  learningPct: null },
  desafio:        { status: 'pending', date: '',             learningPct: null },
  transformacion: { status: 'pending', date: '',             learningPct: 40   },
  reconocimiento: { status: 'pending', date: '',             learningPct: null },
};
