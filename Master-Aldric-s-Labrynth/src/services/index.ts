/**
 * The single swap point for the Firebase seam. Today these are the in-memory
 * stubs; the teammate replaces the right-hand sides with Firebase-backed
 * implementations of the same interfaces and no consumer changes.
 */

import { createStubAuthService, createStubLeaderboardService } from './stub';
import type { AuthService, LeaderboardService } from './types';

export const authService: AuthService = createStubAuthService();
export const leaderboardService: LeaderboardService =
	createStubLeaderboardService();
