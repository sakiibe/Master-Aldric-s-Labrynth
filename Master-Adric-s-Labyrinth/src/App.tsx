import { useCallback, useState } from 'react';
import { buildWorkflow } from './game/buildWorkflow';
import { workflows as workflowDefs } from './game/data';
import type { BuiltWorkflow, WorkflowId } from './game/types';
import { ThemeProvider, useTheme } from './state/ThemeContext';
import { getCompleted } from './state/storage';
import { useRun } from './state/useRun';
import { PatienceMeter } from './ui/components/PatienceMeter';
import { DeadEnd } from './ui/scenes/DeadEnd';
import { Junction } from './ui/scenes/Junction';
import { Overworld } from './ui/scenes/Overworld';
import './ui/styles/game.css';

const builtWorkflows: BuiltWorkflow[] = workflowDefs.map(buildWorkflow);
const workflowsById: Record<WorkflowId, BuiltWorkflow> = Object.fromEntries(
  builtWorkflows.map((w) => [w.id, w]),
);

type Scene = { name: 'overworld' } | { name: 'workflow'; id: WorkflowId };

interface WorkflowScreenProps {
  workflow: BuiltWorkflow;
  onReturnToOverworld: () => void;
}

function WorkflowScreen({ workflow, onReturnToOverworld }: WorkflowScreenProps) {
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
          <button type="button" onClick={onReturnToOverworld}>
            Return to {theme.labels.overworld}
          </button>
        </div>
      )}

      {run.status === 'complete' && (
        <div className="fallback-scene">
          <h1>{workflow.title} — complete</h1>
          <p>{run.taken.map((t) => t.label).join(' → ')}</p>
          <button type="button" onClick={onReturnToOverworld}>
            Return to {theme.labels.overworld}
          </button>
        </div>
      )}
    </>
  );
}

function Game() {
  const [scene, setScene] = useState<Scene>({ name: 'overworld' });
  const [completed, setCompleted] = useState<WorkflowId[]>(() => getCompleted());

  const returnToOverworld = useCallback(() => {
    setCompleted(getCompleted());
    setScene({ name: 'overworld' });
  }, []);

  if (scene.name === 'overworld') {
    return (
      <Overworld
        workflows={builtWorkflows}
        completed={completed}
        onSelect={(id) => setScene({ name: 'workflow', id })}
      />
    );
  }

  return (
    <WorkflowScreen
      workflow={workflowsById[scene.id]}
      onReturnToOverworld={returnToOverworld}
    />
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
