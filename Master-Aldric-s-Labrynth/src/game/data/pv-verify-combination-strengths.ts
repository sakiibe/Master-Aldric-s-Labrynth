import type { WorkflowDef } from '../types';

/**
 * Transcribed from: "Pharmacist Verification & Med Manager v.1" (NS Health /
 * IWK Health, One Person One Record), "Verifying Combinations of Different
 * Strengths", pages 34-36.
 */
export const pvVerifyCombinationStrengths: WorkflowDef = {
	id: 'pv-verify-combination-strengths',
	title: 'Verifying Combinations of Different Strengths',
	sector: 'verify-order',
	jobAid: 'verification',
	source: 'Pharmacist Verification & Med Manager v.1 (pp. 34-36)',
	hints: 2,
	patience: 3,
	requires: ['pv-add-iv-set-powdered-vial'],
	briefing: [
		'One dose, two vessels of different measure — combining them on a single order looks tidy now, but tangles the ledger later. Split them instead.',
	],
	outro: [
		'Two orders, two strengths, one dose — and the ledger stays honest either way.',
	],
	steps: [
		{
			id: 'modify-dose-first-strength',
			location: 'New Med Order — lamoTRIgine',
			prompt:
				"A 125 mg dose doesn't divide evenly onto one strength. Rather than combine two products on one order, split it — start by fixing this order's dose to one strength.",
			aidRef: 'p.34 step 4',
			rule: 'Selecting two different products to make up one dose on Verification may cause issues on Discharge Medication Reconciliation — instead, enter two separate orders for two different strengths. Click Modify to change the Dose.',
			correct: 'Modify',
			wrong: [{ label: 'Remove' }, { label: 'Update' }],
		},
		{
			id: 'update-dose-to-25mg',
			location: 'New Med Order',
			prompt:
				'Change this order to the 25 mg tablet, one component of the combination.',
			aidRef: 'p.34',
			rule: 'Change the Dose to 25 mg and click Update.',
			correct: [{ label: 'Update', next: 'note-combination-comment-25' }],
			wrong: [{ label: 'Modify' }, { label: 'Remove' }],
		},
		{
			id: 'note-combination-comment-25',
			location: 'Order Comments',
			prompt: 'Document that this is only part of the intended total dose.',
			aidRef: 'p.34',
			rule: 'In the Order Comments, include "Along with \'x mg\' for a total dose of \'x mg\'" — e.g. "Along with 100 mg tablet for a total dose of 125 mg" — and click OK to verify.',
			correct: [{ label: 'Order Comments', next: 'add-second-strength-order' }],
			wrong: [{ label: 'Product notes' }, { label: 'Dispense category' }],
		},
		{
			id: 'add-second-strength-order',
			location: 'Medication Manager — Search',
			prompt: 'Now enter the second order, for the 100 mg tablet.',
			aidRef: 'p.35',
			rule: 'In Medication Manager, search for and enter lamotrigine 100 mg and click OK.',
			correct: 'lamoTRIgine 100 mg tablet',
			wrong: [
				{ label: 'lamoTRIgine 150 mg tablet' },
				{ label: 'lamoTRIgine 25 mg tablet' },
			],
		},
		{
			id: 'match-admin-time-and-comment',
			location: 'New Med Order — 100 mg order',
			prompt:
				'This order must line up with the 25 mg one, and carry its own note about the combination.',
			aidRef: 'p.35',
			rule: 'Complete the remainder of order details, including the Order Comments "Along with 25 mg tablet for a total dose of 125 mg" — ensure the start/administration time matches the 25 mg tablet, then click OK to verify.',
			correct: [{ label: 'Order comments', next: null }],
			wrong: [{ label: 'Start date' }, { label: 'Frequency' }],
		},
	],
};
