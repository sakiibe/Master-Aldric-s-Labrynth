/**
 * The junction chamber — stone room, three archways, torches and moss and
 * shelf clutter for atmosphere. Renders behind the (real, interactive) Door
 * cards, which carry their own labels — nothing here is baked-in text, so
 * this component never leaks which door is which.
 *
 * The archway panels and structural lines read the theme through CSS custom
 * properties; the torches, moss, shelf bottles, and the sigil are literal
 * one-off dressing (see the same rule applied in RoomBackdrop.tsx).
 */
export function JunctionBackdrop() {
  return (
    <svg viewBox="0 0 690 440" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="jb-flame" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FAC775" />
          <stop offset="100%" stopColor="#E08A2A" />
        </radialGradient>
      </defs>

      <rect x="0" y="0" width="690" height="440" fill="var(--color-bg)" />

      {/* room dividers */}
      <g stroke="var(--color-locked)" strokeWidth="1" opacity="0.6">
        <line x1="0" y1="120" x2="690" y2="120" />
        <line x1="0" y1="180" x2="690" y2="180" />
      </g>
      {/* the trail sits on this band in the real layout, but that's a
          separate scrollable component now — just suggest the floor here */}
      <rect x="0" y="330" width="690" height="110" fill="var(--color-surface)" opacity="0.35" />
      <line x1="0" y1="360" x2="690" y2="360" stroke="var(--color-locked)" strokeWidth="1" opacity="0.6" />

      {/* ===== THREE ARCHWAYS ===== */}
      {[60, 270, 480].map((x) => (
        <g key={x}>
          <rect x={x} y="150" width="140" height="182" rx="4" fill="var(--color-surface)" />
          <path
            d={`M${x} 200 A70 50 0 0 1 ${x + 140} 200 L${x + 140} 150 L${x} 150 Z`}
            fill="var(--color-surface)"
          />
          <rect x={x + 12} y="176" width="116" height="156" rx="3" fill="var(--color-bg)" />
          <path
            d={`M${x + 12} 216 A58 40 0 0 1 ${x + 128} 216 L${x + 128} 176 L${x + 12} 176 Z`}
            fill="var(--color-bg)"
          />
          <circle cx={x + 70} cy="158" r="5" fill="var(--color-locked)" />
        </g>
      ))}

      {/* hanging moss between the archways */}
      <g fill="#4a5a3a">
        <path d="M224 84 q6 24 6 24 q0 -24 12 -22 q-6 22 -6 22 q0 -20 -12 -24 z" />
        <path d="M242 78 q6 22 6 22 q0 -22 12 -20 q-6 20 -6 20 q0 -18 -12 -22 z" />
        <path d="M446 80 q6 22 6 22 q0 -22 12 -20 q-6 20 -6 20 q0 -18 -12 -22 z" />
      </g>

      {/* torches between the archways */}
      <g>
        <rect x="228" y="196" width="8" height="34" rx="2" fill="#5a4a2a" />
        <ellipse cx="232" cy="188" rx="9" ry="13" fill="url(#jb-flame)" />
      </g>
      <g>
        <rect x="444" y="196" width="8" height="34" rx="2" fill="#5a4a2a" />
        <ellipse cx="448" cy="188" rx="9" ry="13" fill="url(#jb-flame)" />
      </g>

      {/* shelf clutter, top-left */}
      <rect x="20" y="112" width="70" height="4" fill="var(--color-locked)" />
      <g>
        <rect x="26" y="92" width="12" height="20" rx="2" fill="#4a6a5a" />
        <ellipse cx="52" cy="102" rx="9" ry="10" fill="#6a4a5a" />
        <rect x="68" y="94" width="14" height="18" rx="2" fill="#5a5a7a" />
      </g>

      {/* an alchemical sigil, top-right */}
      <g transform="translate(600,96)" stroke="#8a6a3a" strokeWidth="1.5" fill="none">
        <circle cx="0" cy="0" r="20" />
        <circle cx="0" cy="0" r="12" />
        <line x1="-20" y1="0" x2="20" y2="0" />
        <line x1="0" y1="-20" x2="0" y2="20" />
      </g>

      {/* a small stack of bottles, bottom-right */}
      <g>
        <rect x="596" y="376" width="60" height="12" rx="2" fill="#6a3a3a" />
        <rect x="600" y="366" width="52" height="12" rx="2" fill="#3a5a4a" />
        <rect x="604" y="356" width="46" height="12" rx="2" fill="#4a4a6a" />
      </g>
    </svg>
  );
}
