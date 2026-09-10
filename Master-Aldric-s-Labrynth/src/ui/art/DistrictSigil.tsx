/**
 * The four alchemical/apothecary district sigils.
 *
 * Shared by both Overworld presentations: the trail map draws a sigil at each
 * signpost board's top-centre, the ladder draws one in each district header
 * plate's chip. The ladder handoff calls for exactly these drawn sigils rather
 * than the mock's placeholder glyph characters.
 *
 * Each sigil is a bare `<g>` drawn around (0,0) in a roughly ±13 box, so a
 * caller either places it inside an already-translated `<g>` (the trail map)
 * or wraps it in `<SigilSvg>` (the ladder).
 */

import type { JobAidId } from '../../game/types';

interface SigilProps {
	district: JobAidId;
	color: string;
}

export function DistrictSigil({ district, color }: SigilProps) {
	if (district === 'bpmh') {
		// mortar & pestle
		return (
			<g stroke={color} strokeWidth="1.8" fill="none">
				<path d="M-9,-2 A9,9 0 0 0 9,-2 Z" fill={color} opacity="0.5" />
				<path d="M-11,-2 L11,-2" />
				<path d="M2,-6 L10,-16" />
				<path d="M9,10 L-9,10" />
			</g>
		);
	}
	if (district === 'oncology') {
		// alchemical sun
		return (
			<g stroke={color} strokeWidth="1.8" fill="none">
				<circle cx="0" cy="0" r="8" />
				<circle cx="0" cy="0" r="3" fill={color} />
				<path d="M0,-13 L0,-10" />
				<path d="M0,13 L0,10" />
				<path d="M-13,0 L-10,0" />
				<path d="M13,0 L10,0" />
			</g>
		);
	}
	if (district === 'cpoe') {
		// retort / flask
		return (
			<g stroke={color} strokeWidth="1.8" fill="none">
				<path d="M-4,-12 L4,-12" />
				<path d="M-3,-12 L-3,-5 L-8,6 A9,9 0 0 0 8,6 L3,-5 L3,-12" />
				<path d="M-7,3 L7,3" stroke={color} strokeWidth="5" opacity="0.55" />
			</g>
		);
	}
	// verification: funnel on a stand
	return (
		<g stroke={color} strokeWidth="1.8" fill="none">
			<path
				d="M-8,-11 L8,-11 L1,-1 L1,11 L-1,11 L-1,-1 Z"
				fill={color}
				opacity="0.35"
			/>
			<path d="M-8,-11 L8,-11" />
			<path d="M-9,12 L9,12" />
		</g>
	);
}

/** A sigil as a standalone element, for HTML contexts (the ladder's chip). */
export function SigilSvg({
	district,
	color,
	size,
}: SigilProps & { size: number }) {
	return (
		<svg
			viewBox="-15 -15 30 30"
			width={size}
			height={size}
			style={{ display: 'block' }}
			aria-hidden="true"
		>
			<DistrictSigil district={district} color={color} />
		</svg>
	);
}
