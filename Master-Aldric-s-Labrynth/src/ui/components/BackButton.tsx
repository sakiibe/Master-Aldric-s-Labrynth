/**
 * A fixed bottom-left "back one step" button. Inside a workflow it returns to
 * the overworld; on the overworld it returns to the title screen. The caller
 * supplies the label, destination, and click sound.
 */
interface BackButtonProps {
	label: string;
	onClick: () => void;
}

export function BackButton({ label, onClick }: BackButtonProps) {
	return (
		<button type="button" className="back-button" onClick={onClick}>
			{label}
		</button>
	);
}
