import type { WorkflowDef } from '../types';

/**
 * Transcribed from: "Pharmacist Verification & Med Manager v.1" (NS Health /
 * IWK Health, One Person One Record), "Changing a Frequency", pages 13-16.
 *
 * Two scenarios given equal billing in the job aid (q8h-int vs. Once
 * unscheduled) are modelled as a genuine branch, converging back on the
 * shared confirm/verify/submit steps.
 */
export const pvChangeFrequency: WorkflowDef = {
	id: 'pv-change-frequency',
	title: 'Changing a Frequency',
	sector: 'verify-order',
	jobAid: 'verification',
	source: 'Pharmacist Verification & Med Manager v.1 (pp. 13-16)',
	hints: 2,
	patience: 4,
	requires: ['pv-change-order-type'],
	briefing: [
		'Every rhythm has its own clock — most follow the standard chimes, but some must follow the moment they were cast instead.',
	],
	outro: ['The rhythm now matches the order, not just the wall clock.'],
	steps: [
		{
			id: 'choose-frequency-scenario',
			location: 'New Intermittent Order / New Med Order — Frequency',
			prompt:
				'Frequencies are tied to Standard Medication Administration Times (SMAT). Two very different situations call for changing them.',
			aidRef: 'pp.13-16',
			rule: 'Frequencies are associated with Standard Medication Administration Times (SMAT) — see Compass for the full chart. An "-int" frequency calculates times from the order start time instead of the SMAT; "Once unscheduled" prevents a Once order from tasking nursing as overdue.',
			correct: [
				{
					label: 'q8h-int',
					note: 'Scenario 1: an interval frequency calculated from the order start time.',
					next: 'set-q8h-int',
				},
				{
					label: 'Once unscheduled',
					note: 'Scenario 2: a Once order with no defined stop date/time.',
					next: 'set-once-unscheduled',
				},
			],
			wrong: [{ label: 'Custom' }],
		},
		{
			id: 'set-q8h-int',
			location: 'New Intermittent Order — Frequency',
			prompt:
				'This cefazolin order needs its task times calculated from the order start time, not the standard q8h clock.',
			aidRef: 'p.14 step 2',
			rule: 'Change the frequency to q8h-int. This enables task/dose times to be calculated from the order start time, rounded to the next full hour. Level-dependent medications (e.g. vancomycin, gentamycin) have pre-populated "-int" frequencies.',
			correct: [{ label: 'q8h-int', next: 'confirm-initial-doses' }],
			wrong: [{ label: 'q8h' }, { label: 'q6h-int' }],
		},
		{
			id: 'set-once-unscheduled',
			location: 'New Med Order — Frequency',
			prompt:
				'This HYDROmorphone order should not display or task nursing as "overdue".',
			aidRef: 'p.16 step 2',
			rule: 'Change frequency to "Once unscheduled" to ensure the order will not display or task nursing as overdue.',
			correct: [{ label: 'Once unscheduled', next: 'confirm-initial-doses' }],
			wrong: [{ label: 'Once' }, { label: 'Once, PRN' }],
		},
		{
			id: 'confirm-initial-doses',
			location: 'New Med/Intermittent Order',
			prompt: 'Confirm the dispensing details before signing off.',
			aidRef: 'p.15 step 3',
			rule: 'Ensure initial doses and Dispense from location are correct. Do not change Dispense from Location — if in Pyxis, it will display as "ADC".',
			correct: 'Initial doses',
			wrong: [
				{
					label: 'Dispense from location',
					rule: 'Do not change Dispense from Location — if in Pyxis, it will display as "ADC". Confirm it, don’t edit it.',
					source: 'job-aid',
					aidRef: 'p.15',
				},
				{ label: 'Duration' },
			],
		},
		{
			id: 'ok-frequency-change',
			location: 'Verify window',
			prompt: 'Everything is confirmed. Finalize it.',
			aidRef: 'p.15 step 4',
			rule: 'Click OK to verify.',
			correct: [{ label: 'OK', next: 'submit-frequency-change' }],
			wrong: [{ label: 'Reject' }, { label: 'Cancel' }],
		},
		{
			id: 'submit-frequency-change',
			location: 'Medication Manager',
			prompt: 'Complete the verification.',
			aidRef: 'p.15 step 5',
			rule: 'Click Submit.',
			correct: [{ label: 'Submit', next: null }],
			wrong: [{ label: 'Cancel' }, { label: 'Apply' }],
		},
	],
};
