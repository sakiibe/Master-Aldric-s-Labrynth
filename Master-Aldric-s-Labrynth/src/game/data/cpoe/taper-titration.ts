import type { WorkflowDef } from '../../types';

/**
 * Transcribed from: "CPOE - Powerchart" (NS Health / IWK Health, One Person
 * One Record), "Ordering a Taper or Titration in Powerchart", page 16.
 */
export const cpoeTaperTitration: WorkflowDef = {
	id: 'cpoe-taper-titration',
	title: 'Ordering a Taper or Titration',
	sector: 'order-entry',
	jobAid: 'cpoe',
	source: 'CPOE - Powerchart (p. 16)',
	hints: 2,
	patience: 3,
	requires: ['cpoe-therapeutic-substitution'],
	briefing: [
		'This dose does not stand still — it must climb, in measured steps, over many days.',
		'Cast the whole staircase at once, and the ledger will lay each step for you.',
	],
	outro: ['A full staircase of doses, each one waiting its turn.'],
	steps: [
		{
			id: 'open-taper-icon',
			location: 'Details for lamoTRIgine — new order',
			prompt:
				'This order needs to taper upward over time rather than start at a fixed dose. Open the taper tool.',
			aidRef: 'p.16 step 3',
			rule: 'Fill in the order details, then click the Taper icon. The Taper icon is only available for inpatient orders — for prescriptions, put taper/titrating instructions in the Special Instructions field instead.',
			correct: 'Taper icon',
			wrong: [
				{ label: 'Dosing Calculator' },
				{
					label: 'Special Instructions',
					rule: 'Special Instructions is where taper/titrating instructions go on a prescription — this is an inpatient order, so use the Taper icon instead.',
					source: 'job-aid',
					aidRef: 'p.16 step 3 note',
				},
			],
		},
		{
			id: 'calculate-taper-steps',
			location: 'Taper Window — lamoTRIgine',
			prompt:
				'The regimen increases by 25 mg every 14 days, from 25 mg to a final dose of 100 mg. Enter the details and generate the schedule.',
			aidRef: 'p.16 step 4',
			rule: 'Complete the details in the Taper Window (start dose, taper details, final dose) and click Calculate Steps.',
			correct: 'Calculate Steps',
			wrong: [{ label: 'Final dose' }, { label: 'Stop final dose after' }],
		},
		{
			id: 'review-planned-regimen',
			location: 'Taper Window — Planned regimen',
			prompt:
				'The schedule populated automatically, but one dose step needs to be removed. Adjust it.',
			aidRef: 'p.16 step 5',
			rule: 'The Planned regimen automatically populates — add or remove lines by clicking the (+) and (−) symbols as needed.',
			correct: '(−)',
			wrong: [{ label: '(+)' }, { label: 'Doses' }],
		},
		{
			id: 'sign-taper',
			location: 'Taper Window / Orders for Signature',
			prompt: 'The regimen is confirmed. Commit the taper order.',
			aidRef: 'p.16 step 6',
			rule: 'Click OK, then Sign the order.',
			correct: [{ label: 'Sign', next: null }],
			wrong: [{ label: 'Cancel', needsReview: true }, { label: 'Copy' }],
		},
	],
};
