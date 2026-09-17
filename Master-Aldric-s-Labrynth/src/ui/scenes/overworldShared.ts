import { mulberry32 } from '../../game/rng';

/** A single backdrop star: SVG position, radius, and its twinkle timing. */
export interface Star {
	x: number;
	y: number;
	r: number;
	twinkle: boolean;
	dur: number;
	delay: number;
	opacity: number;
}

/**
 * Deterministic star field shared by both overworld backdrops. Seeded so each
 * scene gets a stable but distinct pattern; `stageW` sets the horizontal
 * spread and `count` the density. Vertical spread is fixed to the top 300
 * units — the sky band both scenes share. The order of the six `r()` draws per
 * star is load-bearing: it fixes the sequence, so a given seed always yields
 * the same field.
 */
export function generateStars(
	seed: number,
	stageW: number,
	count: number,
): Star[] {
	const r = mulberry32(seed);
	const out: Star[] = [];
	for (let i = 0; i < count; i++) {
		const y = Math.pow(r(), 1.7) * 300;
		const size = r();
		const twinkle = r() < 0.3;
		out.push({
			x: +(r() * stageW).toFixed(1),
			y: +y.toFixed(1),
			r: +(0.6 + size * 1.9).toFixed(2),
			twinkle,
			dur: +(2.4 + r() * 4).toFixed(1),
			delay: +(r() * 5).toFixed(1),
			opacity: twinkle ? 0.9 : +(0.18 + size * 0.5).toFixed(2),
		});
	}
	return out;
}
