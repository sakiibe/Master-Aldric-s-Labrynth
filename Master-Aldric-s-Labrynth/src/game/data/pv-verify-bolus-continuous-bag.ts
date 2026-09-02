import type { WorkflowDef } from '../types';

/**
 * Transcribed from: "Pharmacist Verification & Med Manager v.1" (NS Health /
 * IWK Health, One Person One Record), "Verifying a Bolus off a Continuous
 * Bag", pages 43-45.
 */
export const pvVerifyBolusContinuousBag: WorkflowDef = {
	id: 'pv-verify-bolus-continuous-bag',
	title: 'Verifying a Bolus off a Continuous Bag',
	sector: 'infusions',
	jobAid: 'verification',
	source: 'Pharmacist Verification & Med Manager v.1 (pp. 43-45)',
	hints: 2,
	patience: 3,
	requires: ['pv-verify-titratable-infusion'],
	briefing: [
		'The drip runs on, unbothered — but a single extra measure is needed from the very same bag, right now.',
	],
	outro: [
		'One extra measure, drawn from the running drip, properly accounted for.',
	],
	steps: [
		{
			id: 'process-bolus-order',
			location: 'Pharmacy Patient Monitor',
			prompt:
				'A bolus is ordered off an already-running continuous infusion. Begin.',
			aidRef: 'p.43 step 1',
			rule: 'Navigate to Pharmacy Patient Monitor and click Process. If a bolus is ordered while a continuous infusion bag is already running, prescribers should enter a separate "Bolus" medication order.',
			correct: 'Process',
			wrong: [{ label: 'View' }, { label: 'Suspend' }],
		},
		{
			id: 'apply-verify-bolus-context',
			location: 'Medication Manager',
			prompt:
				'The continuous infusion itself (a titratable order) is also on this list — begin its verification too, reviewing its dose range in Comments.',
			aidRef: 'p.43 steps 2-3',
			rule: 'The Verify action will default — click Apply. The continuous infusion is titratable, with a Freetext rate of Titrate; click the Comments tab to view starting, minimum, and maximum dose, then click OK to verify it.',
			correct: 'Comments',
			wrong: [{ label: 'Product' }, { label: 'Order Type' }],
		},
		{
			id: 'select-bolus-product',
			location: 'Manual Product Select — norepinephrine bolus',
			prompt:
				'The bolus order displays as a separate Med order. Select its product.',
			aidRef: 'p.44 step 4',
			rule: 'The bolus order will display as a Med order. Select the product and click OK.',
			correct: [{ label: 'Move', next: 'confirm-bolus-order-type' }],
			wrong: [{ label: 'Select' }, { label: 'Reset' }],
		},
		{
			id: 'confirm-bolus-order-type',
			location: 'Verify Med Order',
			prompt:
				'If this defaulted to an Intermittent order instead of a Med order, fix that before verifying.',
			aidRef: 'p.44 step 5',
			rule: 'Click OK to verify the Med order. If it defaulted as an Intermittent order, click Order Type to change the Bolus to the Med order.',
			correct: [{ label: 'OK', next: null }],
			wrong: [
				{
					label: 'Order Type',
					rule: 'Order Type only needs changing if the bolus defaulted to an Intermittent order instead of a Med order — if it is already a Med order, click OK to verify directly.',
					source: 'job-aid',
					aidRef: 'p.44 step 5 note',
				},
				{ label: 'Reject' },
			],
		},
	],
};
