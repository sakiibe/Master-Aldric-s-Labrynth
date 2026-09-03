import type { WorkflowDef } from '../../types';

/**
 * Transcribed from: "Pharmacist Verification & Med Manager v.1" (NS Health /
 * IWK Health, One Person One Record), "Modifying an Order", pages 7-8.
 *
 * Same underlying rule as `cpoe-modify-order` (Modify is only for
 * comments/notes/etc, never dose or frequency) enforced again here, but via
 * Medication Manager's Action dropdown instead of PowerChart's right-click
 * menu.
 */
export const pvModifyOrder: WorkflowDef = {
	id: 'pv-modify-order',
	title: 'Modifying an Order in Medication Manager',
	sector: 'verify-order',
	jobAid: 'verification',
	source: 'Pharmacist Verification & Med Manager v.1 (pp. 7-8)',
	hints: 2,
	patience: 3,
	requires: ['pv-add-order-medmanager'],
	briefing: [
		'A small clause needs a touch-up, nothing more — the dose and frequency stay exactly as cast.',
	],
	outro: ['Amended and signed. The recipe beneath it never changed.'],
	steps: [
		{
			id: 'select-modify-action',
			location: 'Action column dropdown',
			prompt:
				'This order needs an Order Comment added, nothing else. Select the right action.',
			aidRef: 'p.8 step 1',
			rule: 'Select the Modify action — only use Modify if changing/adding comments, notes, Initial Doses, Communication Type, Sequence, or Dispense Category. If changing frequency or dose, use Copy and Discontinue the original order instead.',
			correct: 'Modify',
			wrong: [
				{
					label: 'Copy',
					rule: 'Copy is for changing dose, route, frequency, or PRN — this order only needs an Order Comment, so Modify is correct here instead.',
					source: 'job-aid',
					aidRef: 'p.9',
				},
				{ label: 'Verify' },
			],
		},
		{
			id: 'apply-modify',
			location: 'Action bar',
			prompt: 'Begin the modification.',
			aidRef: 'p.8 step 2',
			rule: 'Click Apply.',
			correct: 'Apply',
			wrong: [{ label: 'Submit' }, { label: 'Cancel' }],
		},
		{
			id: 'update-order-comments-modify',
			location: 'Modify Med Order — Order comments',
			prompt: 'Document the new hold parameter.',
			aidRef: 'p.8 step 3',
			rule: 'In the Modify order window, update the Order comments. Do NOT change dose or frequency here — use the Copy action for that instead.',
			correct: 'Order comments',
			wrong: [
				{
					label: 'Frequency',
					rule: 'Do not change Dose or Frequency using Modify — use the Copy action and Discontinue the original order for those changes instead.',
					source: 'job-aid',
					aidRef: 'p.7',
				},
				{
					label: 'Dose',
					rule: 'Do not change Dose or Frequency using Modify — use the Copy action and Discontinue the original order for those changes instead.',
					source: 'job-aid',
					aidRef: 'p.7',
				},
			],
		},
		{
			id: 'ok-verify-modify',
			location: 'Modify Med Order',
			prompt: 'The comment is entered. Finalize it.',
			aidRef: 'p.8 step 4',
			rule: 'Click OK to Verify.',
			correct: [{ label: 'OK', next: 'submit-modify' }],
			wrong: [{ label: 'Cancel' }, { label: 'Remove' }],
		},
		{
			id: 'submit-modify',
			location: 'Medication Manager',
			prompt: 'Complete the modification.',
			aidRef: 'p.8 step 5',
			rule: 'Click Submit.',
			correct: [{ label: 'Submit', next: null }],
			wrong: [{ label: 'Cancel' }, { label: 'Apply' }],
		},
	],
};
