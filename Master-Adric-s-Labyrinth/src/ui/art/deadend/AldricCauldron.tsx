/**
 * Aldric, mid-boil-over. Renders over RoomBackdrop — no background rect of
 * its own. Character/prop colors are literal on purpose; the belt, buckle,
 * and hood ties use var(--color-accent) since those are the gold-trim
 * accent, not a character-specific color.
 */
export function AldricCauldron() {
  return (
    <svg viewBox="0 0 690 440" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="ac-robe" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a5a68" />
          <stop offset="100%" stopColor="#22333c" />
        </linearGradient>
        <linearGradient id="ac-hood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2f4a56" />
          <stop offset="100%" stopColor="#1c2b32" />
        </linearGradient>
        <linearGradient id="ac-iron" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a4a52" />
          <stop offset="55%" stopColor="#2e2e36" />
          <stop offset="100%" stopColor="#191920" />
        </linearGradient>
        <radialGradient id="ac-brew" cx="50%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#9BF0C8" />
          <stop offset="55%" stopColor="#3fae82" />
          <stop offset="100%" stopColor="#1d5c44" />
        </radialGradient>
        <radialGradient id="ac-fire" cx="50%" cy="70%" r="70%">
          <stop offset="0%" stopColor="#FAC775" />
          <stop offset="60%" stopColor="#E08A2A" />
          <stop offset="100%" stopColor="#8a3a10" />
        </radialGradient>
      </defs>

      {/* sickly green wash from the boil-over */}
      <ellipse cx="352" cy="250" rx="230" ry="150" fill="#2a8a68" opacity="0.11" />

      {/* an open recipe book on a stand, ignored */}
      <g transform="translate(596,196)">
        <path d="M-30 0 L0 -6 L30 0 L30 4 L0 -2 L-30 4 Z" fill="#6a4a2a" />
        <path d="M-30 0 Q-16 -14 0 -6 Q16 -14 30 0 L30 4 Q16 -9 0 -2 Q-16 -9 -30 4 Z" fill="#e2ddd0" opacity="0.85" />
        <g stroke="#8a7f66" strokeWidth="1" opacity="0.7">
          <line x1="-24" y1="-2" x2="-6" y2="-6" />
          <line x1="-24" y1="2" x2="-6" y2="-2" />
          <line x1="8" y1="-6" x2="26" y2="-2" />
          <line x1="8" y1="-2" x2="26" y2="2" />
        </g>
      </g>

      {/* ===== ALDRIC ===== */}
      <g transform="translate(268,110)">
        <path d="M-96 250 Q-96 150 -40 118 Q-10 104 20 104 Q50 104 80 118 Q140 150 140 250 Z" fill="url(#ac-robe)" />
        <g stroke="#1a2a30" strokeWidth="2" fill="none" opacity="0.7">
          <path d="M-40 132 Q-30 200 -44 250" />
          <path d="M20 120 Q22 190 22 250" />
          <path d="M80 132 Q70 200 88 250" />
        </g>
        <g fill="#3fae82" opacity="0.55">
          <ellipse cx="34" cy="176" rx="7" ry="10" />
          <ellipse cx="58" cy="208" rx="5" ry="7" />
          <ellipse cx="12" cy="214" rx="4" ry="6" />
        </g>
        {/* belt + buckle: gold-trim, themed */}
        <path d="M12 150 l10 0 l-2 20 l-6 0 z" fill="var(--color-accent)" />
        <circle cx="17" cy="176" r="8" fill="#2a8a68" stroke="var(--color-accent)" strokeWidth="2" />
        <line x1="-10" y1="126" x2="14" y2="150" stroke="var(--color-accent)" strokeWidth="1.5" />
        <line x1="44" y1="126" x2="20" y2="150" stroke="var(--color-accent)" strokeWidth="1.5" />

        <path d="M-58 132 Q-70 60 17 40 Q104 60 92 132 Q60 108 17 108 Q-26 108 -58 132 Z" fill="url(#ac-hood)" />
        <rect x="2" y="72" width="30" height="26" rx="8" fill="#d8b48a" />
        <ellipse cx="17" cy="56" rx="30" ry="34" fill="#e6c39a" />
        <path d="M-14 34 Q17 20 48 34 Q46 44 17 42 Q-12 44 -14 34 Z" fill="#1c2b32" opacity="0.6" />
        <ellipse cx="-13" cy="58" rx="5" ry="8" fill="#e6c39a" />
        <ellipse cx="47" cy="58" rx="5" ry="8" fill="#e6c39a" />

        {/* brows knotted hard in the middle, weary slit eyes, flat grim mouth */}
        <path d="M-4 40 q10 4 18 -1" stroke="#d8d2c4" strokeWidth="4.4" fill="none" strokeLinecap="round" />
        <path d="M18 39 q10 -5 20 2" stroke="#d8d2c4" strokeWidth="4.4" fill="none" strokeLinecap="round" />
        <path d="M0 54 q6 -4 11 0" stroke="#3a5a4a" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M24 54 q6 -4 11 0" stroke="#3a5a4a" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M17 56 q-4 8 -1 12 q3 2 6 0" stroke="#c99a72" strokeWidth="2" fill="none" />
        <path d="M8 78 q9 -2 18 0" stroke="#a06a4a" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        <ellipse cx="41" cy="70" rx="7" ry="4" fill="#2e2e36" opacity="0.35" transform="rotate(-14 41 70)" />

        <path d="M-6 70 Q17 84 40 70 Q42 120 30 150 Q17 168 4 150 Q-8 120 -6 70 Z" fill="#e2ddd0" />
        <g stroke="#c9c2b2" strokeWidth="1.5" fill="none" opacity="0.7">
          <path d="M4 84 Q10 120 12 150" />
          <path d="M24 84 Q22 120 22 150" />
          <path d="M17 82 L17 158" />
        </g>
        <path d="M6 66 Q17 72 28 66 Q22 76 17 74 Q12 76 6 66z" fill="#e2ddd0" />
        <path d="M14 158 q4 8 -2 14 q-6 -6 -2 -14z" fill="#8a7f66" opacity="0.8" />

        {/* LEFT arm still stirring */}
        <path d="M84 148 q46 4 62 -14" stroke="#e6c39a" strokeWidth="15" fill="none" strokeLinecap="round" />
        <g transform="translate(152,128) rotate(28)">
          <rect x="-3" y="-52" width="6" height="72" rx="3" fill="#8a6a3a" />
          <path d="M-9 18 q9 10 18 0 q-9 6 -18 0z" fill="#6a4a2a" />
        </g>

        {/* RIGHT arm flung up in surrender */}
        <path d="M-52 142 q-40 -20 -50 -54" stroke="#e6c39a" strokeWidth="15" fill="none" strokeLinecap="round" />
        <g transform="translate(-106,78)">
          <path d="M0 8 q-10 -14 2 -20 q12 -6 16 6 q3 12 -8 16 z" fill="#e6c39a" />
          <g stroke="#e6c39a" strokeWidth="5" strokeLinecap="round">
            <line x1="-2" y1="-12" x2="-6" y2="-24" />
            <line x1="5" y1="-14" x2="4" y2="-27" />
            <line x1="12" y1="-12" x2="14" y2="-24" />
          </g>
        </g>
      </g>

      {/* ===== THE CAULDRON ===== */}
      <g transform="translate(452,258)">
        <g transform="translate(0,86)">
          <ellipse cx="0" cy="6" rx="62" ry="12" fill="#3a2a18" />
          <g stroke="#5c3616" strokeWidth="7" strokeLinecap="round">
            <line x1="-40" y1="4" x2="12" y2="-4" />
            <line x1="-12" y1="-6" x2="42" y2="4" />
          </g>
          <path d="M-30 0 q10 -34 16 -12 q6 -30 16 -6 q8 -22 14 4 q6 16 -14 20 q-30 4 -32 -6z" fill="url(#ac-fire)" />
          <ellipse cx="0" cy="-8" rx="70" ry="34" fill="#E08A2A" opacity="0.16" />
        </g>

        <path d="M-92 -14 Q-98 62 -40 76 L40 76 Q98 62 92 -14 Z" fill="url(#ac-iron)" />
        <ellipse cx="0" cy="-14" rx="92" ry="22" fill="#3a3a44" />
        <ellipse cx="0" cy="-12" rx="80" ry="16" fill="#141418" />
        <path d="M-78 -6 Q-70 44 -40 60" stroke="#6a6a76" strokeWidth="4" fill="none" opacity="0.45" strokeLinecap="round" />
        <circle cx="-92" cy="6" r="11" fill="none" stroke="#3a3a44" strokeWidth="5" />
        <circle cx="92" cy="6" r="11" fill="none" stroke="#3a3a44" strokeWidth="5" />

        <ellipse cx="0" cy="-14" rx="78" ry="15" fill="url(#ac-brew)" />
        <path d="M-80 -14 Q-72 -54 -34 -58 Q0 -78 34 -58 Q74 -54 80 -14 Q0 4 -80 -14 Z" fill="#9BF0C8" opacity="0.92" />
        <g fill="#d8ffe8" opacity="0.85">
          <circle cx="-44" cy="-44" r="13" />
          <circle cx="-12" cy="-58" r="16" />
          <circle cx="22" cy="-50" r="12" />
          <circle cx="52" cy="-36" r="11" />
          <circle cx="-70" cy="-28" r="9" />
        </g>

        <path d="M-80 -18 Q-102 22 -96 74 Q-84 82 -78 74 Q-86 26 -66 -8 Z" fill="#3fae82" opacity="0.9" />
        <path d="M80 -18 Q104 26 98 74 Q86 82 80 74 Q90 28 66 -8 Z" fill="#3fae82" opacity="0.9" />

        <ellipse cx="-6" cy="106" rx="150" ry="20" fill="#2a8a68" opacity="0.55" />
        <ellipse cx="-6" cy="104" rx="120" ry="13" fill="#3fae82" opacity="0.7" />
        <g fill="#9BF0C8" opacity="0.65">
          <circle cx="-108" cy="102" r="6" />
          <circle cx="96" cy="106" r="5" />
          <circle cx="-56" cy="112" r="4" />
        </g>

        <g fill="#9BF0C8" opacity="0.8">
          <ellipse cx="-118" cy="-52" rx="4" ry="6" transform="rotate(-20 -118 -52)" />
          <ellipse cx="-92" cy="-84" rx="3" ry="5" />
          <ellipse cx="112" cy="-64" rx="4" ry="6" transform="rotate(18 112 -64)" />
          <ellipse cx="88" cy="-96" rx="3" ry="4.5" />
        </g>

        <g stroke="#9BF0C8" strokeWidth="3" fill="none" opacity="0.3" strokeLinecap="round">
          <path d="M-40 -92 q16 -22 0 -42 q-14 -18 0 -34" />
          <path d="M10 -104 q18 -24 0 -44" />
          <path d="M56 -88 q14 -20 0 -38 q-12 -16 0 -28" />
        </g>
      </g>
    </svg>
  );
}
