/**
 * Aldric, caught mid-play with two figurines. Renders over RoomBackdrop —
 * no background rect of its own. Character/prop colors are literal on
 * purpose; the belt, buckle, hood ties, and motion arcs use var(--color-accent)
 * since those are the gold-trim accent, not a character-specific color.
 */
export function AldricFigurines() {
  return (
    <svg viewBox="0 0 690 440" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="af-robe" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a5a68" />
          <stop offset="100%" stopColor="#22333c" />
        </linearGradient>
        <linearGradient id="af-hood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2f4a56" />
          <stop offset="100%" stopColor="#1c2b32" />
        </linearGradient>
      </defs>

      {/* ===== ALDRIC ===== */}
      <g transform="translate(300,112)">
        <path d="M-96 250 Q-96 150 -40 118 Q-10 104 20 104 Q50 104 80 118 Q140 150 140 250 Z" fill="url(#af-robe)" />
        <g stroke="#1a2a30" strokeWidth="2" fill="none" opacity="0.7">
          <path d="M-40 132 Q-30 200 -44 250" />
          <path d="M20 120 Q22 190 22 250" />
          <path d="M80 132 Q70 200 88 250" />
        </g>
        {/* belt + buckle: gold-trim, themed */}
        <path d="M12 150 l10 0 l-2 20 l-6 0 z" fill="var(--color-accent)" />
        <circle cx="17" cy="176" r="8" fill="#2a8a68" stroke="var(--color-accent)" strokeWidth="2" />
        <line x1="-10" y1="126" x2="14" y2="150" stroke="var(--color-accent)" strokeWidth="1.5" />
        <line x1="44" y1="126" x2="20" y2="150" stroke="var(--color-accent)" strokeWidth="1.5" />

        <path d="M-58 132 Q-70 60 17 40 Q104 60 92 132 Q60 108 17 108 Q-26 108 -58 132 Z" fill="url(#af-hood)" />
        <rect x="2" y="72" width="30" height="26" rx="8" fill="#d8b48a" />
        <ellipse cx="17" cy="56" rx="30" ry="34" fill="#e6c39a" />
        <path d="M-14 34 Q17 20 48 34 Q46 44 17 42 Q-12 44 -14 34 Z" fill="#1c2b32" opacity="0.6" />
        <ellipse cx="-13" cy="58" rx="5" ry="8" fill="#e6c39a" />
        <ellipse cx="47" cy="58" rx="5" ry="8" fill="#e6c39a" />

        {/* eyebrows shot up, wide eyes, guilty mouth, embarrassed flush */}
        <path d="M-6 40 q10 -9 20 -3" stroke="#d8d2c4" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M20 37 q10 -6 20 3" stroke="#d8d2c4" strokeWidth="4" fill="none" strokeLinecap="round" />
        <ellipse cx="5" cy="54" rx="5.4" ry="4.6" fill="#fff" />
        <circle cx="7.5" cy="54.5" r="2.5" fill="#3a5a4a" />
        <ellipse cx="30" cy="54" rx="5.4" ry="4.6" fill="#fff" />
        <circle cx="32" cy="54.5" r="2.5" fill="#3a5a4a" />
        <path d="M17 56 q-4 8 -1 12 q3 2 6 0" stroke="#c99a72" strokeWidth="2" fill="none" />
        <ellipse cx="17" cy="77" rx="4.5" ry="5" fill="#8a4a44" />
        <ellipse cx="-4" cy="68" rx="7" ry="4.5" fill="#c4667a" opacity="0.3" />
        <ellipse cx="40" cy="68" rx="7" ry="4.5" fill="#c4667a" opacity="0.3" />

        <path d="M-6 70 Q17 84 40 70 Q42 120 30 150 Q17 168 4 150 Q-8 120 -6 70 Z" fill="#e2ddd0" />
        <g stroke="#c9c2b2" strokeWidth="1.5" fill="none" opacity="0.7">
          <path d="M4 84 Q10 120 12 150" />
          <path d="M24 84 Q22 120 22 150" />
          <path d="M17 82 L17 158" />
        </g>
        <path d="M6 66 Q17 72 28 66 Q22 76 17 74 Q12 76 6 66z" fill="#e2ddd0" />

        {/* LEFT arm aloft: princess figurine */}
        <path d="M-46 140 q-46 -14 -62 -46" stroke="#e6c39a" strokeWidth="15" fill="none" strokeLinecap="round" />
        <g transform="translate(-116,84) rotate(-24)">
          <ellipse cx="0" cy="0" rx="11" ry="8" fill="#e6c39a" />
          <g transform="translate(0,-26)">
            <path d="M-16 30 Q-12 6 -6 0 L6 0 Q12 6 16 30 Z" fill="#e089b0" />
            <g stroke="#f4b8d4" strokeWidth="1.6" fill="none" opacity="0.9">
              <path d="M-10 14 Q0 20 10 14" />
              <path d="M-13 22 Q0 29 13 22" />
            </g>
            <rect x="-6" y="-6" width="12" height="10" rx="3" fill="#f4b8d4" />
            <circle cx="0" cy="-13" r="8" fill="#e6c39a" />
            <path d="M-9 -16 Q0 -25 9 -16 Q6 -10 0 -12 Q-6 -10 -9 -16 Z" fill="#e8c05a" />
            <circle cx="-9" cy="-11" r="4" fill="#e8c05a" />
            <circle cx="9" cy="-11" r="4" fill="#e8c05a" />
            <path d="M-6 -22 l2 -6 l2 5 l2 -7 l2 7 l2 -5 l2 6 z" fill="#FAC775" />
            <circle cx="-2" cy="-14" r="1.2" fill="#3a2a12" />
            <circle cx="2" cy="-14" r="1.2" fill="#3a2a12" />
            <path d="M-13 4 q-8 6 -6 14" stroke="#e6c39a" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M13 4 q8 6 6 14" stroke="#e6c39a" strokeWidth="4" fill="none" strokeLinecap="round" />
          </g>
        </g>

        {/* RIGHT arm aloft: wizard king figurine */}
        <path d="M84 140 q48 -12 64 -44" stroke="#e6c39a" strokeWidth="15" fill="none" strokeLinecap="round" />
        <g transform="translate(156,86) rotate(22)">
          <ellipse cx="0" cy="0" rx="11" ry="8" fill="#e6c39a" />
          <g transform="translate(0,-26)">
            <path d="M-13 30 Q-11 8 -5 2 L5 2 Q11 8 13 30 Z" fill="#4a3a8a" />
            <g fill="#FAC775" opacity="0.9">
              <path d="M-6 12 l1.6 3.4 l3.4 0.5 l-2.6 2.4 l0.7 3.5 l-3.1 -1.8 l-3.1 1.8 l0.7 -3.5 l-2.6 -2.4 l3.4 -0.5 z" />
              <circle cx="6" cy="20" r="1.6" />
              <circle cx="3" cy="9" r="1.2" />
            </g>
            <circle cx="0" cy="-8" r="8" fill="#e6c39a" />
            <path d="M-6 -4 q6 14 6 20 q-2 -6 -6 -20z" fill="#e2ddd0" />
            <path d="M6 -4 q-6 14 -6 20 q2 -6 6 -20z" fill="#e2ddd0" />
            <circle cx="-2.6" cy="-9" r="1.2" fill="#3a2a12" />
            <circle cx="2.6" cy="-9" r="1.2" fill="#3a2a12" />
            <path d="M-11 -13 Q0 -40 11 -13 Q0 -8 -11 -13 Z" fill="#3a2a6a" />
            <path d="M-12 -13 h24 v4 h-24 z" fill="#2a8a68" />
            <path d="M-9 -17 l2 -6 l2 5 l2 -7 l2 7 l2 -5 l2 6 z" fill="#e8c05a" transform="translate(1,0)" />
            <circle cx="0" cy="-33" r="2.6" fill="#FAC775" />
            <rect x="14" y="-16" width="3" height="40" rx="1.5" fill="#8a6a3a" />
            <circle cx="15.5" cy="-19" r="5" fill="#2a8a68" stroke="var(--color-accent)" strokeWidth="1.5" />
          </g>
        </g>

        {/* motion arcs: gold-trim, themed */}
        <g stroke="var(--color-accent)" strokeWidth="2" fill="none" opacity="0.45" strokeLinecap="round">
          <path d="M-142 52 q10 -12 22 -10" />
          <path d="M-134 40 q14 -16 30 -12" />
          <path d="M186 54 q-10 -12 -22 -10" />
          <path d="M178 42 q-14 -16 -30 -12" />
        </g>
      </g>

      {/* ===== THE TABLE OF FIGURES ===== */}
      <g transform="translate(0,344)">
        <rect x="24" y="0" width="632" height="14" rx="4" fill="#6a4a2a" />
        <rect x="24" y="14" width="632" height="8" fill="#4a3018" opacity="0.8" />
        <g transform="translate(92,-34)">
          <path d="M-9 34 Q-9 12 0 6 Q9 12 9 34 Z" fill="#3a5a68" />
          <circle cx="0" cy="2" r="7" fill="#e6c39a" />
          <path d="M-8 0 Q0 -10 8 0 Q0 -4 -8 0 Z" fill="#2f4a56" />
          <path d="M-3 6 q3 10 3 16 q-3 -4 -3 -16z" fill="#e2ddd0" />
        </g>
        <g transform="translate(140,-40)">
          <rect x="-13" y="0" width="26" height="40" fill="#8a8272" />
          <path d="M-13 0 h5 v-7 h5 v7 h5 v-7 h5 v7 h5" fill="none" stroke="#8a8272" strokeWidth="6" />
          <rect x="-4" y="20" width="8" height="12" rx="4" fill="#3a2a18" />
        </g>
        <g transform="translate(196,-16) rotate(78)">
          <path d="M-7 22 Q-7 6 0 2 Q7 6 7 22 Z" fill="#6a4a5a" />
          <circle cx="0" cy="-1" r="6" fill="#e6c39a" />
        </g>
        <g transform="translate(244,-18)">
          <path d="M-10 0 q10 16 20 0 z" fill="#8a6a3a" />
          <rect x="2" y="-12" width="3" height="12" rx="1.5" fill="#8a6a3a" />
        </g>
      </g>
    </svg>
  );
}
