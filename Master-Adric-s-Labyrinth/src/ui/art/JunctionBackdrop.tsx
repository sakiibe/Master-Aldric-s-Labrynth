/**
 * The junction chamber's ambient dressing — stone walls, a worked floor,
 * torchlight, shelved apparatus. Renders behind the (real, interactive) Door
 * components, which now draw their own archways and carry their own labels —
 * this file never touches doors, so there is nothing here that could drift
 * out of alignment with them.
 *
 * Structural fills and dividers read the theme through CSS custom
 * properties; the torches, herbs, glassware, and sigils are literal one-off
 * dressing (see the same rule applied in RoomBackdrop.tsx).
 */
export function JunctionBackdrop() {
  return (
    <svg viewBox="0 0 690 440" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="jb-flame" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FAC775" />
          <stop offset="100%" stopColor="#E08A2A" />
        </radialGradient>
        <radialGradient id="jb-roomglow" cx="50%" cy="10%" r="80%">
          <stop offset="0%" stopColor="var(--color-surface)" stopOpacity="0.7" />
          <stop offset="100%" stopColor="var(--color-bg)" stopOpacity="1" />
        </radialGradient>
      </defs>

      <rect x="0" y="0" width="690" height="440" fill="var(--color-bg)" />
      <rect x="0" y="0" width="690" height="440" fill="url(#jb-roomglow)" />

      {/* worked-stone wall coursing */}
      <g stroke="var(--color-locked)" strokeWidth="1" opacity="0.5">
        <line x1="0" y1="18" x2="690" y2="18" />
        <line x1="0" y1="36" x2="690" y2="36" />
      </g>
      {/* an engraved arc of alchemical script running the lintel */}
      <g stroke="var(--color-accent)" strokeWidth="1" opacity="0.3" fill="none">
        <path d="M40 26 Q345 4 650 26" />
      </g>

      {/* floor, with a worn transmutation circle underfoot */}
      <rect x="0" y="330" width="690" height="110" fill="var(--color-surface)" opacity="0.35" />
      <line x1="0" y1="330" x2="690" y2="330" stroke="var(--color-locked)" strokeWidth="1" opacity="0.6" />
      <g transform="translate(345,332)" stroke="var(--color-accent)" strokeWidth="1" fill="none" opacity="0.18">
        <ellipse rx="180" ry="16" />
        <ellipse rx="110" ry="10" />
      </g>

      {/* torches flanking the space */}
      <g>
        <rect x="46" y="150" width="8" height="36" rx="2" fill="#5a4a2a" />
        <ellipse cx="50" cy="141" rx="9" ry="13" fill="url(#jb-flame)" />
      </g>
      <g>
        <rect x="636" y="150" width="8" height="36" rx="2" fill="#5a4a2a" />
        <ellipse cx="640" cy="141" rx="9" ry="13" fill="url(#jb-flame)" />
      </g>

      {/* apothecary shelf, top-left: mortar and pestle, corked jars, a coiled tube */}
      <rect x="16" y="70" width="120" height="4" fill="var(--color-locked)" />
      <g>
        <ellipse cx="34" cy="66" rx="12" ry="6" fill="#6a5a4a" />
        <rect x="30" y="52" width="4" height="16" rx="2" fill="#8a7a5a" transform="rotate(-20 32 60)" />
        <rect x="56" y="48" width="12" height="22" rx="2" fill="#4a6a5a" />
        <circle cx="62" cy="46" r="4" fill="#3a5a4a" />
        <ellipse cx="90" cy="58" rx="9" ry="12" fill="#6a4a5a" />
        <circle cx="90" cy="45" r="3.5" fill="#5a3a3a" />
        <rect x="112" y="50" width="14" height="20" rx="2" fill="#5a5a7a" />
      </g>

      {/* alchemical sigil, top-right */}
      <g transform="translate(600,58)" stroke="#8a6a3a" strokeWidth="1.5" fill="none">
        <circle cx="0" cy="0" r="20" />
        <circle cx="0" cy="0" r="12" />
        <line x1="-20" y1="0" x2="20" y2="0" />
        <line x1="0" y1="-20" x2="0" y2="20" />
      </g>

      {/* a small still / alembic, bottom-left */}
      <g transform="translate(56,368)">
        <path d="M-14 30 L-14 6 A14 14 0 0 1 14 6 L14 30 Z" fill="#3a5a4a" opacity="0.8" />
        <path d="M0 -8 L0 6" stroke="#3a5a4a" strokeWidth="4" opacity="0.8" />
        <ellipse cx="0" cy="-10" rx="6" ry="5" fill="#5a4a2a" opacity="0.8" />
      </g>

      {/* a stack of corked bottles, bottom-right */}
      <g>
        <rect x="596" y="376" width="60" height="12" rx="2" fill="#6a3a3a" />
        <rect x="600" y="366" width="52" height="12" rx="2" fill="#3a5a4a" />
        <rect x="604" y="356" width="46" height="12" rx="2" fill="#4a4a6a" />
        <rect x="622" y="350" width="6" height="8" fill="#8a7a5a" />
      </g>
    </svg>
  );
}
