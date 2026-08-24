import type { BuiltWorkflow, JobAidId, WorkflowId } from '../../game/types';
import { isUnlocked } from '../../game/engine';
import { useTheme } from '../../state/ThemeContext';

interface OverworldProps {
  workflows: BuiltWorkflow[];
  completed: WorkflowId[];
  onSelect: (id: WorkflowId) => void;
}

/**
 * Plain, unstyled entry scene — grouped by job aid (district), gated by
 * `isUnlocked()`. Map art comes later; this is routing and lock state only.
 */
export function Overworld({ workflows, completed, onSelect }: OverworldProps) {
  const theme = useTheme();

  const groups = new Map<JobAidId, BuiltWorkflow[]>();
  for (const workflow of workflows) {
    const group = groups.get(workflow.jobAid) ?? [];
    group.push(workflow);
    groups.set(workflow.jobAid, group);
  }

  return (
    <div>
      <h1>{theme.labels.overworld}</h1>
      {[...groups.entries()].map(([jobAidId, group]) => (
        <section key={jobAidId}>
          <h2>{theme.jobAids[jobAidId].name}</h2>
          <ul>
            {group.map((workflow) => {
              const done = completed.includes(workflow.id);
              const unlocked = isUnlocked(workflow.requires, completed);
              return (
                <li key={workflow.id}>
                  <button
                    type="button"
                    disabled={!unlocked}
                    onClick={() => onSelect(workflow.id)}
                  >
                    {workflow.title}
                    {done ? ' — learned' : unlocked ? '' : ' — sealed'}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
