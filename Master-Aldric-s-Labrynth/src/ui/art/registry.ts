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
