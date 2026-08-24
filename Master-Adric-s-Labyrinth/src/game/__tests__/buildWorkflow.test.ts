import { describe, expect, it } from 'vitest';
import { buildWorkflow, pendingReview, WorkflowBuildError } from '../buildWorkflow';
import type { WorkflowDef } from '../types';
import { documentMedByHx, admissionMedRec, workflows } from '../data';

function def(overrides: Partial<WorkflowDef> = {}): WorkflowDef {
  return {
    id: 'test-wf',
    title: 'Test',
    sector: 'bpmh',
    source: 'test',
    hints: 2,
    patience: 3,
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

describe('buildWorkflow', () => {
  it('expands a flat path into a linked tree', () => {
    const wf = buildWorkflow(def());
    expect(wf.entryStepId).toBe('s1');
    const s1 = wf.byId.s1;
    const correct = s1.doors.find((d) => d.kind === 'correct')!;
    expect(correct.next).toBe('s2');
    expect(wf.byId.s2.doors.find((d) => d.kind === 'correct')!.next).toBeNull();
  });

  it('gives every step exactly doorsPerJunction doors', () => {
    const wf = buildWorkflow(def());
    for (const s of wf.steps) expect(s.doors).toHaveLength(3);
  });

  it('orders doors deterministically across builds', () => {
    const a = buildWorkflow(def()).steps.map((s) => s.doors.map((d) => d.label));
    const b = buildWorkflow(def()).steps.map((s) => s.doors.map((d) => d.label));
    expect(a).toEqual(b);
  });

  it('does not always put the correct door in the same slot', () => {
    const positions = new Set(
      buildWorkflow(documentMedByHx).steps.map((s) =>
        s.doors.findIndex((d) => d.kind === 'correct'),
      ),
    );
    expect(positions.size).toBeGreaterThan(1);
  });

  it('supports several equally-correct doors', () => {
    const wf = buildWorkflow(documentMedByHx);
    const step = wf.byId['nav-med-list'];
    expect(step.correctDoorIds).toHaveLength(2);
    const labels = step.doors
      .filter((d) => d.kind === 'correct')
      .map((d) => d.label)
      .sort();
    expect(labels).toEqual(['Medication List', 'Orders']);
  });

  it('produces the recipe recap in click order', () => {
    expect(buildWorkflow(def()).recipe).toEqual(['Right', 'Done']);
  });

  it('rejects a step with the wrong number of doors', () => {
    const bad = def();
    bad.steps[0].wrong = [{ label: 'only one', rule: 'x', source: 'job-aid' }];
    expect(() => buildWorkflow(bad)).toThrow(WorkflowBuildError);
  });

  it('rejects duplicate step ids', () => {
    const bad = def();
    bad.steps[1].id = 's1';
    expect(() => buildWorkflow(bad)).toThrow(/duplicate step id/);
  });

  it('rejects a branch pointing at a step that does not exist', () => {
    const bad = def();
    bad.steps[0].correct = [{ label: 'Right', next: 'nowhere' }];
    expect(() => buildWorkflow(bad)).toThrow(/unknown step "nowhere"/);
  });

  it('treats the last step in the array as terminal without ceremony', () => {
    const implicit = def();
    implicit.steps[1].correct = 'Done';
    const wf = buildWorkflow(implicit);
    expect(wf.byId.s2.doors.find((d) => d.kind === 'correct')!.next).toBeNull();
  });

  it('rejects unreachable steps', () => {
    const bad = def();
    bad.steps[0].correct = [{ label: 'Right', next: null }];
    expect(() => buildWorkflow(bad)).toThrow(/unreachable/);
  });

  it('reports every problem at once', () => {
    const bad = def();
    bad.steps[1].id = 's1';
    bad.steps[0].wrong = [];
    try {
      buildWorkflow(bad);
      expect.unreachable();
    } catch (e) {
      expect((e as WorkflowBuildError).problems.length).toBeGreaterThan(1);
    }
  });
});

describe('authored content', () => {
  it('every shipped workflow builds', () => {
    for (const w of workflows) expect(() => buildWorkflow(w)).not.toThrow();
  });

  it('matches the job-aid click path for Document Medication by Hx', () => {
    expect(buildWorkflow(documentMedByHx).recipe).toEqual([
      'Medication List',
      'Document Medication by Hx',
      '+ Add',
      'Type: Document Medication by Hx',
      'sertraline 25 mg oral capsule (= 1 cap, PO, Daily)',
      'Done',
      'sertraline (sertraline 25 mg oral capsule)',
      'Compliance',
      'Document History',
      'Medication History',
      'Right click Meds History \u2192 Reset',
    ]);
  });

  it('gates admission reconciliation behind the medication history', () => {
    expect(buildWorkflow(admissionMedRec).requires).toEqual([
      'bpmh-document-med-hx',
    ]);
  });

  it('gives every wrong door a rule — its own, or the step\'s', () => {
    for (const w of workflows) {
      const built = buildWorkflow(w);
      for (const s of built.steps) {
        for (const door of s.doors) {
          if (door.kind !== 'wrong') continue;
          expect(door.rule!.length).toBeGreaterThan(10);
          expect(['job-aid', 'authored-needs-review']).toContain(door.source);
        }
      }
    }
  });

  it('falls back to the step rule when a door has none of its own', () => {
    const built = buildWorkflow(documentMedByHx);
    const step = built.byId['nav-med-list'];
    const door = step.doors.find((d) => d.kind === 'wrong')!;
    expect(door.rule).toBe(
      documentMedByHx.steps.find((s) => s.id === 'nav-med-list')!.rule,
    );
  });

  it('prefers a door\'s own rule where the aid gives one', () => {
    const built = buildWorkflow(documentMedByHx);
    const door = built.byId['add-home-med'].doors.find(
      (d) => d.label === 'No Known Home Medications',
    )!;
    expect(door.rule).toContain('as applicable');
  });

  it('rejects a per-door rule with no source', () => {
    const bad = def();
    bad.steps[0].wrong[0] = { label: 'Wrong A', rule: 'says a thing' };
    expect(() => buildWorkflow(bad)).toThrow(/no source/);
  });

  it('rejects a step with no rule', () => {
    const bad = def();
    bad.steps[0].rule = '';
    expect(() => buildWorkflow(bad)).toThrow(/positive rule/);
  });

  it('lists rules still needing SME review', () => {
    const pending = workflows.flatMap((w) => pendingReview(w));
    // Not an assertion about the count — this is the review queue.
    expect(Array.isArray(pending)).toBe(true);
  });
});
