/**
 * The single swap point for the Firebase seam.
 *
 * With config present the board is live against Firestore; without it the
 * in-memory stub keeps the popup renderable for anyone running `npm run dev`
 * on a fresh clone. That fallback is the same "an absent config is a
 * supported state" rule the rest of the Firebase layer follows — see
 * analytics/firebase.ts.
 *
 * Auth is not part of this seam — it talks to Firebase directly through
 * auth/AuthContext.tsx, which owns the uid and display name the board is
 * keyed and labelled by.
 */

import { isConfigured } from '../analytics/firebase';
import { createFirebaseLeaderboardService } from './firebase';
import { createStubLeaderboardService } from './stub';
import type { LeaderboardService } from './types';

/**
 * Whether the board above is the real one. The panel says so out loud, so a
 * placeholder row is never mistaken for a real player's score.
 */
export const isLeaderboardLive: boolean = isConfigured;

export const leaderboardService: LeaderboardService = isConfigured
	? createFirebaseLeaderboardService()
	: createStubLeaderboardService();
