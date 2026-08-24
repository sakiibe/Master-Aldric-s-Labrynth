import { buildWorkflow } from './game/buildWorkflow';
import { documentMedByHx } from './game/data';
import { ThemeProvider, useTheme } from './state/ThemeContext';
import { useRun } from './state/useRun';
import { PatienceMeter } from './ui/components/PatienceMeter';
import { DeadEnd } from './ui/scenes/DeadEnd';
import { Junction } from './ui/scenes/Junction';
import './ui/styles/game.css';

// Hardcoded for Stage 2 — the Overworld will pick the workflow later.
const workflow = buildWorkflow(documentMedByHx);

function Game() {
  const theme = useTheme();
  const { run, choose, backtrack, useHint, restart } = useRun(workflow);

  return (
    <>
      <PatienceMeter remaining={run.patienceRemaining} total={workflow.patience} />

      {run.status === 'junction' && (
        <Junction
          step={workflow.byId[run.stepId]}
          hintedSteps={run.hintedSteps}
          hintsRemaining={run.hintsRemaining}
          taken={run.taken}
          onChoose={choose}
          onHint={useHint}
        />
      )}

      {run.status === 'deadEnd' && run.deadEnd && (
        <DeadEnd workflow={workflow} deadEnd={run.deadEnd} onBacktrack={backtrack} />
      )}

      {run.status === 'failed' && run.deadEnd && (
        <div className="fallback-scene">
          <h1>{theme.labels.mentor}'s {theme.labels.patience} is spent</h1>
          <p className="dialogue-rule">{run.deadEnd.rule}</p>
          <p>{theme.outOfPatienceLine}</p>
          <button type="button" onClick={restart}>
            Begin again
          </button>
        </div>
      )}

      {run.status === 'complete' && (
        <div className="fallback-scene">
          <h1>{workflow.title} — complete</h1>
          <p>{run.taken.map((t) => t.label).join(' → ')}</p>
          <button type="button" onClick={restart}>
            Play again
          </button>
        </div>
      )}
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Game />
    </ThemeProvider>
  );
}

export default App;
