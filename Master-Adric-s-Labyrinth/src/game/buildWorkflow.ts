/**
 * buildWorkflow(def) — expands an authored WorkflowDef into the tree the
 * engine walks. Pure. No React, no DOM, no randomness beyond the seeded
 * shuffle in rng.ts.
 *
 * Authoring shortcuts this resolves:
 *   - `correct: 'Apply'`            -> single correct door, next = next step
 *   - `correct: [{...}, {...}]`     -> several equally-correct doors
 *   - omitted `next`                -> the following step in `steps[]`
 *   - `next: null`                  -> this pick completes the workflow
 *   - last step in the array         -> terminal, `next: null` optional
 *
 * Validation is strict and collects every problem before throwing, so a
 * transcription error surfaces as one readable list at test time rather than
 * as a mystery in the UI.
 */

import type {
  BuiltDoor,
  BuiltStep,
  BuiltWorkflow,
  CorrectChoice,
  StepDef,
  WorkflowDef,
} from './types';
import { hash, shuffle } from './rng';

export class WorkflowBuildError extends Error {
  readonly workflowId: string;
  readonly problems: string[];

  constructor(workflowId: string, problems: string[]) {
    super(
      `Workflow "${workflowId}" failed to build:\n  - ${problems.join('\n  - ')}`,
    );
    this.name = 'WorkflowBuildError';
    this.workflowId = workflowId;
    this.problems = problems;
  }
}

function normalizeCorrect(step: StepDef): CorrectChoice[] {
  return typeof step.correct === 'string'
    ? [{ label: step.correct, aidRef: step.aidRef }]
    : step.correct;
}

export function buildWorkflow(def: WorkflowDef): BuiltWorkflow {
  const problems: string[] = [];
  const doorsPerJunction = def.doorsPerJunction ?? 3;

  if (def.steps.length === 0) problems.push('has no steps');

  const seen = new Set<string>();
  for (const step of def.steps) {
    if (seen.has(step.id)) problems.push(`duplicate step id "${step.id}"`);
    seen.add(step.id);
  }

  const steps: BuiltStep[] = def.steps.map((step, i) => {
    const corrects = normalizeCorrect(step);
    const followingId: string | null = def.steps[i + 1]?.id ?? null;

    if (corrects.length === 0) {
      problems.push(`step "${step.id}" has no correct choice`);
    }
    if (step.wrong.length === 0) {
      problems.push(`step "${step.id}" has no wrong doors`);
    }
    if (!step.rule || step.rule.trim().length < 10) {
      problems.push(`step "${step.id}" needs a positive rule for its dead ends`);
    }
    for (const w of step.wrong) {
      if (w.rule && !w.source) {
        problems.push(
          `step "${step.id}" door "${w.label}" overrides the rule but has no source`,
        );
      }
    }

    const total = corrects.length + step.wrong.length;
    if (total !== doorsPerJunction) {
      problems.push(
        `step "${step.id}" has ${total} doors, expected ${doorsPerJunction}`,
      );
    }

    const labels = [...corrects, ...step.wrong].map((c) => c.label);
    const dupLabel = labels.find((l, j) => labels.indexOf(l) !== j);
    if (dupLabel) {
      problems.push(`step "${step.id}" has two doors labelled "${dupLabel}"`);
    }

    const correctDoors: BuiltDoor[] = corrects.map((c, j) => ({
      id: `${step.id}:c${j}`,
      label: c.label,
      kind: 'correct' as const,
      note: c.note,
      aidRef: c.aidRef ?? step.aidRef,
      // `undefined` means "not authored" -> fall through to the next step.
      // `null` means "authored as terminal".
      next: c.next === undefined ? followingId : c.next,
    }));

    // A wrong door with no rule of its own falls back to the step's rule.
    const wrongDoors: BuiltDoor[] = step.wrong.map((w, j) => ({
      id: `${step.id}:w${j}`,
      label: w.label,
      kind: 'wrong' as const,
      rule: w.rule ?? step.rule,
      source: w.rule ? (w.source ?? 'job-aid') : 'job-aid',
      aidRef: w.aidRef ?? step.aidRef,
    }));

    // Seeded on workflow + step, so the arrangement is stable forever but
    // isn't just "correct door is always first".
    const doors = shuffle(
      [...correctDoors, ...wrongDoors],
      hash(`${def.id}/${step.id}`),
    );

    return {
      id: step.id,
      index: i,
      location: step.location,
      prompt: step.prompt,
      note: step.note,
      screenshot: step.screenshot, // reserved; no viewer yet
      aidRef: step.aidRef,
      doors,
      // Authored order, deliberately — `correctDoorIds[0]` is the primary
      // path used for the recipe recap. Display order is `doors`.
      correctDoorIds: correctDoors.map((d) => d.id),
    };
  });

  const byId: Record<string, BuiltStep> = {};
  for (const s of steps) byId[s.id] = s;

  // Every authored `next` must point somewhere real.
  for (const s of steps) {
    for (const d of s.doors) {
      if (d.kind !== 'correct') continue;
      if (d.next !== null && d.next !== undefined && !byId[d.next]) {
        problems.push(
          `step "${s.id}" door "${d.label}" points at unknown step "${d.next}"`,
        );
      }
    }
  }

  // Unreachable steps are almost always a typo in a branch target.
  if (steps.length > 0) {
    const reachable = new Set<string>([steps[0].id]);
    const queue = [steps[0].id];
    while (queue.length) {
      const current = byId[queue.shift()!];
      for (const d of current.doors) {
        if (d.kind === 'correct' && d.next && byId[d.next] && !reachable.has(d.next)) {
          reachable.add(d.next);
          queue.push(d.next);
        }
      }
    }
    for (const s of steps) {
      if (!reachable.has(s.id)) problems.push(`step "${s.id}" is unreachable`);
    }
  }

  if (def.hints < 0) problems.push('hints must be >= 0');
  if (def.patience < 1) problems.push('patience must be >= 1');

  if (problems.length) throw new WorkflowBuildError(def.id, problems);

  return {
    id: def.id,
    title: def.title,
    sector: def.sector,
    source: def.source,
    hints: def.hints,
    patience: def.patience,
    doorsPerJunction,
    briefing: def.briefing,
    outro: def.outro,
    requires: def.requires ?? [],
    entryStepId: steps[0].id,
    steps,
    byId,
    recipe: primaryPath(steps[0].id, byId),
  };
}

/**
 * The click path taken by always choosing the first authored correct door.
 * Used for the Complete recap and for the job-aid diff in tests.
 */
function primaryPath(
  entryId: string,
  byId: Record<string, BuiltStep>,
): string[] {
  const path: string[] = [];
  let id: string | null = entryId;
  const guard = new Set<string>();
  while (id && byId[id] && !guard.has(id)) {
    guard.add(id);
    const step: BuiltStep = byId[id];
    const door = step.doors.find((d) => d.id === step.correctDoorIds[0])!;
    path.push(door.label);
    id = door.next ?? null;
  }
  return path;
}

/**
 * Everything still waiting on review: rules we wrote rather than transcribed,
 * and button labels we are not certain exist on that screen. Wire into a
 * content test so the queue is generated, not tracked by hand.
 */
export function pendingReview(def: WorkflowDef): {
  stepId: string;
  label: string;
  reason: 'rule' | 'label';
}[] {
  return def.steps.flatMap((s) =>
    s.wrong
      .filter((w) => w.needsReview || w.source === 'authored-needs-review')
      .map((w) => ({
        stepId: s.id,
        label: w.label,
        reason: (w.source === 'authored-needs-review' ? 'rule' : 'label') as
          | 'rule'
          | 'label',
      })),
  );
}
