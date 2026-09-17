import { useEffect, useState } from 'react';
import type { BuiltWorkflow, JobAidId, WorkflowId } from '../../game/types';
import { useTheme } from '../../state/useTheme';
import { generateStars } from './overworldShared';
import { SigilSvg } from '../art/DistrictSigil';
import { DISTRICT_TINT } from '../art/districtTints';

/**
 * The Overworld Ladder — Free Play's home screen, and the flat alternative to
 * the trail map's gated night map.
 *
 * Four vertical ladders stand side by side on one ground line; every rung is
 * a workflow and EVERY RUNG IS UNLOCKED. There is no sealed/current/cleared
 * triad and no "next" plaque — a rung is either open (gold lantern dot) or
 * complete (green check), and any rung launches at any time. Same night
 * palette, same fonts, same tokens as the trail map; only the navigation
 * model differs.
 *
 * Ported from a design-handoff mockup (see the README's "Variant: Overworld
 * Ladder" section), substituting real workflow data for the mock's hardcoded
 * title lists. Two deliberate departures from the mock, both called for by
 * the handoff: completion is a SET of workflow
 * ids rather than the mock's prefix count (rungs may be cleared in any
 * order), and the district chips carry the four drawn sigils rather than the
 * mock's placeholder glyph characters.
 *
 * Sky, stars, hedge horizon, ground and mist are the trail map's, verbatim;
 * the moon moves right and the tower shrinks onto the horizon so the 20-rung
 * Verification ladder has room. Colours not in `theme.ts` are the same
 * scene-only shades the trail map uses.
 */

interface OverworldLadderProps {
	workflows: BuiltWorkflow[];
	completed: WorkflowId[];
	onSelect: (id: WorkflowId) => void;
	/** Leave the ladder for the title screen. */
	onExit: () => void;
}

const STAGE_W = 1920;
const STAGE_H = 1080;
const STAR_COUNT = 170;
/** The ladder mock's own seed — a different star field from the trail map. */
const STAR_SEED = 20260904;

/** Left → right. Ladder height encodes workflow count, so the order is the
 * handoff's, not the registry's: 2 · 14 · 12 · 20. */
const ORDER: JobAidId[] = ['bpmh', 'cpoe', 'oncology', 'verification'];

/** Signpost-style district names, upper-cased for the header plate. */
const PLATE_NAME: Record<JobAidId, string> = {
	bpmh: 'BPMH & MED REC',
	cpoe: 'CPOE',
	oncology: 'ONCOLOGY ORDERS',
	verification: 'PHARMACIST VERIFICATION',
};

/* ------------------------------------------------------------------ */

export function OverworldLadder({
	workflows,
	completed,
	onSelect,
	onExit,
}: OverworldLadderProps) {
	const theme = useTheme();
	const [scale, setScale] = useState(1);

	useEffect(() => {
		const fit = () =>
			setScale(
				Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H),
			);
		fit();
		window.addEventListener('resize', fit);
		return () => window.removeEventListener('resize', fit);
	}, []);

	const stars = generateStars(STAR_SEED, STAGE_W, STAR_COUNT);

	const done = new Set(completed);
	const districts = ORDER.map((key) => {
		const list = workflows.filter((w) => w.jobAid === key);
		return {
			key,
			color: theme.jobAids[key].color,
			tint: DISTRICT_TINT[key],
			list,
			nDone: list.filter((w) => done.has(w.id)).length,
		};
	});

	const totalAll = workflows.length;
	const totalDone = districts.reduce((s, d) => s + d.nDone, 0);
	const green = theme.colors.correct;

	return (
		<div
			style={{
				width: '100vw',
				height: '100vh',
				background: theme.colors.bg,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				overflow: 'hidden',
			}}
		>
			<div
				style={{
					position: 'relative',
					width: STAGE_W,
					height: STAGE_H,
					flex: 'none',
					transform: `scale(${scale})`,
					transformOrigin: 'center center',
				}}
			>
				<svg
					viewBox={`0 0 ${STAGE_W} ${STAGE_H}`}
					width={STAGE_W}
					height={STAGE_H}
					style={{ position: 'absolute', inset: 0, display: 'block' }}
				>
					<defs>
						<radialGradient id="lr-sky" cx="0.5" cy="0.04" r="0.98">
							<stop offset="0" stopColor="#33235c" />
							<stop offset="0.45" stopColor="#241a44" />
							<stop offset="1" stopColor="#160f28" />
						</radialGradient>
						<linearGradient id="lr-ground" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0" stopColor="#241a42" />
							<stop offset="0.55" stopColor="#1d1435" />
							<stop offset="1" stopColor="#170f2a" />
						</linearGradient>
						<radialGradient id="lr-moonhalo" cx="0.5" cy="0.5" r="0.5">
							<stop offset="0" stopColor="#f4ead6" stopOpacity="0.42" />
							<stop offset="0.35" stopColor="#c9b8e8" stopOpacity="0.16" />
							<stop offset="1" stopColor="#c9b8e8" stopOpacity="0" />
						</radialGradient>
						<radialGradient id="lr-lamp" cx="0.5" cy="0.5" r="0.5">
							<stop offset="0" stopColor="#ffd79a" stopOpacity="0.75" />
							<stop offset="1" stopColor="#ffd79a" stopOpacity="0" />
						</radialGradient>
						<linearGradient id="lr-mist" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0" stopColor="#c9b8e8" stopOpacity="0" />
							<stop offset="0.5" stopColor="#c9b8e8" stopOpacity="0.13" />
							<stop offset="1" stopColor="#c9b8e8" stopOpacity="0" />
						</linearGradient>
						<filter id="lr-glow" x="-120%" y="-120%" width="340%" height="340%">
							<feGaussianBlur stdDeviation="6" result="b" />
							<feMerge>
								<feMergeNode in="b" />
								<feMergeNode in="SourceGraphic" />
							</feMerge>
						</filter>
					</defs>

					<rect
						x="0"
						y="0"
						width={STAGE_W}
						height={STAGE_H}
						fill="url(#lr-sky)"
					/>

					{stars.map((s, i) => (
						<circle
							key={i}
							cx={s.x}
							cy={s.y}
							r={s.r}
							fill="#f4ead6"
							className={s.twinkle ? 'lr-twinkle' : undefined}
							opacity={s.twinkle ? undefined : s.opacity}
							style={
								s.twinkle
									? ({
											'--dur': `${s.dur}s`,
											'--delay': `${s.delay}s`,
											opacity: 0.9,
										} as React.CSSProperties)
									: undefined
							}
						/>
					))}

					{/* moon — moved right and shrunk so it clears the tallest ladder */}
					<g>
						<circle cx="1712" cy="128" r="170" fill="url(#lr-moonhalo)" />
						<circle cx="1712" cy="128" r="54" fill="#f4ead6" />
						<circle cx="1712" cy="128" r="54" fill="#e6dcc6" opacity="0.5" />
						<circle cx="1696" cy="114" r="9.5" fill="#d8ccb2" opacity="0.75" />
						<circle cx="1728" cy="142" r="6.5" fill="#d8ccb2" opacity="0.6" />
					</g>

					{/* hedge-maze horizon */}
					<path
						d="M0,268 L0,214 L46,214 L46,190 L92,190 L92,222 L150,222 L150,196 L214,196 L214,228 L268,228 L268,202 L332,202 L332,232 L392,232 L392,198 L452,198 L452,226 L520,226 L520,204 L586,204 L586,234 L648,234 L648,206 L716,206 L716,230 L782,230 L782,200 L850,200 L850,228 L918,228 L918,208 L988,208 L988,232 L1054,232 L1054,198 L1122,198 L1122,226 L1190,226 L1190,204 L1258,204 L1258,230 L1324,230 L1324,200 L1392,200 L1392,228 L1460,228 L1460,206 L1528,206 L1528,232 L1596,232 L1596,202 L1664,202 L1664,228 L1732,228 L1732,198 L1800,198 L1800,226 L1866,226 L1866,208 L1920,208 L1920,268 Z"
						fill="#160f28"
						opacity="0.92"
					/>
					<path
						d="M0,272 L0,238 L1920,238 L1920,272 Z"
						fill="#160f28"
						opacity="0.6"
					/>

					{/* the tower is scenery here — small and distant on the horizon,
					    the shared summit rather than a hub the paths run into */}
					<g transform="translate(960 252) scale(0.62)">
						<circle
							cx="0"
							cy="-150"
							r="150"
							fill="url(#lr-lamp)"
							opacity="0.34"
						/>
						<path
							d="M-46,0 L-38,-208 L38,-208 L46,0 Z"
							fill="#2a1d47"
							stroke="#4a3d63"
							strokeWidth="2"
						/>
						<path d="M-38,-208 L38,-208 L38,-220 L-38,-220 Z" fill="#372753" />
						<path
							d="M-54,-220 L54,-220 L46,-242 L-46,-242 Z"
							fill="#372753"
							stroke="#4a3d63"
							strokeWidth="1.5"
						/>
						<path
							d="M-46,-242 L0,-330 L46,-242 Z"
							fill="#241a42"
							stroke="#4a3d63"
							strokeWidth="2"
						/>
						<path d="M0,-330 L0,-356" stroke="#caa14a" strokeWidth="3" />
						<circle cx="0" cy="-362" r="6" fill="#caa14a" />
						<path
							d="M-22,-178 L22,-178 L22,-132 Q0,-116 -22,-132 Z"
							fill="#ffcf8f"
							opacity="0.9"
							filter="url(#lr-glow)"
						/>
						<path
							d="M-30,-96 L30,-96 L30,-52 L-30,-52 Z"
							fill="#caa14a"
							opacity="0.2"
						/>
					</g>

					<rect
						x="0"
						y="248"
						width={STAGE_W}
						height="832"
						fill="url(#lr-ground)"
					/>
					<ellipse cx="960" cy="262" rx="1180" ry="52" fill="url(#lr-mist)" />
					<ellipse
						cx="960"
						cy="300"
						rx="820"
						ry="38"
						fill="url(#lr-mist)"
						opacity="0.7"
					/>
					<g opacity="0.5">
						<ellipse
							cx="960"
							cy="1016"
							rx="1120"
							ry="86"
							fill="url(#lr-mist)"
						/>
						<ellipse cx="420" cy="1048" rx="640" ry="58" fill="url(#lr-mist)" />
						<ellipse
							cx="1500"
							cy="1052"
							rx="600"
							ry="52"
							fill="url(#lr-mist)"
						/>
					</g>

					{/* the one ground line all four ladders stand on */}
					<path
						d="M0,986 L1920,986"
						stroke="#4a3d63"
						strokeWidth="1.5"
						opacity="0.45"
					/>

					{/* HUD — wordmark, top-left */}
					<g transform="translate(56 60)">
						<path
							d="M0,0 L0,-14 L26,-14"
							stroke="#caa14a"
							strokeWidth="2"
							fill="none"
						/>
						<path
							d="M0,0 L0,50 L26,50"
							stroke="#caa14a"
							strokeWidth="2"
							fill="none"
						/>
						<text
							x="18"
							y="16"
							fontFamily="Cinzel, serif"
							fontSize="19"
							fontWeight="700"
							letterSpacing="4.5"
							fill="#caa14a"
						>
							MASTER ALDRIC&apos;S
						</text>
						<text
							x="18"
							y="40"
							fontFamily="Cinzel, serif"
							fontSize="19"
							fontWeight="700"
							letterSpacing="4.5"
							fill="#f4ead6"
						>
							LADDER OF RITES
						</text>
					</g>

					<text
						x="960"
						y="120"
						textAnchor="middle"
						fontFamily="Cinzel, serif"
						fontSize="17"
						letterSpacing="4"
						fill="#caa14a"
					>
						ALDRIC&apos;S TOWER
					</text>
					<text
						x="960"
						y="146"
						textAnchor="middle"
						fontFamily="Spectral, serif"
						fontSize="15"
						letterSpacing="1.4"
						fill="#7d6bab"
						fontStyle="italic"
					>
						every rung is yours to climb
					</text>
				</svg>

				{/* HTML layer over the scaled stage: the ladders themselves plus the
				    readouts, because SVG <text> can't wrap a workflow title. */}
				<div style={{ position: 'absolute', inset: 0 }}>
					{/* the readout lives top-LEFT, under the wordmark: the 20-rung
					    Verification ladder occupies the top-right */}
					<div style={{ position: 'absolute', left: 74, top: 132 }}>
						<div
							style={{
								font: '500 12px Cinzel, serif',
								letterSpacing: '2.6px',
								color: '#7d6bab',
							}}
						>
							RITES COMPLETE
						</div>
						<div
							style={{
								font: '700 26px Cinzel, serif',
								letterSpacing: '2px',
								color: '#caa14a',
								marginTop: 4,
							}}
						>
							{totalDone} / {totalAll}
						</div>
					</div>

					<div
						style={{
							position: 'absolute',
							left: 50,
							right: 50,
							top: 190,
							bottom: 78,
							display: 'flex',
							alignItems: 'flex-end',
							justifyContent: 'center',
							gap: 34,
						}}
					>
						{districts.map((d) => (
							<div
								key={d.key}
								style={{
									position: 'relative',
									width: 412,
									boxSizing: 'border-box',
									// the 20px side padding is what keeps the rails visible
									// beside the rungs — without it the rungs cover them and
									// the ladder reads as a plain list
									padding: '26px 20px 0',
									display: 'flex',
									flexDirection: 'column',
									justifyContent: 'flex-end',
									gap: 5,
								}}
							>
								<div style={{ ...railStyle, left: 5 }} />
								<div style={{ ...railStyle, right: 5 }} />

								{/* finial, in the column's reserved 26px of top padding */}
								<div
									style={{
										position: 'absolute',
										left: 0,
										right: 0,
										top: 4,
										zIndex: 4,
										display: 'flex',
										justifyContent: 'center',
									}}
								>
									<div
										style={{
											width: 11,
											height: 11,
											transform: 'rotate(45deg)',
											background: d.color,
											boxShadow: `0 0 14px ${d.color}`,
										}}
									/>
								</div>

								{/* rung 1 sits at the foot, the highest number at the top */}
								{d.list
									.map((w, i) => ({ w, n: i + 1 }))
									.reverse()
									.map(({ w, n }) => {
										const isDone = done.has(w.id);
										return (
											<button
												key={w.id}
												type="button"
												className="lr-rung"
												onClick={() => onSelect(w.id)}
												aria-label={`${w.title} — ${isDone ? 'complete' : 'open'}`}
												style={
													{
														'--edge': isDone ? `${green}99` : `${d.color}88`,
														'--edge-hover': isDone
															? `${green}dd`
															: `${d.color}cc`,
														'--inner': isDone ? `${green}26` : `${d.color}33`,
														'--inner-hover': isDone
															? `${green}44`
															: `${d.color}55`,
													} as React.CSSProperties
												}
											>
												<span
													style={{
														width: 34,
														alignSelf: 'stretch',
														flex: 'none',
														display: 'flex',
														alignItems: 'center',
														justifyContent: 'center',
														borderRight: `1px solid ${d.color}66`,
														background: `${d.color}22`,
														font: '600 12.5px Cinzel, serif',
														color: d.tint,
													}}
												>
													{n}
												</span>
												<span
													style={{
														flex: 1,
														font: '400 12.5px/1.2 Spectral, serif',
														color: theme.colors.ink,
														textWrap: 'pretty',
														overflow: 'hidden',
														maxHeight: 30,
													}}
												>
													{w.title}
												</span>
												{isDone ? (
													<span
														className="lr-check"
														style={{
															flex: 'none',
															display: 'flex',
															alignItems: 'center',
															justifyContent: 'center',
															width: 18,
															height: 18,
															borderRadius: '50%',
															background: '#2f7d4f33',
															border: `1px solid ${green}`,
															boxShadow: `0 0 10px ${green}55`,
														}}
													>
														<svg
															viewBox="0 0 20 20"
															width="12"
															height="12"
															style={{ display: 'block' }}
															aria-hidden="true"
														>
															<path
																d="M4,10.6 L8,14.4 L16,5.6"
																fill="none"
																stroke={green}
																strokeWidth="2.6"
																strokeLinecap="round"
																strokeLinejoin="round"
															/>
														</svg>
													</span>
												) : (
													<span className="lr-dot" />
												)}
											</button>
										);
									})}

								{/* district header plate, at the foot of the ladder */}
								<div
									style={{
										position: 'relative',
										zIndex: 2,
										marginTop: 12,
										height: 84,
										boxSizing: 'border-box',
										display: 'flex',
										alignItems: 'center',
										padding: '0 16px',
										background: theme.colors.bg,
										border: `2px solid ${d.color}`,
										boxShadow: `0 0 26px ${d.color}3d`,
									}}
								>
									<div
										style={{ display: 'flex', alignItems: 'center', gap: 12 }}
									>
										<div
											style={{
												width: 44,
												height: 44,
												flex: 'none',
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												border: `1px solid ${d.color}`,
												background: `${d.color}22`,
											}}
										>
											<SigilSvg district={d.key} color={d.tint} size={24} />
										</div>
										<div>
											<div
												style={{
													font: '600 14px Cinzel, serif',
													letterSpacing: '1.7px',
													color: theme.colors.ink,
												}}
											>
												{PLATE_NAME[d.key]}
											</div>
											<div
												style={{
													font: '400 13px Spectral, serif',
													color: theme.colors.inkMuted,
													marginTop: 3,
												}}
											>
												{d.nDone} of {d.list.length} complete
											</div>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>

					<div
						style={{
							position: 'absolute',
							left: 0,
							right: 0,
							bottom: 34,
							textAlign: 'center',
							font: 'italic 400 14px Spectral, serif',
							letterSpacing: '1.4px',
							color: '#7d6bab',
						}}
					>
						All rites unsealed — climb any rung, in any order
					</div>

					{/* Back to the title screen, in the strip below the ladder feet and
					    on the caption's baseline. Rendered AFTER the caption: that div
					    is full-width, so in DOM order before it, it would swallow the
					    button's clicks. */}
					<button
						type="button"
						className="lr-back"
						onClick={onExit}
						style={{ position: 'absolute', left: 56, bottom: 27 }}
					>
						<svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
							<path
								d="M10,2 L4,8 L10,14"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
						MAIN MENU
					</button>
				</div>
			</div>
		</div>
	);
}

const railStyle: React.CSSProperties = {
	position: 'absolute',
	top: 26,
	bottom: 96,
	width: 3,
	background: 'linear-gradient(180deg, #4a3d63, #372753)',
	opacity: 0.85,
};

/* The rung's own border/glow colours vary by district and state, so they come
   in as custom properties and the hover/focus states live here — otherwise an
   inline `boxShadow` would beat every rule in this block. `::before` pads the
   hit area 2px into the 5px gap above and below (2+2 < 5, so neighbours never
   overlap): the 30px rung box is small once the stage is scaled down. */
