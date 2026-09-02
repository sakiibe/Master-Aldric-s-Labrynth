import { describe, expect, it } from 'vitest';
import { workflows } from '../data';
import { buildWorkflow, pendingReview } from '../buildWorkflow';

/**
 * Validates every authored workflow, not just the synthetic fixtures in
 * buildWorkflow.test.ts / engine.test.ts. A transcription mistake here
 * (unbalanced doors, an unreachable step, a wrong door missing its source)
 * should fail here, not surface as a mystery in the UI.
 */
describe('content: registered workflows', () => {
	it('every registered workflow builds without error', () => {
		for (const def of workflows) {
			expect(() => buildWorkflow(def), def.id).not.toThrow();
		}
	});

	it('every workflow id is unique', () => {
		const ids = workflows.map((w) => w.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('generates the SME sign-off queue', () => {
		const queue = workflows.flatMap((def) =>
			pendingReview(def).map((item) => ({ workflow: def.id, ...item })),
		);
		// Not asserted empty — real content has needsReview items until a
		// pharmacist signs off. This test exists so the queue is generated,
		// not hand-tracked; see CLAUDE.md "Content authoring rules".
		expect(Array.isArray(queue)).toBe(true);
	});
});
