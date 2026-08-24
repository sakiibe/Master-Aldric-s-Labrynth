import type { BuiltDoor, DoorId } from '../../game/types';

interface DoorProps {
  door: BuiltDoor;
  /** True when a spent hint should make this door glow. */
  glowing: boolean;
  onSelect: (doorId: DoorId) => void;
}

/** Placeholder art: a plain labelled rectangle. Stage 3 swaps this for SVG. */
export function Door({ door, glowing, onSelect }: DoorProps) {
  return (
    <button
      type="button"
      className={`door${glowing ? ' door--glowing' : ''}`}
      onClick={() => onSelect(door.id)}
    >
      {door.label}
    </button>
  );
}
