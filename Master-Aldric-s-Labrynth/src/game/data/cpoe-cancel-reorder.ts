import type { WorkflowDef } from '../types';

/**
 * Transcribed from: "CPOE - Powerchart" (NS Health / IWK Health, One Person
 * One Record), "Cancel and Re-order in Powerchart", pages 5-6.
 */
export const cpoeCancelReorder: WorkflowDef = {
	id: 'cpoe-cancel-reorder',
	title: 'Cancel and Re-order',
	sector: 'order-entry',
	jobAid: 'cpoe',
	source: 'CPOE - Powerchart (pp. 5-6)',
	hints: 1,
	patience: 2,
	requires: ['cpoe-convert-to-titratable'],
	briefing: [
		'The dose itself must change — not a comment, not a rate. The dose.',
		'This calls for the whole recipe to be re-cast, not merely amended. Reach for the right ritual.',
	],
	outro: ['The old order fades; the new one takes its place, dose corrected.'],
	steps: [
		{
			id: 'right-click-cancel-reorder',
			location: 'Orders or Medication List tab',
			prompt:
				'The acetaminophen frequency needs to change to "q6h while awake". Begin.',
			aidRef: 'p.6 step 2',
			rule: 'Right click the medication and select Cancel and Reorder — use this function for any dose or frequency changes.',
			correct: 'Cancel and Reorder',
			wrong: [
				{
					label: 'Modify',
					rule: 'Modify is only for rate changes, Order Comments, or Special Instructions — do not use it to change Dose or Frequency. Use Cancel and Reorder instead.',
					source: 'job-aid',
					aidRef: 'p.3 step 3 note',
				},
				{ label: 'Renew' },
			],
		},
		{
			id: 'change-frequency-field',
			location: 'Cancel and Reorder — acetaminophen details',
			prompt: 'Update the frequency to the new value.',
			aidRef: 'p.6 step 3',
			rule: 'Change the relevant fields, including Dose, Route of administration, Frequency, Duration, or PRN as needed — the previous order automatically discontinues.',
			correct: 'Frequency',
			wrong: [{ label: 'Stop type' }, { label: 'RX Special Instructions' }],
		},
		{
			id: 'sign-cancel-reorder',
			location: 'Orders for Signature',
			prompt: 'The new order details are set. Finalize.',
			aidRef: 'p.6 step 4',
			rule: 'Click Orders for Signature then Sign.',
			correct: [{ label: 'Sign', next: null }],
			wrong: [
				{
					label: 'Cancel and Reorder',
					rule: 'Only use Cancel and Reorder again if the Order Entry Format stays the same — if changing formats or medication type (e.g. PO to injection), Cancel/Discontinue the original order and Add a new one instead. Here the details are already set — click Sign to finalize.',
					source: 'job-aid',
					aidRef: 'p.6 tip',
				},
				{ label: 'Void' },
			],
		},
	],
};
