import type { WorkflowDef } from '../types';

/**
 * Transcribed from: "Pharmacist Verification & Med Manager v.1" (NS Health /
 * IWK Health, One Person One Record), "Reprint a Label in Medication
 * Manager", pages 19-20.
 */
export const pvReprintLabel: WorkflowDef = {
	id: 'pv-reprint-label',
	title: 'Reprint a Label',
	sector: 'verify-order',
	jobAid: 'verification',
	source: 'Pharmacist Verification & Med Manager v.1 (pp. 19-20)',
	hints: 2,
	patience: 3,
	requires: ['pv-reschedule-order'],
	briefing: [
		'A label was lost or smudged. The dispense itself must not be repeated — only the parchment.',
	],
	outro: [
		'A fresh label, same dispense, same barcode. Nothing was duplicated.',
	],
	steps: [
		{
			id: 'select-history-action',
			location: 'Action column',
			prompt:
				'A label needs reprinting for this multivitamin order. Pick the right action — not the one that sounds obvious.',
			aidRef: 'p.19 step 2',
			rule: 'Click the Drop Down or right click the order and select the History action — not the Label action. The Label action should only be used to charge additional doses or label Patient’s Own Supply; using it creates a new dispense with a new barcode.',
			correct: 'History',
			wrong: [
				{
					label: 'Label',
					rule: 'The Label action should only be used to charge additional doses or label Patient’s Own Supply — using it creates a new dispense with a new barcode. Use History to reprint instead.',
					source: 'job-aid',
					aidRef: 'p.19-20',
				},
				{ label: 'Inquire' },
			],
		},
		{
			id: 'apply-history',
			location: 'Action bar',
			prompt: 'Begin.',
			aidRef: 'p.20 step 3',
			rule: 'Click Apply.',
			correct: 'Apply',
			wrong: [{ label: 'Submit' }, { label: 'Cancel' }],
		},
		{
			id: 'reprint-label-doses',
			location: 'History window — Initial Doses',
			prompt: 'Reprint the label for the dispensed dose.',
			aidRef: 'p.20 step 4',
			rule: 'Click on the Initial Doses and Reprint Label.',
			correct: 'Reprint Label',
			wrong: [{ label: 'View History' }, { label: 'Product' }],
		},
		{
			id: 'ok-label-window',
			location: 'Label Request window',
			prompt: 'Confirm the reprint request.',
			aidRef: 'p.20 step 5',
			rule: 'Click OK in the Label window.',
			correct: [{ label: 'OK', next: 'submit-reprint' }],
			wrong: [{ label: 'Cancel' }, { label: 'Close' }],
		},
		{
			id: 'submit-reprint',
			location: 'Medication Manager',
			prompt: 'Complete the reprint.',
			aidRef: 'p.20 step 6',
			rule: 'Click Submit in Medication Manager.',
			correct: [{ label: 'Submit', next: null }],
			wrong: [{ label: 'Cancel' }, { label: 'Apply' }],
		},
	],
};
