/**
 * The single swap point for the Firebase seam. Today this is an in-memory
 * stub; the teammate replaces the right-hand side with a Firebase-backed
 * implementation of the same interface and no consumer changes.
 *
 * Auth is no longer part of this seam — it talks to Firebase directly through
 * auth/AuthContext.tsx, which owns the anonymous-uid session the leaderboard
 * will eventually key off.
 */

import { createStubLeaderboardService } from './stub';
import type { LeaderboardService } from './types';

export const leaderboardService: LeaderboardService =
	createStubLeaderboardService();
