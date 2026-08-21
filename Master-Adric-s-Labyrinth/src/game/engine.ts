/**
 * The game loop. Pure functions over `BuiltWorkflow` + `RunState` — no
 * React, no DOM, no `localStorage`, no `Date.now()`, no `Math.random()`.
 * Every transition returns a new `RunState`; nothing here mutates its input.
 */

import type { BuiltWorkflow, DeadEnd, DoorId, RunState } from './types';

/**
 * A fresh run of `workflow`, full patience and hints. Used both to start a
 * workflow for the first time and to reset one after a failed attempt — the
 * lost run is punishment enough, so a restart carries no penalty forward.
 */
export function restart(workflow: BuiltWorkflow): RunState {
  return {
    workflowId: workflow.id,
    status: 'briefing',
    stepId: workflow.entryStepId,
    visited: [workflow.entryStepId],
    taken: [],
    hintsRemaining: workflow.hints,
    hintedSteps: [],
    wrongCount: 0,
    wrongByStep: {},
    sceneCursor: 0,
    patienceRemaining: workflow.patience,
  };
}

/**
 * Leaves the briefing and enters the first junction. A no-op once the run
 * has moved past 'briefing', so it is always safe to call.
 */
export function progress(run: RunState): RunState {
  if (run.status !== 'briefing') return run;
  return { ...run, status: 'junction' };
}

/**
 * The player picks a door at the current junction.
 *
 * A correct pick advances `stepId` (or completes the workflow, if this was
 * the last step) and records the choice in `taken`. A wrong pick does NOT
 * change `stepId` — it sets `status: 'deadEnd'` (or `'failed'`, if this was
 * the last point of patience) and records the rule to show. Either way the
 * dead-end rule is populated so the player learns it, even on the pick that
 * ends the run.
 */
export function choose(
  workflow: BuiltWorkflow,
  run: RunState,
  doorId: DoorId,
): RunState {
  const step = workflow.byId[run.stepId];
  const door = step.doors.find((d) => d.id === doorId);
  if (!door) {
    throw new Error(`door "${doorId}" is not part of step "${run.stepId}"`);
  }

  if (door.kind === 'correct') {
    const taken = [...run.taken, { stepId: run.stepId, label: door.label }];
    if (door.next === null || door.next === undefined) {
      return { ...run, status: 'complete', taken };
    }
    return {
      ...run,
      status: 'junction',
      stepId: door.next,
      visited: [...run.visited, door.next],
      taken,
    };
  }

  const patienceRemaining = run.patienceRemaining - 1;
  const deadEnd: DeadEnd = {
    stepId: run.stepId,
    doorId: door.id,
    label: door.label,
    rule: door.rule!,
    source: door.source!,
    sceneIndex: run.sceneCursor,
  };
  return {
    ...run,
    status: patienceRemaining <= 0 ? 'failed' : 'deadEnd',
    deadEnd,
    wrongCount: run.wrongCount + 1,
    wrongByStep: {
      ...run.wrongByStep,
      [run.stepId]: (run.wrongByStep[run.stepId] ?? 0) + 1,
    },
    patienceRemaining,
    sceneCursor: run.sceneCursor + 1,
  };
}

/**
 * Returns to the junction after a dead end. Free and unlimited — there is
 * nothing to restore, since a wrong pick never moved `stepId`. A no-op
 * outside `'deadEnd'` (in particular, a `'failed'` run cannot backtrack —
 * it needs `restart()`).
 */
export function backtrack(run: RunState): RunState {
  if (run.status !== 'deadEnd') return run;
  return { ...run, status: 'junction', deadEnd: undefined };
}

/**
 * Spends a hint on the current step, making its correct door(s) glow.
 * Idempotent — re-hinting an already-hinted step costs nothing — and a
 * no-op once hints are exhausted. A spent hint survives a wrong pick and a
 * backtrack because it lives in `hintedSteps`, which neither touches.
 */
export function useHint(run: RunState): RunState {
  if (run.hintedSteps.includes(run.stepId)) return run;
  if (run.hintsRemaining <= 0) return run;
  return {
    ...run,
    hintsRemaining: run.hintsRemaining - 1,
    hintedSteps: [...run.hintedSteps, run.stepId],
  };
}
