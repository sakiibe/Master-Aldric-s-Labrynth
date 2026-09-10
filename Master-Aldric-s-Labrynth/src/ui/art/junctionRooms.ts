/**
 * Junction room art — the painted chamber a junction is staged in.
 *
 * The room is now a raster illustration rather than drawn SVG, so the doors
 * are no longer shapes we control: they are pixels somebody painted, and the
 * interactive parts of the scene are invisible hotspots traced over them.
 * That trace is the whole contract between the art and the code, so it lives
 * here rather than scattered through the scene component.
 *
 * EVERY number below is a percentage of ONE specific image at its native size.
 * If the art is regenerated, recropped, or swapped for a different chamber,
 * re-derive all of them — the arch rects, the torch anchors, and `band`. Run
 * the scene with `?hotspots` in the URL (dev builds) to see the trace drawn
 * over the art while you do it.
 */

export interface ArchRect {
	/** All four are percentages of the native image, matching CSS box order. */
	left: number;
	top: number;
	width: number;
	height: number;
}

export interface TorchAnchor {
	/** Percentages of the native image, at the painted flame's base. */
	x: number;
	y: number;
	/** Seeds the ember field and the animation offsets, so the two torches
	 * never flicker in lockstep. Any two distinct numbers work. */
	seed: number;
}

export interface JunctionRoom {
	src: string;
	/** Native pixel size. The stage box is built at exactly this size and then
	 * scaled as one unit, which is what keeps the hotspots on the doors. */
	width: number;
	height: number;
	/**
	 * The region of the art that must stay on screen at every viewport size:
	 * the arches plus a margin. The fit never crops inside this box, so a door
	 * can never be half off the edge — everything outside it (far wall, shelf
	 * dressing, floor) is expendable.
	 */
	band: { x0: number; x1: number; y0: number; y1: number };
	/**
	 * The tighter band used once the scene is small enough that the compact
	 * door list is showing. Drops the ceiling and the last of the floor, which
	 * buys scale for the arches themselves.
	 */
	compactBand: { y0: number; y1: number };
	/** Door slots, left → right. A step with a different door count than this
	 * has no trace to sit on and falls back to the list. */
	arches: ArchRect[];
	/** Spoken position of each arch, used by the compact list so it still
	 * reads as a description of the picture. Parallel to `arches`. */
	archNames: string[];
	torches: TorchAnchor[];
}

const rooms: Record<string, JunctionRoom> = {
	'junction-default': {
		src: '/art/junction/junction-room.jpg',
		width: 1449,
		height: 736,
		band: { x0: 55, x1: 1394, y0: 140, y1: 700 },
		compactBand: { y0: 200, y1: 690 },
		arches: [
			{ left: 15.6, top: 38.4, width: 16.1, height: 51.6 },
			{ left: 43.1, top: 39.6, width: 16.4, height: 50.4 },
			{ left: 69.1, top: 38.4, width: 16.1, height: 51.6 },
		],
		archNames: ['Left door', 'Centre door', 'Right door'],
		torches: [
			{ x: 36.9, y: 34.2, seed: 1 },
			{ x: 63.9, y: 34.6, seed: 4 },
		],
	},
};

/**
 * The room for a theme's `assets.junctionArt` key. Falls back to the default
 * chamber rather than throwing, so a theme can name a room before its art
 * exists — the same forgiving lookup the painting registries use.
 */
export function getJunctionRoom(key: string): JunctionRoom {
	return rooms[key] ?? rooms['junction-default'];
}

/**
 * Warms the browser cache for a room. The art is the entire junction screen,
 * and a junction appears the instant a workflow opens with no loading state
 * in front of it, so decoding it on first sight would show an empty stage
 * under the prompt for the length of a fetch.
 */
export function preloadJunctionRoom(key: string): void {
	const img = new Image();
	img.decoding = 'async';
	img.src = getJunctionRoom(key).src;
}
