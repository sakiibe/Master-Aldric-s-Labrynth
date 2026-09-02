/**
 * Aldric, interrupted applying makeup. Renders over RoomBackdrop — no
 * background rect of its own. Character/prop colors are literal on purpose.
 */
export function AldricMakeup() {
	return (
		<svg
			viewBox="0 0 690 440"
			width="100%"
			height="100%"
			preserveAspectRatio="xMidYMid slice"
		>
			<defs>
				<linearGradient id="am-robe" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stopColor="#3a5a68" />
					<stop offset="100%" stopColor="#22333c" />
				</linearGradient>
				<linearGradient id="am-brass" x1="0" y1="0" x2="1" y2="1">
					<stop offset="0%" stopColor="#e0b45c" />
					<stop offset="100%" stopColor="#8a6a24" />
				</linearGradient>
				<radialGradient id="am-glassy" cx="35%" cy="30%" r="75%">
					<stop offset="0%" stopColor="#c8d8dd" />
					<stop offset="100%" stopColor="#6a8088" />
				</radialGradient>
			</defs>

			{/* ===== ALDRIC ===== */}
			<g transform="translate(292,116)">
				<path
					d="M-96 250 Q-96 158 -40 122 Q-10 108 20 108 Q50 108 80 122 Q140 158 140 250 Z"
					fill="url(#am-robe)"
				/>
				<g stroke="#1a2a30" strokeWidth="2" fill="none" opacity="0.7">
					<path d="M-40 136 Q-30 204 -44 250" />
					<path d="M20 124 Q22 194 22 250" />
					<path d="M80 136 Q70 204 88 250" />
				</g>
				<path
					d="M-50 126 Q17 150 84 126 Q92 158 78 178 Q17 196 -44 178 Q-58 158 -50 126 Z"
					fill="#e2ddd0"
					opacity="0.9"
				/>

				<path
					d="M-58 136 Q-76 92 -34 84 Q-20 108 17 110 Q54 108 68 84 Q110 92 92 136 Q60 112 17 112 Q-26 112 -58 136 Z"
					fill="#2f4a56"
				/>

				<rect x="2" y="72" width="30" height="26" rx="8" fill="#d8b48a" />
				<ellipse cx="17" cy="56" rx="30" ry="34" fill="#e6c39a" />
				<ellipse cx="-13" cy="58" rx="5" ry="8" fill="#e6c39a" />
				<ellipse cx="47" cy="58" rx="5" ry="8" fill="#e6c39a" />
				<path
					d="M-14 34 Q17 20 48 34 Q46 44 17 42 Q-12 44 -14 34 Z"
					fill="#e2ddd0"
				/>
				<path d="M-17 44 q-10 -8 -5 -20 q7 8 14 8 z" fill="#e2ddd0" />
				<path d="M51 44 q10 -8 5 -20 q-7 8 -14 8 z" fill="#e2ddd0" />

				{/* LEFT eye: fully done */}
				<path
					d="M-3 50 q9 -5 17 -1 l7 -5 l-5 7 q1 6 -8 7 q-10 1 -11 -8 z"
					fill="#7a4a8a"
					opacity="0.55"
				/>
				<ellipse cx="5" cy="54" rx="4.8" ry="4" fill="#fff" />
				<circle cx="6" cy="54.5" r="2.4" fill="#3a5a4a" />
				<path
					d="M-3 50 q9 -6 17 -2 l9 -6"
					stroke="#1c1410"
					strokeWidth="2.6"
					fill="none"
					strokeLinecap="round"
				/>
				<g stroke="#1c1410" strokeWidth="1.6" strokeLinecap="round">
					<line x1="-1" y1="49" x2="-4" y2="44" />
					<line x1="4" y1="47" x2="3" y2="42" />
					<line x1="9" y1="47" x2="10" y2="42" />
				</g>
				<path
					d="M-4 40 q10 -8 20 -2"
					stroke="#1c1410"
					strokeWidth="3.4"
					fill="none"
					strokeLinecap="round"
				/>

				{/* RIGHT eye: entirely bare */}
				<ellipse cx="30" cy="54" rx="4.8" ry="4" fill="#fff" />
				<circle cx="29" cy="54.5" r="2.4" fill="#3a5a4a" />
				<path
					d="M21 43 q10 -5 20 1"
					stroke="#d8d2c4"
					strokeWidth="4"
					fill="none"
					strokeLinecap="round"
				/>

				<path
					d="M17 56 q-4 8 -1 12 q3 2 6 0"
					stroke="#c99a72"
					strokeWidth="2"
					fill="none"
				/>
				<ellipse cx="42" cy="66" rx="7" ry="5" fill="#c4667a" opacity="0.42" />

				<path
					d="M-6 70 Q17 84 40 70 Q42 120 30 150 Q17 168 4 150 Q-8 120 -6 70 Z"
					fill="#e2ddd0"
				/>
				<g stroke="#c9c2b2" strokeWidth="1.5" fill="none" opacity="0.7">
					<path d="M4 84 Q10 120 12 150" />
					<path d="M24 84 Q22 120 22 150" />
				</g>
				<path
					d="M31 108 q6 22 -2 40"
					stroke="#c9c2b2"
					strokeWidth="6"
					fill="none"
					strokeLinecap="round"
				/>
				<path d="M27 150 q4 6 0 10 q-5 -4 0 -10z" fill="#7a4a8a" />
				<path d="M6 66 Q17 72 28 66 Q22 76 17 74 Q12 76 6 66z" fill="#e2ddd0" />

				{/* wildly overdrawn lips */}
				<g>
					<path
						d="M-3 76 q7 -13 11 -3 q5 -8 9 -2 q4 -6 9 2 q3 -9 11 3 q-8 4 -20 4 q-12 0 -20 -4 z"
						fill="#a8324a"
					/>
					<path
						d="M-3 76 q7 20 20 20 q13 0 20 -20 q-8 5 -20 5 q-12 0 -20 -5 z"
						fill="#c4415c"
					/>
					<path
						d="M4 70 q4 -6 7 -1"
						stroke="#e88aa0"
						strokeWidth="2.4"
						fill="none"
						strokeLinecap="round"
						opacity="0.85"
					/>
					<ellipse
						cx="12"
						cy="86"
						rx="6"
						ry="2.6"
						fill="#e88aa0"
						opacity="0.6"
					/>
					<path
						d="M33 78 q7 0 10 4"
						stroke="#c4415c"
						strokeWidth="2.6"
						fill="none"
						strokeLinecap="round"
						opacity="0.75"
					/>
				</g>

				{/* LEFT arm: hand mirror */}
				<path
					d="M-52 150 q-42 6 -58 -18"
					stroke="#e6c39a"
					strokeWidth="15"
					fill="none"
					strokeLinecap="round"
				/>
				<g transform="translate(-118,124) rotate(-12)">
					<rect
						x="-5"
						y="6"
						width="10"
						height="34"
						rx="4"
						fill="url(#am-brass)"
					/>
					<ellipse cx="0" cy="-10" rx="26" ry="30" fill="url(#am-brass)" />
					<ellipse cx="0" cy="-10" rx="20" ry="24" fill="url(#am-glassy)" />
					<path
						d="M-13 -24 q10 6 8 20"
						stroke="#eaf2f4"
						strokeWidth="4"
						fill="none"
						opacity="0.75"
						strokeLinecap="round"
					/>
				</g>

				{/* RIGHT arm: kohl stick */}
				<path
					d="M84 150 q40 -4 52 -34"
					stroke="#e6c39a"
					strokeWidth="15"
					fill="none"
					strokeLinecap="round"
				/>
				<g transform="translate(140,112) rotate(-40)">
					<rect x="-2.5" y="-26" width="5" height="34" rx="2" fill="#6a4a2a" />
					<path d="M-2.5 -26 l2.5 -8 l2.5 8 z" fill="#1c1410" />
				</g>
			</g>

			{/* ===== VANITY TABLE ===== */}
			<g transform="translate(0,352)">
				<rect x="24" y="0" width="632" height="14" rx="4" fill="#6a4a2a" />
				<rect
					x="24"
					y="14"
					width="632"
					height="8"
					fill="#4a3018"
					opacity="0.8"
				/>
				<g transform="translate(96,-26)">
					<rect x="-13" y="0" width="26" height="26" rx="4" fill="#3a2a18" />
					<ellipse cx="0" cy="0" rx="13" ry="6" fill="#7a4a8a" />
				</g>
				<g transform="translate(140,-22)">
					<rect x="-11" y="0" width="22" height="22" rx="4" fill="#3a2a18" />
					<ellipse cx="0" cy="0" rx="11" ry="5" fill="#2a8a68" />
				</g>
				<g transform="translate(178,-28)">
					<rect x="-12" y="0" width="24" height="28" rx="4" fill="#3a2a18" />
					<ellipse cx="0" cy="0" rx="12" ry="5.5" fill="#c4667a" />
				</g>
				<g transform="translate(214,-24)">
					<rect x="-6" y="4" width="12" height="20" rx="3" fill="#4a3a2a" />
					<rect x="-4" y="-6" width="8" height="12" rx="2" fill="#c4415c" />
					<path d="M-4 -6 q4 -6 8 0 z" fill="#e0596f" />
				</g>
				<g transform="translate(236,-6) rotate(-70)">
					<rect x="-5" y="0" width="10" height="12" rx="3" fill="#3a2a18" />
				</g>
				<g transform="translate(272,-8) rotate(-8)">
					<rect x="-24" y="-3" width="40" height="6" rx="3" fill="#8a6a3a" />
					<path d="M16 -4 q12 4 0 8 z" fill="#e2ddd0" />
				</g>
			</g>
		</svg>
	);
}
