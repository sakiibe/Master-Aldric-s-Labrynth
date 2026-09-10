import type { BuiltWorkflow, DeadEnd as DeadEndState } from '../../game/types';
import { useTheme } from '../../state/useTheme';
import { DialogueBox } from '../components/DialogueBox';
import { RoomBackdrop } from '../art/RoomBackdrop';
import { getDeadEndArt, getDeadEndPainting } from '../art/registry';

interface DeadEndProps {
	workflow: BuiltWorkflow;
	deadEnd: DeadEndState;
	onBacktrack: () => void;
}

/**
 * Hades-style: the painting fills the whole viewport and the dialogue box
 * floats over its bottom edge.
 *
 * The stage is a one-cell grid — painting and dialogue occupy the same cell,
 * the dialogue aligned to the bottom — so nothing needs a fixed aspect and
 * the art simply crops to whatever shape the window is. Below 640px the
 * dialogue would cover the painting entirely, so there the stage splits into
 * art-over-panel instead (see game.css).
 */
export function DeadEnd({ workflow, deadEnd, onBacktrack }: DeadEndProps) {
	const theme = useTheme();
	const scene =
		theme.deadEndScenes[deadEnd.sceneIndex % theme.deadEndScenes.length];
	const painting = getDeadEndPainting(scene.art);
	const citation = deadEnd.aidRef
		? `— ${workflow.source}, ${deadEnd.aidRef}`
		: `— ${workflow.source}`;

	return (
		<div className="dead-end-scene">
			{painting ? (
				<img
					className="dead-end-painting"
					src={painting.src}
					alt={painting.alt}
					style={{ objectPosition: painting.focus }}
					decoding="async"
				/>
			) : (
				<>
					<div className="scene-art scene-art--backdrop">
						<RoomBackdrop />
					</div>
					<div className="scene-art scene-art--character">
						{getDeadEndArt(scene.art)}
					</div>
				</>
			)}

			<DialogueBox speaker={theme.labels.mentor} line={scene.line}>
				<p className="dialogue-rule">{deadEnd.rule}</p>
				<p className="dialogue-citation">{citation}</p>
				<button type="button" className="dialogue-action" onClick={onBacktrack}>
					Back to the door, apprentice ⏎
				</button>
			</DialogueBox>
		</div>
	);
}
