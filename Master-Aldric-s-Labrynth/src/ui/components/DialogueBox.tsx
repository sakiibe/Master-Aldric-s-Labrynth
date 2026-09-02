import { useEffect, useState, type ReactNode } from 'react';
import { useTheme } from '../../state/useTheme';

/** Reveals `text` one character at a time. Resets whenever `text` changes. */
function useTypewriter(text: string, speedMs: number): string {
	const [shown, setShown] = useState(() => (speedMs <= 0 ? text : ''));
	const [prevText, setPrevText] = useState(text);

	// Reset the reveal when the line changes. Done during render — the
	// sanctioned "adjust state on prop change" pattern — rather than
	// synchronously in the effect, which triggers a cascading re-render
	// (react-hooks/set-state-in-effect).
	if (text !== prevText) {
		setPrevText(text);
		setShown(speedMs <= 0 ? text : '');
	}

	useEffect(() => {
		if (speedMs <= 0) return;
		let i = 0;
		const id = window.setInterval(() => {
			i += 1;
			setShown(text.slice(0, i));
			if (i >= text.length) window.clearInterval(id);
		}, speedMs);
		return () => window.clearInterval(id);
	}, [text, speedMs]);

	return shown;
}

interface DialogueBoxProps {
	speaker: string;
	/** Aldric's spoken reaction — typewriter-revealed. */
	line: string;
	/** Static content below the spoken line (rule, citation, action). */
	children?: ReactNode;
}

/**
 * Hades-style: the character fills the scene behind this box, so there is
 * no separate portrait thumbnail here — just the name and text, floated at
 * the bottom of the scene.
 */
export function DialogueBox({ speaker, line, children }: DialogueBoxProps) {
	const theme = useTheme();
	const shown = useTypewriter(line, theme.typewriterMs);

	return (
		<div className="dialogue-box">
			<div className="dialogue-speaker">{speaker} —</div>
			<p className="dialogue-line">{shown}</p>
			{children}
		</div>
	);
}
