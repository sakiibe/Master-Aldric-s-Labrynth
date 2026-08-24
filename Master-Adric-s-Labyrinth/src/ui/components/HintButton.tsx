import { useTheme } from '../../state/ThemeContext';

interface HintButtonProps {
  hintsRemaining: number;
  /** Already spent on the current step — spending again would be free but pointless. */
  alreadyHinted: boolean;
  onUse: () => void;
}

export function HintButton({ hintsRemaining, alreadyHinted, onUse }: HintButtonProps) {
  const theme = useTheme();
  const label = hintsRemaining === 1 ? theme.labels.hint : theme.labels.hintPlural;

  return (
    <button
      type="button"
      className="hint-button"
      disabled={alreadyHinted || hintsRemaining <= 0}
      onClick={onUse}
    >
      {alreadyHinted ? 'Hint spent here' : `Use a hint (${hintsRemaining} ${label} left)`}
    </button>
  );
}
