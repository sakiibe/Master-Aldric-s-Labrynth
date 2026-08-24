import type { BuiltStep, DoorId, StepId, TakenStep } from '../../game/types';
import { useTheme } from '../../state/ThemeContext';
import { Door } from '../components/Door';
import { HintButton } from '../components/HintButton';
import { PathTrail } from '../components/PathTrail';
import { getJunctionArt } from '../art/registry';

interface JunctionProps {
  step: BuiltStep;
  hintedSteps: StepId[];
  hintsRemaining: number;
  taken: TakenStep[];
  onChoose: (doorId: DoorId) => void;
  onHint: () => void;
}

/**
 * Doors render in `step.doors` order — the seeded shuffle — NEVER
 * `correctDoorIds` order. `correctDoorIds` is authored order; rendering
 * doors in that order would put the correct door in the same slot on every
 * visit and leak the answer. `onChoose` is wired straight to `Door`'s click,
 * which the state layer resolves through `engine.choose()` — a correct pick
 * moves `run.stepId` to the next step, which re-renders this component for
 * the new room.
 */
export function Junction({
  step,
  hintedSteps,
  hintsRemaining,
  taken,
  onChoose,
  onHint,
}: JunctionProps) {
  const theme = useTheme();
  const hinted = hintedSteps.includes(step.id);
  const Art = getJunctionArt(theme.assets.junctionArt);

  return (
    <div className="junction-scene">
      <div className="scene-art scene-art--backdrop">
        <Art />
      </div>

      <div className="junction-header">
        <div className="junction-location">{step.location}</div>
        <h1 className="junction-prompt">{step.prompt}</h1>
      </div>

      <div className="doors">
        {step.doors.map((door, i) => (
          <Door
            key={door.id}
            door={door}
            glowing={hinted && door.kind === 'correct'}
            onSelect={onChoose}
            sigil={(i % 3) as 0 | 1 | 2}
          />
        ))}
      </div>

      <div className="hint-bar">
        <HintButton hintsRemaining={hintsRemaining} alreadyHinted={hinted} onUse={onHint} />
      </div>

      <PathTrail taken={taken} />
    </div>
  );
}
