import type { BuiltDoor, DoorId } from '../../game/types';

interface DoorProps {
  door: BuiltDoor;
  /** True when a spent hint should make this door glow. */
  glowing: boolean;
  onSelect: (doorId: DoorId) => void;
  /** Which alchemical sigil crowns the arch — purely decorative, cycles per door. */
  sigil: 0 | 1 | 2;
}

/** Classic alchemical glyphs (Sol, Salt, Sulfur), centered at the origin. */
function AlchemySigil({ variant }: { variant: 0 | 1 | 2 }) {
  if (variant === 0) {
    return (
      <g stroke="var(--color-accent)" strokeWidth="1.5" fill="none">
        <circle r="8" />
        <circle r="2" fill="var(--color-accent)" stroke="none" />
      </g>
    );
  }
  if (variant === 1) {
    return (
      <g stroke="var(--color-accent)" strokeWidth="1.5" fill="none">
        <circle r="8" />
        <line x1="-8" y1="0" x2="8" y2="0" />
      </g>
    );
  }
  return (
    <g stroke="var(--color-accent)" strokeWidth="1.5" fill="none" strokeLinejoin="round">
      <path d="M0 -8 L7 5.5 L-7 5.5 Z" />
      <line x1="0" y1="5.5" x2="0" y2="12" />
      <line x1="-3.5" y1="9" x2="3.5" y2="9" />
    </g>
  );
}

/**
 * A door IS an archway of alchemical stonework, not a rectangle with art
 * behind it — the SVG and the clickable surface are the same element, so
 * there is no separate backdrop to keep in sync with button position. The
 * label renders as real DOM text (a plaque) over the art so it stays crisp
 * and wraps like normal text; everything else is presentational SVG.
 */
export function Door({ door, glowing, onSelect, sigil }: DoorProps) {
  const voidId = `door-void-${door.id}`;

  return (
    <button
      type="button"
      className={`door${glowing ? ' door--glowing' : ''}`}
      onClick={() => onSelect(door.id)}
    >
      <svg className="door-art" viewBox="0 0 140 196" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <defs>
          <radialGradient id={voidId} cx="50%" cy="28%" r="80%">
            <stop offset="0%" stopColor="var(--color-surface)" />
            <stop offset="100%" stopColor="var(--color-bg)" />
          </radialGradient>
        </defs>

        {/* stone archway frame */}
        <path
          className="door-frame"
          d="M4 196 L4 60 A66 56 0 0 1 136 60 L136 196 Z"
          fill="var(--color-surface)"
        />
        {/* the doorway itself, a dark alchemical void */}
        <path d="M16 196 L16 66 A54 46 0 0 1 124 66 L124 196 Z" fill={`url(#${voidId})`} />

        {/* keystone */}
        <circle cx="70" cy="8" r="4" fill="var(--color-locked)" />

        {/* sigil crowning the arch */}
        <g transform="translate(70,26)">
          <AlchemySigil variant={sigil} />
        </g>

        {/* a floor rune glowing faintly in the void */}
        <g transform="translate(70,158)" stroke="var(--color-accent)" strokeWidth="1" fill="none" opacity="0.3">
          <circle r="24" />
          <circle r="14" />
        </g>

        {/* dressing: a hanging herb bundle and a shelved bottle, one per side */}
        <path
          d="M30 74 q4 15 4 15 q0 -15 8 -13 q-4 13 -4 13 q0 -11 -8 -15z"
          fill="#4a5a3a"
          opacity="0.55"
        />
        <rect x="96" y="146" width="10" height="17" rx="2" fill="#6a4a5a" opacity="0.65" />
        <rect x="94" y="140" width="14" height="6" rx="1" fill="var(--color-locked)" opacity="0.5" />
      </svg>

      <span className="door-plaque">{door.label}</span>
    </button>
  );
}
