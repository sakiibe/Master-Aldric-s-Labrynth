/**
 * The ambient lab room — shelves, a candle, a wash of light — shared behind
 * every scene (Junction and every DeadEnd variant) so the game reads as one
 * place rather than a new room per screen.
 *
 * Structural fills (the room wash, the shelf line, the gold trim) read the
 * theme through CSS custom properties, per the "no color literal outside
 * art/" rule applied to anything that isn't decorative one-off dressing.
 * The bottle colors on the shelf are exactly that kind of dressing, so they
 * stay literal — recoloring them to theme tokens would just make every
 * shelf monochrome.
 */
export function RoomBackdrop() {
  return (
    <svg viewBox="0 0 690 440" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="rb-roomglow" cx="42%" cy="38%" r="70%">
          <stop offset="0%" stopColor="var(--color-surface)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--color-bg)" stopOpacity="1" />
        </radialGradient>
        <radialGradient id="rb-flame" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FAC775" />
          <stop offset="100%" stopColor="#E08A2A" />
        </radialGradient>
      </defs>

      <rect x="0" y="0" width="690" height="440" fill="var(--color-bg)" />
      <rect x="0" y="0" width="690" height="440" fill="url(#rb-roomglow)" />

      <g opacity="0.45" stroke="var(--color-locked)" strokeWidth="1">
        <line x1="36" y1="70" x2="240" y2="70" />
        <line x1="440" y1="70" x2="644" y2="70" />
      </g>
      <g opacity="0.5">
        <rect x="48" y="48" width="12" height="22" rx="2" fill="#4a6a5a" />
        <ellipse cx="82" cy="58" rx="9" ry="11" fill="#6a4a5a" />
        <rect x="104" y="50" width="14" height="20" rx="2" fill="#5a5a7a" />
        <rect x="470" y="50" width="12" height="20" rx="2" fill="#6a5a3a" />
        <ellipse cx="512" cy="59" rx="8" ry="10" fill="#4a5a6a" />
      </g>

      <g transform="translate(600,158)">
        <rect x="-9" y="0" width="18" height="44" rx="3" fill="#d8cfae" />
        <path d="M0 -13 q-7 10 0 15 q7 -5 0 -15z" fill="url(#rb-flame)" />
        <circle cx="0" cy="-2" r="30" fill="var(--color-accent)" opacity="0.13" />
      </g>
    </svg>
  );
}
