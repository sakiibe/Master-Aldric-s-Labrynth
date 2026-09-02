/**
 * Deterministic hash + shuffle. No `Math.random()` anywhere in this file —
 * door order must be stable across sessions and backtracks, so it is derived
 * entirely from a seed string (e.g. `${workflowId}/${stepId}`).
 */

/** FNV-1a string hash. Same input always yields the same 32-bit output. */
export function hash(seed: string): number {
	let h = 0x811c9dc5;
	for (let i = 0; i < seed.length; i++) {
		h ^= seed.charCodeAt(i);
		h = Math.imul(h, 0x01000193);
	}
	return h >>> 0;
}

/** mulberry32 — small deterministic PRNG seeded by a 32-bit integer. */
function mulberry32(seed: number): () => number {
	let state = seed;
	return () => {
		state = (state + 0x6d2b79f5) | 0;
		let t = Math.imul(state ^ (state >>> 15), 1 | state);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/** Deterministic Fisher-Yates shuffle. Same items + seed -> same order, always. */
export function shuffle<T>(items: T[], seed: number): T[] {
	const result = [...items];
	const next = mulberry32(seed);
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(next() * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}
	return result;
}
