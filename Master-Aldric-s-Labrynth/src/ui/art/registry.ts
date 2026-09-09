/**
 * Maps theme asset keys (theme.deadEndScenes[].art, theme.assets.*) to art.
 *
 * Two kinds of art live behind these keys:
 *
 * - **Painted scenes** (`deadEndPaintings`) — full-bleed illustrations in
 *   `public/art/deadend/`. These are whole rooms, not cut-out characters, so
 *   a scene that has one renders the painting *instead of* RoomBackdrop +
 *   character layer, not on top of them.
 * - **Inline SVG** — everything else (the junction backdrop, the placeholder).
 *
 * Anything with no entry in either table falls back to a placeholder rather
 * than crashing, so theme content can name a scene before its art exists.
 */
import { createElement, type ComponentType, type ReactElement } from 'react';
import { ArtFallback } from './ArtFallback';
import { JunctionBackdrop } from './JunctionBackdrop';

export interface Painting {
	src: string;
	/** Describes the room, not the joke — the joke is in the spoken line. */
	alt: string;
	/**
	 * `object-position` for the full-screen crop. The paintings are all wider
	 * than tall, so a portrait window crops the sides and a short landscape
	 * one crops top and bottom — and Aldric sits somewhere different in each.
	 * This points at his face so he survives either cut.
	 */
	focus: string;
	/**
	 * Set when the painting must be shown whole rather than cropped, because
	 * something at its edges carries meaning. A blurred copy of the same
	 * image fills the letterbox, so it still reads as one full-bleed stage.
	 */
	fit?: 'contain';
}

const deadEndPaintings: Record<string, Painting> = {
	'aldric-bath': {
		src: '/art/deadend/aldric-bath.jpg',
		alt: 'Master Aldric glowering from a copper bathtub full of suds, shower cap on, rubber duck afloat.',
		focus: '64% 34%',
	},
	'aldric-makeup': {
		src: '/art/deadend/aldric-makeup.jpg',
		alt: 'Master Aldric at a vanity of glitter pots and brushes, mid brush-stroke, before a jewelled mirror.',
		focus: '38% 32%',
	},
	'aldric-figurines': {
		src: '/art/deadend/aldric-figurines.jpg',
		alt: 'Master Aldric hunched over a tiny tea party of dolls in his laboratory, holding a doll-sized cup.',
		focus: '46% 30%',
	},
	'aldric-cauldron': {
		src: '/art/deadend/aldric-cauldron.jpg',
		alt: 'Master Aldric behind a bubbling green cauldron in a shelf-lined alchemy lab.',
		focus: '52% 42%',
	},
};

/** The painting for a dead-end scene, or undefined if it has no art yet. */
export function getDeadEndPainting(key: string): Painting | undefined {
	return deadEndPaintings[key];
}

/**
 * Warms the browser cache for every dead-end painting. Called when a
 * workflow opens: a dead end can land on any of them, and they are the
 * one place in the game where art appears without warning, so decoding
 * them on first sight would flash an empty frame under the dialogue.
 */
export function preloadDeadEndPaintings(): void {
	for (const { src } of Object.values(deadEndPaintings)) {
		const img = new Image();
		img.decoding = 'async';
		img.src = src;
	}
}

/**
 * Story Mode's paintings — Aldric across his workbench, one per mood, plus
 * the single daylit town scene reserved for the ending. All the tower shots
 * share a framing, so cutting between them beat to beat reads as the same
 * man changing his face rather than a change of scene.
 */
const storyPaintings: Record<string, Painting> = {
	'aldric-summons': {
		src: '/art/story/aldric-summons.jpg',
		alt: 'Master Aldric leaning over an open herbal in his vaulted laboratory, both hands on the workbench, fixing the viewer with a cold stare.',
		focus: '50% 26%',
	},
	'aldric-flask': {
		src: '/art/story/aldric-flask.jpg',
		alt: 'Master Aldric holding up a flask of amber liquid while pointing down at a page of the open herbal.',
		focus: '50% 26%',
	},
	'aldric-terms': {
		src: '/art/story/aldric-terms.jpg',
		alt: 'Master Aldric standing square behind his workbench, hands spread over the open books, waiting for an answer.',
		focus: '50% 26%',
	},
	'aldric-furious': {
		src: '/art/story/aldric-furious.jpg',
		alt: 'Master Aldric snarling over the workbench, flask raised, teeth bared.',
		focus: '50% 26%',
	},
	'aldric-cackle': {
		src: '/art/story/aldric-cackle.jpg',
		alt: 'Master Aldric thrown back in delighted laughter over the open herbal.',
		focus: '50% 26%',
	},
	// 2.55:1, and both the banner over the stall and the villager's "thank
	// you NSHealth Pharmacist" sign at the right edge are the point of the
	// scene — so this one is never cropped.
	'aldric-town': {
		src: '/art/story/aldric-town.jpg',
		alt: 'Master Aldric at a sunlit market stall under a banner reading Town Healthcare, handing out remedies among smiling villagers, rainbows over the rooftops.',
		focus: '50% 42%',
		fit: 'contain',
	},
};

export function getStoryPainting(key: string): Painting | undefined {
	return storyPaintings[key];
}

/**
 * Warms the cache for a story scene's paintings. Story beats advance on a
 * click with no loading state, so an undecoded painting would show as a
 * blank stage for the length of a fetch.
 */
export function preloadStoryPaintings(keys: readonly string[]): void {
	for (const key of keys) {
		const painting = storyPaintings[key];
		if (!painting) continue;
		const img = new Image();
		img.decoding = 'async';
		img.src = painting.src;
	}
}

const deadEndArt: Record<string, ComponentType> = {};

/** Returns a ready-to-render element, not a component type, so scenes never
 * create a component during render (react-hooks/static-components). */
export function getDeadEndArt(key: string): ReactElement {
	return createElement(deadEndArt[key] ?? ArtFallback);
}

const junctionArt: Record<string, ComponentType> = {
	'junction-default': JunctionBackdrop,
};

export function getJunctionArt(key: string): ReactElement {
	return createElement(junctionArt[key] ?? ArtFallback);
}
