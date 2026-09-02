import type { BuiltWorkflow, DeadEnd as DeadEndState } from '../../game/types';
import { useTheme } from '../../state/useTheme';
import { DialogueBox } from '../components/DialogueBox';
import { RoomBackdrop } from '../art/RoomBackdrop';
import { getDeadEndArt } from '../art/registry';

interface DeadEndProps {
	workflow: BuiltWorkflow;
	deadEnd: DeadEndState;
	onBacktrack: () => void;
}

export function DeadEnd({ workflow, deadEnd, onBacktrack }: DeadEndProps) {
	const theme = useTheme();
	const scene =
		theme.deadEndScenes[deadEnd.sceneIndex % theme.deadEndScenes.length];
	const art = getDeadEndArt(scene.art);
	const citation = deadEnd.aidRef
		? `— ${workflow.source}, ${deadEnd.aidRef}`
		: `— ${workflow.source}`;

	return (
		<div className="dead-end-scene">
			<div className="scene-art scene-art--backdrop">
				<RoomBackdrop />
			</div>
			<div className="scene-art scene-art--character">{art}</div>

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
