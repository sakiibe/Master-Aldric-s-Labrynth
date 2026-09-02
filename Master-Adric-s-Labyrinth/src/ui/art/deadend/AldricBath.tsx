/**
 * Aldric, interrupted in a bubble bath. Renders over RoomBackdrop — no
 * background rect of its own. Character/prop colors are literal on purpose
 * (skin, robe, copper tub, foam); nothing here is a structural theme color.
 */
export function AldricBath() {
	return (
		<svg
			viewBox="0 0 690 440"
			width="100%"
			height="100%"
			preserveAspectRatio="xMidYMid slice"
		>
			<defs>
				<linearGradient id="ab-copper" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stopColor="#c07a3a" />
					<stop offset="55%" stopColor="#8a5424" />
					<stop offset="100%" stopColor="#5c3616" />
				</linearGradient>
				<linearGradient id="ab-foam" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stopColor="#ffffff" />
					<stop offset="100%" stopColor="#d9dbe0" />
				</linearGradient>
			</defs>

			{/* his hat and robe hung on a hook, left */}
			<g transform="translate(78,96)">
				<line x1="0" y1="0" x2="0" y2="8" stroke="#6a5a3a" strokeWidth="3" />
				<path d="M-26 8 Q0 -26 26 8 Q0 16 -26 8 Z" fill="#2f4a56" />
				<path d="M-30 8 h60 v5 h-60 z" fill="#22333c" />
				<path
					d="M-14 13 Q-20 78 -8 104 Q0 112 8 104 Q20 78 14 13 Z"
					fill="#3a5a68"
					opacity="0.9"
				/>
			</g>

			{/* steam wisps */}
			<g
				stroke="#e8e2d0"
				strokeWidth="2.5"
				fill="none"
				opacity="0.22"
				strokeLinecap="round"
			>
				<path d="M232 132 q14 -20 0 -38 q-14 -18 0 -34" />
				<path d="M300 118 q16 -22 0 -40" />
				<path d="M392 136 q14 -20 0 -38 q-12 -16 0 -30" />
			</g>

			{/* ===== ALDRIC IN THE TUB ===== */}
			<g transform="translate(300,120)">
				<path d="M-52 148 Q-46 96 17 90 Q80 96 86 148 Z" fill="#e6c39a" />

				<rect x="2" y="70" width="30" height="26" rx="8" fill="#d8b48a" />
				<ellipse cx="17" cy="54" rx="30" ry="34" fill="#e6c39a" />
				<ellipse cx="-13" cy="56" rx="5" ry="8" fill="#e6c39a" />
				<ellipse cx="47" cy="56" rx="5" ry="8" fill="#e6c39a" />
				<path d="M-16 40 q-10 -6 -6 -16 q6 6 12 6 z" fill="#e2ddd0" />
				<path d="M50 40 q10 -6 6 -16 q-6 6 -12 6 z" fill="#e2ddd0" />
				<path
					d="M-14 30 Q17 16 48 30 Q46 40 17 38 Q-12 40 -14 30 Z"
					fill="#e2ddd0"
					opacity="0.85"
				/>
				<path
					d="M-6 36 q10 -9 20 -3"
					stroke="#d8d2c4"
					strokeWidth="4"
					fill="none"
					strokeLinecap="round"
				/>
				<path
					d="M20 33 q10 -6 20 3"
					stroke="#d8d2c4"
					strokeWidth="4"
					fill="none"
					strokeLinecap="round"
				/>
				<ellipse cx="5" cy="52" rx="5" ry="4.2" fill="#fff" />
				<circle cx="6" cy="52.5" r="2.4" fill="#3a5a4a" />
				<ellipse cx="30" cy="52" rx="5" ry="4.2" fill="#fff" />
				<circle cx="29" cy="52.5" r="2.4" fill="#3a5a4a" />
				<path
					d="M17 54 q-4 8 -1 12 q3 2 6 0"
					stroke="#c99a72"
					strokeWidth="2"
					fill="none"
				/>
				<path
					d="M8 74 q9 3 18 0"
					stroke="#a06a4a"
					strokeWidth="2.5"
					fill="none"
					strokeLinecap="round"
				/>
				<path
					d="M-6 68 Q17 82 40 68 Q44 108 30 132 Q17 148 4 132 Q-10 108 -6 68 Z"
					fill="#e2ddd0"
				/>
				<g stroke="#c9c2b2" strokeWidth="1.5" fill="none" opacity="0.7">
					<path d="M4 82 Q10 112 12 134" />
					<path d="M24 82 Q22 112 22 134" />
				</g>
				<ellipse
					cx="17"
					cy="152"
					rx="3"
					ry="4.5"
					fill="#bcd6dd"
					opacity="0.85"
				/>
				<g fill="url(#ab-foam)" opacity="0.95">
					<circle cx="6" cy="126" r="9" />
					<circle cx="22" cy="132" r="8" />
					<circle cx="15" cy="120" r="7" />
				</g>
			</g>

			{/* arms over the tub rim */}
			<g transform="translate(300,120)">
				<path
					d="M-52 140 q-34 12 -44 34"
					stroke="#e6c39a"
					strokeWidth="16"
					fill="none"
					strokeLinecap="round"
				/>
				<path
					d="M86 140 q36 10 46 32"
					stroke="#e6c39a"
					strokeWidth="16"
					fill="none"
					strokeLinecap="round"
				/>
				<g transform="translate(134,176) rotate(-18)">
					<rect x="-16" y="-7" width="32" height="12" rx="4" fill="#8a6a3a" />
					<g stroke="#d8cfae" strokeWidth="2.2" strokeLinecap="round">
						<line x1="-12" y1="6" x2="-12" y2="14" />
						<line x1="-5" y1="6" x2="-5" y2="14" />
						<line x1="2" y1="6" x2="2" y2="14" />
						<line x1="9" y1="6" x2="9" y2="14" />
					</g>
				</g>
			</g>

			{/* ===== THE TUB ===== */}
			<g transform="translate(300,252)">
				<path d="M-118 44 q-10 12 2 18 q14 2 14 -14z" fill="#5c3616" />
				<path d="M118 44 q10 12 -2 18 q-14 2 -14 -14z" fill="#5c3616" />
				<path
					d="M-140 -6 Q-140 52 -104 58 L104 58 Q140 52 140 -6 Z"
					fill="url(#ab-copper)"
				/>
				<ellipse cx="0" cy="-6" rx="140" ry="20" fill="#c07a3a" />
				<ellipse cx="0" cy="-4" rx="128" ry="15" fill="#4a2c12" />
				<path
					d="M-116 6 Q-108 40 -86 48"
					stroke="#e0a35c"
					strokeWidth="5"
					fill="none"
					opacity="0.55"
					strokeLinecap="round"
				/>
				<g fill="url(#ab-foam)">
					<ellipse cx="0" cy="-6" rx="122" ry="13" />
					<circle cx="-96" cy="-14" r="13" />
					<circle cx="-66" cy="-20" r="17" />
					<circle cx="-34" cy="-14" r="12" />
					<circle cx="52" cy="-18" r="15" />
					<circle cx="84" cy="-13" r="12" />
					<circle cx="108" cy="-16" r="10" />
					<circle cx="20" cy="-12" r="10" />
				</g>
				<g transform="translate(96,-30)">
					<ellipse cx="0" cy="4" rx="15" ry="11" fill="#F3C98A" />
					<circle cx="9" cy="-6" r="9" fill="#FAC775" />
					<path d="M16 -6 l10 3 l-10 3 z" fill="#E08A2A" />
					<circle cx="11" cy="-8" r="1.8" fill="#3a2a12" />
					<path d="M-4 2 l4 -6 l4 6 z" fill="#2a8a68" opacity="0.8" />
				</g>
				<g fill="none" stroke="#dfe6ea" strokeWidth="1.6" opacity="0.6">
					<circle cx="-150" cy="-70" r="11" />
					<circle cx="-124" cy="-104" r="7" />
					<circle cx="160" cy="-84" r="9" />
					<circle cx="182" cy="-46" r="6" />
				</g>
			</g>
		</svg>
	);
}
