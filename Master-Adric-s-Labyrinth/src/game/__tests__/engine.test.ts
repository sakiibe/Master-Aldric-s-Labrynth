import { describe, expect, it } from 'vitest';
import { backtrack, choose, isUnlocked, progress, restart, useHint } from '../engine';
import { buildWorkflow } from '../buildWorkflow';
import type { WorkflowDef } from '../types';

function def(overrides: Partial<WorkflowDef> = {}): WorkflowDef {
  return {
    id: 'test-wf',
    title: 'Test',
    sector: 'bpmh',
    jobAid: 'bpmh',
    source: 'test',
    hints: 1,
    patience: 2,
    briefing: ['hello'],
    outro: ['bye'],
    steps: [
      {
        id: 's1',
        location: 'here',
        prompt: 'do the thing',
        rule: 'The aid says to do the right thing here.',
        correct: 'Right',
        wrong: [
          { label: 'Wrong A', rule: 'no', source: 'job-aid' },
          { label: 'Wrong B', rule: 'also no', source: 'job-aid' },
        ],
      },
      {
        id: 's2',
        location: 'there',
        prompt: 'finish',
        rule: 'The aid says to finish by clicking Done.',
        correct: [{ label: 'Done', next: null }],
        wrong: [
          { label: 'Wrong C', rule: 'no', source: 'job-aid' },
          { label: 'Wrong D', rule: 'no', source: 'job-aid' },
        ],
      },
    ],
    ...overrides,
  };
}

function correctDoorId(step: ReturnType<typeof buildWorkflow>['steps'][number]) {
  return step.doors.find((d) => d.kind === 'correct')!.id;
}

function wrongDoorId(step: ReturnType<typeof buildWorkflow>['steps'][number]) {
  return step.doors.find((d) => d.kind === 'wrong')!.id;
}

describe('restart', () => {
  it('starts on the entry step with full patience and hints, in briefing', () => {
    const wf = buildWorkflow(def());
    const run = restart(wf);
    expect(run.status).toBe('briefing');
    expect(run.stepId).toBe(wf.entryStepId);
    expect(run.visited).toEqual([wf.entryStepId]);
    expect(run.hintsRemaining).toBe(wf.hints);
    expect(run.patienceRemaining).toBe(wf.patience);
    expect(run.taken).toEqual([]);
    expect(run.wrongCount).toBe(0);
  });

  it('refills patience and hints after a failed run', () => {
    const wf = buildWorkflow(def({ patience: 1 }));
    let run = restart(wf);
    run = progress(run);
    const wrong = wrongDoorId(wf.byId[run.stepId]);
    run = choose(wf, run, wrong);
    expect(run.status).toBe('failed');
    expect(run.patienceRemaining).toBe(0);

    const fresh = restart(wf);
    expect(fresh.status).toBe('briefing');
    expect(fresh.patienceRemaining).toBe(wf.patience);
    expect(fresh.hintsRemaining).toBe(wf.hints);
  });
});

describe('progress', () => {
  it('moves briefing to junction', () => {
    const wf = buildWorkflow(def());
    const run = progress(restart(wf));
    expect(run.status).toBe('junction');
  });

  it('is a no-op once past briefing', () => {
    const wf = buildWorkflow(def());
    const junction = progress(restart(wf));
    expect(progress(junction)).toEqual(junction);
  });
});

describe('choose', () => {
  it('advances to the next step on a correct pick', () => {
    const wf = buildWorkflow(def());
    let run = progress(restart(wf));
    const step = wf.byId[run.stepId];
    const door = correctDoorId(step);
    run = choose(wf, run, door);
    expect(run.status).toBe('junction');
    expect(run.stepId).toBe('s2');
    expect(run.visited).toEqual(['s1', 's2']);
    expect(run.taken).toEqual([{ stepId: 's1', label: 'Right' }]);
  });

  it('completes the workflow on a terminal correct pick', () => {
    const wf = buildWorkflow(def());
    let run = progress(restart(wf));
    run = choose(wf, run, correctDoorId(wf.byId['s1']));
    run = choose(wf, run, correctDoorId(wf.byId['s2']));
    expect(run.status).toBe('complete');
    expect(run.taken).toEqual([
      { stepId: 's1', label: 'Right' },
      { stepId: 's2', label: 'Done' },
    ]);
  });

  it('does not change stepId on a wrong pick', () => {
    const wf = buildWorkflow(def());
    let run = progress(restart(wf));
    const wrong = wrongDoorId(wf.byId['s1']);
    run = choose(wf, run, wrong);
    expect(run.stepId).toBe('s1');
    expect(run.status).toBe('deadEnd');
  });

  it('populates deadEnd with the rule and decrements patience', () => {
    const wf = buildWorkflow(def());
    let run = progress(restart(wf));
    const step = wf.byId['s1'];
    const wrong = step.doors.find((d) => d.kind === 'wrong')!;
    run = choose(wf, run, wrong.id);
    expect(run.deadEnd).toEqual({
      stepId: 's1',
      doorId: wrong.id,
      label: wrong.label,
      rule: wrong.rule,
      source: wrong.source,
      sceneIndex: 0,
    });
    expect(run.patienceRemaining).toBe(1);
    expect(run.wrongCount).toBe(1);
    expect(run.wrongByStep).toEqual({ s1: 1 });
  });

  it('sets status failed when the wrong pick exhausts patience, but still shows the rule', () => {
    const wf = buildWorkflow(def({ patience: 1 }));
    let run = progress(restart(wf));
    const door = wf.byId['s1'].doors.find((d) => d.kind === 'wrong')!;
    run = choose(wf, run, door.id);
    expect(run.status).toBe('failed');
    expect(run.patienceRemaining).toBe(0);
    expect(run.deadEnd).toBeDefined();
    expect(run.deadEnd!.rule).toBe(door.rule);
  });

  it('rotates the dead-end scene cursor so consecutive wrong picks never repeat', () => {
    const wf = buildWorkflow(def({ patience: 5 }));
    let run = progress(restart(wf));
    const wrong = wrongDoorId(wf.byId['s1']);
    run = choose(wf, run, wrong);
    const first = run.deadEnd!.sceneIndex;
    run = backtrack(run);
    run = choose(wf, run, wrong);
    const second = run.deadEnd!.sceneIndex;
    expect(second).not.toBe(first);
  });
});

describe('backtrack', () => {
  it('returns to junction at the same step, clearing deadEnd', () => {
    const wf = buildWorkflow(def());
    let run = progress(restart(wf));
    run = choose(wf, run, wrongDoorId(wf.byId['s1']));
    run = backtrack(run);
    expect(run.status).toBe('junction');
    expect(run.stepId).toBe('s1');
    expect(run.deadEnd).toBeUndefined();
  });

  it('is free — does not touch patience or hints', () => {
    const wf = buildWorkflow(def());
    let run = progress(restart(wf));
    run = choose(wf, run, wrongDoorId(wf.byId['s1']));
    const patienceBefore = run.patienceRemaining;
    const hintsBefore = run.hintsRemaining;
    run = backtrack(run);
    expect(run.patienceRemaining).toBe(patienceBefore);
    expect(run.hintsRemaining).toBe(hintsBefore);
  });

  it('is a no-op outside deadEnd (a failed run cannot backtrack)', () => {
    const wf = buildWorkflow(def({ patience: 1 }));
    let run = progress(restart(wf));
    run = choose(wf, run, wrongDoorId(wf.byId['s1']));
    expect(run.status).toBe('failed');
    const before = run;
    run = backtrack(run);
    expect(run).toEqual(before);
  });
});

describe('isUnlocked', () => {
  it('is always true with no prerequisites', () => {
    expect(isUnlocked([], [])).toBe(true);
  });

  it('is false when a prerequisite is not yet completed', () => {
    expect(isUnlocked(['bpmh-document-med-hx'], [])).toBe(false);
  });

  it('is true once every prerequisite is completed', () => {
    expect(
      isUnlocked(['bpmh-document-med-hx'], ['bpmh-document-med-hx']),
    ).toBe(true);
  });

  it('is false when only some prerequisites are completed', () => {
    expect(isUnlocked(['a', 'b'], ['a'])).toBe(false);
  });
});

describe('useHint', () => {
  it('spends a hint and marks the step hinted', () => {
    const wf = buildWorkflow(def());
    let run = progress(restart(wf));
    run = useHint(run);
    expect(run.hintsRemaining).toBe(wf.hints - 1);
    expect(run.hintedSteps).toEqual(['s1']);
  });

  it('is idempotent — re-hinting an already-hinted step is free', () => {
    const wf = buildWorkflow(def());
    let run = progress(restart(wf));
    run = useHint(run);
    const afterFirst = run;
    run = useHint(run);
    expect(run).toEqual(afterFirst);
  });

  it('is a no-op once hints are exhausted', () => {
    const wf = buildWorkflow(def({ hints: 0 }));
    let run = progress(restart(wf));
    run = useHint(run);
    expect(run.hintsRemaining).toBe(0);
    expect(run.hintedSteps).toEqual([]);
  });

  it('survives a wrong pick and a backtrack', () => {
    const wf = buildWorkflow(def());
    let run = progress(restart(wf));
    run = useHint(run);
    run = choose(wf, run, wrongDoorId(wf.byId['s1']));
    expect(run.hintedSteps).toEqual(['s1']);
    run = backtrack(run);
    expect(run.hintedSteps).toEqual(['s1']);
  });
});
