import { useEffect, useState } from 'react';
import type { StoryBeat } from '../../game/types';
import { useTheme } from '../../state/useTheme';
import { useSound } from '../../sound/useSound';
import { DialogueBox } from '../components/DialogueBox';
import { getStoryPainting, preloadStoryPaintings } from '../art/registry';

interface StorySceneProps {
	/** The beats to play, in order. */
	beats: StoryBeat[];
	/** Label for the button that ends the scene, e.g. "Enter the tower". */
	finishLabel: string;
	onFinish: () => void;
}

/**
 * A cutscene: one full-screen painting with Aldric's line over it, advancing
 * a beat per click. Shares the dead-end scene's staging — the art is the
 * screen, the dialogue box floats at the bottom — so the story reads as the
 * same place as the game.
 *
 * The whole stage is the advance control, with the visible button as its
 * label. `Skip` jumps to the end for anyone who has read it before, since
 * the prologue plays on every entry to Story Mode.
 */
export function StoryScene({ beats, finishLabel, onFinish }: StorySceneProps) {
	const theme = useTheme();
	const { playSfx } = useSound();
	const [index, setIndex] = useState(0);

	const beat = beats[Math.min(index, beats.length - 1)];
	const painting = getStoryPainting(beat.art);
	const isLast = index >= beats.length - 1;

	// Fetch the scene's art up front — beats advance on a click with no
	// loading state, so a cold painting would flash an empty stage.
	useEffect(() => {
		preloadStoryPaintings(beats.map((b) => b.art));
	}, [beats]);

	const advance = () => {
		playSfx('click');
		if (isLast) onFinish();
		else setIndex((i) => i + 1);
	};

	const skip = () => {
		playSfx('click');
		onFinish();
	};

	// Enter/Space advance too, so the scene is playable from the keyboard.
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				advance();
			}
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});

	return (
		<div className="dead-end-scene story-scene">
			{painting && (
				<>
					{/* Fills the letterbox behind a `contain` painting with a
					    blown-up blur of itself, so the stage still reads full-bleed
					    rather than as bars. */}
					{painting.fit === 'contain' && (
						<div
							className="story-letterbox"
							style={{ backgroundImage: `url('${painting.src}')` }}
							aria-hidden="true"
						/>
					)}
					<img
						className={`dead-end-painting${painting.fit === 'contain' ? ' dead-end-painting--contain' : ''}`}
						src={painting.src}
						alt={painting.alt}
						style={{ objectPosition: painting.focus }}
						decoding="async"
					/>
				</>
			)}

			{/* Full-stage advance target, behind the dialogue box. */}
			<button
				type="button"
				className="story-advance"
				onClick={advance}
				aria-label={isLast ? finishLabel : 'Continue'}
			/>

			{!isLast && (
				<button type="button" className="story-skip" onClick={skip}>
					Skip ▸
				</button>
			)}

			<DialogueBox speaker={theme.labels.mentor} line={beat.line}>
				<div className="story-footer">
					<div
						className="story-progress"
						aria-label={`Beat ${index + 1} of ${beats.length}`}
					>
						{beats.map((b, i) => (
							<span
								key={`${b.art}-${i}`}
								className={`story-pip${i <= index ? ' story-pip--seen' : ''}`}
							/>
						))}
					</div>
					<button type="button" className="dialogue-action" onClick={advance}>
						{isLast ? `${finishLabel} ⏎` : 'Continue ⏎'}
					</button>
				</div>
			</DialogueBox>
		</div>
	);
}
