import { useSound } from '../../sound/useSound';

/**
 * A fixed-corner speaker toggle for the music bed. Click mutes/unmutes the
 * music (sound effects are unaffected); the choice is the music volume at zero,
 * persisted by the sound layer, and stays in sync with the Settings music
 * slider. Icon is an inline SVG so it needs no asset.
 */
export function SoundControl() {
	const { muted, toggleMuted } = useSound();

	return (
		<button
			type="button"
			className="sound-control"
			onClick={toggleMuted}
			aria-pressed={muted}
			aria-label={muted ? 'Unmute music' : 'Mute music'}
			title={muted ? 'Unmute music' : 'Mute music'}
		>
			<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
				<path
					fill="currentColor"
					d="M4 9v6h4l5 5V4L8 9H4z"
				/>
				{muted ? (
					// A slash across the speaker when muted.
					<path
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						d="M16 8l5 8M21 8l-5 8"
					/>
				) : (
					// Sound waves when on.
					<path
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"
					/>
				)}
			</svg>
		</button>
	);
}
