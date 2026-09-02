import type { WorkflowDef } from '../types';

/**
 * Transcribed from: "Pharmacist Verification & Med Manager v.1" (NS Health /
 * IWK Health, One Person One Record), "Continuous vs Titratable Infusions"
 * — "Titratable Infusion", pages 40-43.
 *
 * The verification-side counterpart to `cpoe-convert-to-titratable` (the
 * ordering side). Pairs with `pv-verify-continuous-infusion`.
 */
export const pvVerifyTitratableInfusion: WorkflowDef = {
	id: 'pv-verify-titratable-infusion',
	title: 'Verifying a Titratable Infusion',
	sector: 'infusions',
	jobAid: 'verification',
	source: 'Pharmacist Verification & Med Manager v.1 (pp. 40-43)',
	hints: 3,
	patience: 4,
	requires: ['pv-verify-continuous-infusion'],
	briefing: [
		'This drip answers to the patient, not the clock — its rate climbs and falls as their blood pressure demands.',
	],
	outro: ['A responsive drip, verified with its bounds intact.'],
	steps: [
		{
			id: 'search-titratable-infusion',
			location: 'Orders/Medication List tab — Add Order',
			prompt:
				'This norepinephrine infusion needs to titrate to target blood pressure, not run at one fixed rate.',
			aidRef: 'p.40 steps 1-2',
			rule: 'Click Add and search the name of the titratable continuous infusion — select the infusion that has "titrate" in the name and click Done.',
			correct:
				'norepinephrine (central line) titratable infusion (240 mcg/mL) in NaCl 0.9% 250 mL',
			wrong: [
				{
					label:
						'norepinephrine PED cont 0.008 mg/mL (greater than 2kg to 20kg) in D5W 30mL',
					rule: 'NEO or PED IV sets are pediatric and neonatal only — adult orders will not have that naming. Select the adult titratable infusion instead.',
					source: 'job-aid',
					aidRef: 'p.38 step 2 note',
				},
				{
					label:
						'norepinephrine (resus) titratable infusion (16 mcg/mL) in NaCl 0.9% 250 mL',
				},
			],
		},
		{
			id: 'enter-infusion-instructions-titrate',
			location: 'Continuous Details — Rate',
			prompt:
				'The Rate field is already free-text "Titrate". Add any other infusion instructions in the box below it.',
			aidRef: 'p.41 step 3',
			rule: 'In the Continuous Details section, the Rate will default as "Titrate" — this is a free-text rate. Enter other infusion instructions in the free-text box below.',
			correct: 'Infusion instructions',
			wrong: [{ label: 'Rate' }, { label: 'Bag Volume' }],
		},
		{
			id: 'input-starting-dose-titrate',
			location: 'Details section',
			prompt:
				'The minimum, maximum, and titration instructions are pre-populated. Add only the starting dose, then finalize.',
			aidRef: 'p.41 step 4',
			rule: 'Review the pre-populated minimum and maximum dose and Titration Instructions, input a Starting Dose, and click Sign.',
			correct: [{ label: 'Sign', next: 'apply-verify-titrate' }],
			wrong: [
				{
					label: 'Minimum Dose',
					rule: 'Minimum Dose, Maximum Dose, and Titration Instructions are already pre-populated for a titratable order sentence — only the Starting Dose needs to be entered before signing.',
					source: 'job-aid',
					aidRef: 'p.41 step 4',
				},
				{ label: 'Titration Instructions' },
			],
		},
		{
			id: 'apply-verify-titrate',
			location: 'Medication Manager',
			prompt: 'Begin verifying the titratable infusion.',
			aidRef: 'p.42 step 5',
			rule: 'In Medication Manager, Apply the Verify action.',
			correct: 'Apply',
			wrong: [{ label: 'Submit' }, { label: 'Cancel' }],
		},
		{
			id: 'review-titration-comments',
			location: 'Verify Continuous Order — Comments',
			prompt:
				'The Rate field is greyed out with a free-text "Titrate". Check that the titration instructions themselves are appropriate before signing off.',
			aidRef: 'p.42 steps 6-7',
			rule: 'The Rate will be greyed out with a Freetext Rate of "Titrate" — titration instructions are in the Comments section. Click Comments and review the titration instructions to ensure they are appropriate, then click OK.',
			correct: 'Comments',
			wrong: [{ label: 'Product' }, { label: 'Order Type' }],
		},
		{
			id: 'ok-verify-titrate',
			location: 'Verify Continuous Order',
			prompt:
				'The titration instructions check out. Finalize the verification.',
			aidRef: 'p.43 step 8',
			rule: 'Click OK to Verify.',
			correct: [{ label: 'OK', next: 'submit-titrate' }],
			wrong: [{ label: 'Reject' }, { label: 'Cancel' }],
		},
		{
			id: 'submit-titrate',
			location: 'Medication Manager',
			prompt: 'Complete the verification.',
			aidRef: 'p.43 step 9',
			rule: 'Click Submit.',
			correct: [{ label: 'Submit', next: null }],
			wrong: [{ label: 'Cancel' }, { label: 'Apply' }],
		},
	],
};
