import { useTheme } from '../../state/useTheme';

interface PatienceMeterProps {
	remaining: number;
	total: number;
}

export function PatienceMeter({ remaining, total }: PatienceMeterProps) {
	const theme = useTheme();
	const label =
		remaining === 1 ? theme.labels.patience : theme.labels.patiencePlural;

	return (
		<div className="patience-meter">
			<span>
				{theme.labels.mentor}'s {label}
			</span>
			<div className="patience-meter__pips">
				{Array.from({ length: total }, (_, i) => (
					<span
						key={i}
						className={`patience-meter__pip${i < remaining ? ' patience-meter__pip--full' : ''}`}
					/>
				))}
			</div>
		</div>
	);
}
