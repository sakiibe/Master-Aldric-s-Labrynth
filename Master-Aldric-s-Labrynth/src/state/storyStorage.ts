/**
 * Remembers which Story Mode scenes the player has already been shown, so a
 * briefing plays once rather than in front of all twelve of its district's
 * workflows.
 *
 * Deliberately its own localStorage key rather than a field on
 * PersistedProgress: adding one there would mean bumping CURRENT_VERSION,
 * and storage.ts treats an unrecognised version as a blank slate — every
 * existing player would lose their completed workflows to a cosmetic change.
 *
 * Load is tolerant of missing or corrupt data: the worst case is replaying a
 * scene, so anything unreadable falls back to "seen nothing".
 */

import type { JobAidId } from '../game/types';

const STORAGE_KEY = 'pharmacy-cutover-maze/story';

export interface StoryProgress {
	/** Districts whose "teach me this" briefing has played. */
	briefed: JobAidId[];
	/** Whether the ending has played. */
	finaleSeen: boolean;
}

function empty(): StoryProgress {
	return { briefed: [], finaleSeen: false };
}

export function loadStoryProgress(): StoryProgress {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return empty();
		const parsed: unknown = JSON.parse(raw);
		if (typeof parsed !== 'object' || parsed === null) return empty();
		const v = parsed as Record<string, unknown>;
		return {
			briefed: Array.isArray(v.briefed) ? (v.briefed as JobAidId[]) : [],
			finaleSeen: v.finaleSeen === true,
		};
	} catch {
		return empty();
	}
}

function save(progress: StoryProgress): void {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
	} catch {
		// localStorage unavailable — scenes will simply replay next session.
	}
}

export function hasBriefed(jobAid: JobAidId): boolean {
	return loadStoryProgress().briefed.includes(jobAid);
}

export function markBriefed(jobAid: JobAidId): void {
	const progress = loadStoryProgress();
	if (progress.briefed.includes(jobAid)) return;
	progress.briefed.push(jobAid);
	save(progress);
}

export function hasSeenFinale(): boolean {
	return loadStoryProgress().finaleSeen;
}

export function markFinaleSeen(): void {
	save({ ...loadStoryProgress(), finaleSeen: true });
}
