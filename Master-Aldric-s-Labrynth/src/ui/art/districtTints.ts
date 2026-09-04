import type { JobAidId } from '../../game/types';

/**
 * Lightened grades of the four district colours, for small type on dark
 * ground — the district colour itself is too dim at 11–13px. Used by the
 * trail map's "next" plaque kickers and by the ladder's rung ordinals and
 * sigil chips.
 *
 * Scene-only, per the design handoff: deliberately not promoted into
 * `theme.ts` alongside the district colours they derive from.
 */
export const DISTRICT_TINT: Record<JobAidId, string> = {
	bpmh: '#7fb3d0',
	verification: '#b39ada',
	cpoe: '#79c4b5',
	oncology: '#d6ac74',
};
