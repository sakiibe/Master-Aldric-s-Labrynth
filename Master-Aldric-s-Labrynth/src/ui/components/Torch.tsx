/**
 * A live flame over one of the painted wall torches in the junction art.
 *
 * Three layers over a zero-size anchor: a halo, a flickering core, and a
 * field of rising embers. Everything is sized in UNSCALED STAGE PIXELS and
 * rendered inside the scaled stage box, so the flame shrinks with the art
 * instead of blooming out of proportion on a small screen. Only the ember
 * count is reduced on small screens, to save fill rate.
 *
 * All positioning here is static; the animations only wobble and scale.
 * That is deliberate — `prefers-reduced-motion` switches the animations off
 * entirely, and anything that relied on a keyframe to centre itself would
 * jump out of place the moment it did.
 */

interface Ember {
	x: number;
	size: number;
	dur: number;
	delay: number;
	dx1: number;
	dx2: number;
	rise: number;
	/** Warm embers read as fire, violet ones as the arcane light in the art.
	 * Mixing both is what keeps the flame reading as *this* room's magic. */
	warm: boolean;
}

/**
 * Ember parameters are generated once per (seed, count) and cached forever.
 *
 * This matters more than it looks: the field is re-rendered on every hover,
 * and regenerating the params would visibly reshuffle every particle each
 * time the pointer crosses a door. A plain LCG keyed on the torch seed keeps
 * each torch's field fixed and the two torches different from each other.
 */
const emberCache = new Map<string, Ember[]>();

function embers(seed: number, count: number): Ember[] {
	const key = `${seed}:${count}`;
	const hit = emberCache.get(key);
	if (hit) return hit;

	let s = seed * 9301 + 49297;
	const rnd = () => {
		s = (s * 9301 + 49297) % 233280;
		return s / 233280;
	};

	const list: Ember[] = [];
	for (let i = 0; i < count; i++) {
		list.push({
			x: -9 + rnd() * 18,
			size: 1.6 + rnd() * 2.2,
			dur: 2.4 + rnd() * 2.4,
			// Negative, so the field is already mid-flight on the first paint
			// rather than every ember launching from the wick together.
			delay: -rnd() * 5,
			dx1: (-1 + rnd() * 2) * 9,
			dx2: (-1 + rnd() * 2) * 20,
			rise: 46 + rnd() * 42,
			warm: rnd() > 0.55,
		});
	}

	emberCache.set(key, list);
	return list;
}

interface TorchProps {
	/** Fixes this torch's ember field and de-syncs it from the other one. */
	seed: number;
	count: number;
	/** Multiplies the halo's opacity. 1 is the tuned default. */
	glow: number;
}

export function Torch({ seed, count, glow }: TorchProps) {
	return (
		<div className="jn-torch">
			<div
				className="jn-torch__bloom"
				style={
					{
						'--bloom-a': 0.5 * glow,
						'--bloom-b': 0.26 * glow,
						animationDelay: `${seed * -0.7}s`,
					} as React.CSSProperties
				}
			/>
			<div
				className="jn-torch__core"
				style={{ animationDelay: `${seed * -0.13}s` }}
			/>
			{embers(seed, count).map((e, i) => (
				<span
					key={i}
					className={`jn-ember${e.warm ? ' jn-ember--warm' : ''}`}
					style={
						{
							left: e.x,
							width: e.size,
							height: e.size,
							'--dx1': `${e.dx1}px`,
							'--dx2': `${e.dx2}px`,
							'--rise': `${e.rise}px`,
							animationDuration: `${e.dur}s`,
							animationDelay: `${e.delay}s`,
						} as React.CSSProperties
					}
				/>
			))}
		</div>
	);
}
