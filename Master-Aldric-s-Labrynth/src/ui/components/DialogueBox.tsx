import { type ReactNode } from 'react';

interface DialogueBoxProps {
	speaker: string;
	/** Aldric's spoken reaction. Rendered whole, the moment the scene opens. */
	line: string;
	/** Static content below the spoken line (rule, citation, action). */
	children?: ReactNode;
}

/**
 * Hades-style: the character fills the scene behind this box, so there is
 * no separate portrait thumbnail here — just the name and text, floated at
 * the bottom of the scene.
 *
 * The line used to reveal one character at a time on a timer. It doesn't any
 * more — the whole line is there on the first paint. The audience is staff
 * reading job-aid rules under time pressure, and a reveal makes fast readers
 * wait on an animation to learn something they could already have read.
 */
export function DialogueBox({ speaker, line, children }: DialogueBoxProps) {
	return (
		<div className="dialogue-box">
			<div className="dialogue-speaker">{speaker} —</div>
			<p className="dialogue-line">{line}</p>
			{children}
		</div>
	);
}
