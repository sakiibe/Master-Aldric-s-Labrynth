import { useSound } from '../../sound/useSound';
import { useMotion } from '../../state/useMotion';

/**
 * The live Settings controls, rendered inside the title-screen Settings
 * overlay. Three preferences, each wired to its own state layer:
 *   - Reduce motion  -> useMotion (top-level data-reduce-motion switch)
 *   - Music volume   -> useSound  (master music gain)
 *   - Effects volume -> useSound  (master SFX gain)
 * All three persist through their respective storage modules, so a change here
 * survives a reload. Styling leans on the theme CSS vars set on .theme-root.
 */
export function SettingsPanel() {
	const {
		musicVolume,
		setMusicVolume,
		sfxVolume,
		setSfxVolume,
		playSfx,
	} = useSound();
	const { reduceMotion, setReduceMotion } = useMotion();

	return (
		<div style={wrapStyle}>
			{/* Reduce motion toggle */}
			<div style={rowStyle}>
				<label htmlFor="set-reduce-motion" style={labelStyle}>
					Reduce motion
					<span style={hintStyle}>Hold the ambient lightning, smoke, and embers still.</span>
				</label>
				<button
					id="set-reduce-motion"
					type="button"
					role="switch"
					aria-checked={reduceMotion}
					onClick={() => setReduceMotion(!reduceMotion)}
					style={switchStyle(reduceMotion)}
				>
					<span style={switchKnobStyle(reduceMotion)} />
				</button>
			</div>

			{/* Music volume */}
			<VolumeRow
				id="set-music-volume"
				label="Music volume"
				value={musicVolume}
				onChange={setMusicVolume}
			/>

			{/* Effects volume — a click SFX previews the new level on release. */}
			<VolumeRow
				id="set-sfx-volume"
				label="Effects volume"
				value={sfxVolume}
				onChange={setSfxVolume}
				onPreview={() => playSfx('click')}
			/>
		</div>
	);
}

interface VolumeRowProps {
	id: string;
	label: string;
	value: number;
	onChange: (value: number) => void;
	/** Optional cue fired when the player finishes dragging, to audition it. */
	onPreview?: () => void;
}

/** A labelled 0..100 slider bound to a 0..1 volume. */
function VolumeRow({ id, label, value, onChange, onPreview }: VolumeRowProps) {
	const pct = Math.round(value * 100);
	return (
		<div style={rowStyle}>
			<label htmlFor={id} style={labelStyle}>
				{label}
				<span style={hintStyle}>{pct}%</span>
			</label>
			<input
				id={id}
				type="range"
				min={0}
				max={100}
				value={pct}
				onChange={(e) => onChange(Number(e.target.value) / 100)}
				onPointerUp={onPreview}
				onKeyUp={onPreview}
				style={sliderStyle}
			/>
		</div>
	);
}

// ── Styles ────────────────────────────────────────────────────────────────

const wrapStyle: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	gap: 22,
	marginTop: 8,
};

const rowStyle: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	gap: 20,
};

const labelStyle: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	gap: 3,
	fontFamily: 'var(--font-ui)',
	fontSize: 15,
	color: 'var(--color-ink)',
};

const hintStyle: React.CSSProperties = {
	fontSize: 12,
	color: 'var(--color-ink-muted)',
};

const sliderStyle: React.CSSProperties = {
	flex: 'none',
	width: 160,
	accentColor: 'var(--color-accent)',
	cursor: 'pointer',
};

/** Pill track; tint shifts to the accent when on. */
function switchStyle(on: boolean): React.CSSProperties {
	return {
		flex: 'none',
		width: 46,
		height: 26,
		padding: 0,
		border: '1.5px solid var(--color-accent)',
		borderRadius: 999,
		background: on ? 'var(--color-accent)' : 'transparent',
		cursor: 'pointer',
		position: 'relative',
		transition: 'background 0.18s ease',
	};
}

/** Knob that slides between the two ends of the pill. */
function switchKnobStyle(on: boolean): React.CSSProperties {
	return {
		position: 'absolute',
		top: 2,
		left: on ? 22 : 2,
		width: 18,
		height: 18,
		borderRadius: '50%',
		background: on ? 'var(--color-bg)' : 'var(--color-accent)',
		transition: 'left 0.18s ease',
	};
}
