/**
 * Maps theme asset keys (theme.deadEndScenes[].art, theme.assets.*) to their
 * SVG components. Anything not yet drawn falls back to a placeholder rather
 * than crashing — most of theme.deadEndScenes has no art yet.
 */
import type { ComponentType } from 'react';
import { AldricBath } from './deadend/AldricBath';
import { AldricMakeup } from './deadend/AldricMakeup';
import { AldricFigurines } from './deadend/AldricFigurines';
import { AldricCauldron } from './deadend/AldricCauldron';
import { ArtFallback } from './ArtFallback';
import { JunctionBackdrop } from './JunctionBackdrop';

const deadEndArt: Record<string, ComponentType> = {
  'aldric-bath': AldricBath,
  'aldric-makeup': AldricMakeup,
  'aldric-figurines': AldricFigurines,
  'aldric-cauldron': AldricCauldron,
};

export function getDeadEndArt(key: string): ComponentType {
  return deadEndArt[key] ?? ArtFallback;
}

const junctionArt: Record<string, ComponentType> = {
  'junction-default': JunctionBackdrop,
};

export function getJunctionArt(key: string): ComponentType {
  return junctionArt[key] ?? ArtFallback;
}
