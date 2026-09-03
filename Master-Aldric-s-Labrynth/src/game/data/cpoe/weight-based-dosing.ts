import type { WorkflowDef } from '../../types';

/**
 * Transcribed from: "CPOE - Powerchart" (NS Health / IWK Health, One Person
 * One Record), "Ordering Weight-Based Medications", pages 6-7.
 */
export const cpoeWeightBasedDosing: WorkflowDef = {
	id: 'cpoe-weight-based-dosing',
	title: 'Ordering Weight-Based Medications',
	sector: 'order-entry',
	jobAid: 'cpoe',
	source: 'CPOE - Powerchart (pp. 6-7)',
	hints: 2,
	patience: 3,
	requires: ['cpoe-cancel-reorder'],
	briefing: [
		'The measure here is not fixed — it must be weighed against the patient themself.',
		'A hand-set dose is a guess dressed as certainty. Let the scale speak instead.',
		'And when the patient changes, so must the measure — nothing here is cast once and forgotten.',
	],
	outro: [
		'Weighed, calculated, applied. The dose fits the patient, not the other way around.',
	],
	steps: [
		{
			id: 'open-dosing-calculator',
			location: 'Details for acetaminophen — new order',
			prompt:
				'Dosing for this order must be calculated from the patient’s weight. Avoid the plain Dose field — open the calculator instead.',
			aidRef: 'p.6 step 2',
			rule: 'Click on the Dosing Calculator. Avoid changing the Dose field directly — the Target dose will disappear if the dose in that field is changed.',
			correct: 'Dosing Calculator',
			wrong: [
				{
					label: 'Dose',
					rule: 'Avoid changing the Dose field directly when weight-based dosing — the Target dose will disappear. Use the Dosing Calculator instead.',
					source: 'job-aid',
					aidRef: 'p.6 step 2',
				},
				{ label: 'Frequency' },
			],
		},
		{
			id: 'apply-dose',
			location: 'Dosage Calculator — acetaminophen',
			prompt:
				'The Target, Calculated, and Final Dose are reviewed and the weight is correct. Commit the calculated dose to the order.',
			aidRef: 'p.7',
			rule: 'Review Target Dose, Calculated Dose, and Final Dose. Change the Final Dose if needed, verify the correct weight was used, and click Apply Dose.',
			correct: 'Apply Dose',
			wrong: [{ label: 'Apply Standard Dose' }, { label: 'Cancel' }],
		},
		{
			id: 'modify-for-new-weight',
			location: 'Orders or Medication List tab',
			prompt: 'The patient was reweighed and the dose needs updating. Begin.',
			aidRef: 'p.7',
			rule: 'In the Orders or Medication List tab, right click the medication and select Modify, then change the dose based on the new weight.',
			correct: 'Modify',
			wrong: [{ label: 'Renew' }, { label: 'Copy' }],
		},
		{
			id: 'weight-caution-update',
			location: 'Caution — weight change',
			prompt:
				'A new weight was charted that may affect this order’s calculations. Apply it.',
			aidRef: 'p.7',
			rule: 'When the Caution for weight changes appears on an IV infusion, click Update to recalculate the order with the new weight.',
			correct: [{ label: 'Update', next: null }],
			wrong: [
				{
					label: 'Keep Existing',
					rule: 'Keep Existing leaves the order on the old weight-based calculation — click Update to apply the new weight.',
					source: 'job-aid',
					aidRef: 'p.7',
				},
				{ label: 'Cancel', needsReview: true },
			],
		},
	],
};
