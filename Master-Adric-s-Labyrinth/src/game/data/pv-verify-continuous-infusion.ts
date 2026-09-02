import type { WorkflowDef } from '../types';

/**
 * Transcribed from: "Pharmacist Verification & Med Manager v.1" (NS Health /
 * IWK Health, One Person One Record), "Continuous vs Titratable Infusions"
 * — "Continuous Infusion", pages 38-40.
 *
 * The verification-side counterpart to `cpoe-modify-infusion-rate` (the
 * ordering side of a plain continuous infusion). Pairs with
 * `pv-verify-titratable-infusion` — the job aid's whole point here is
 * distinguishing the two.
 */
export const pvVerifyContinuousInfusion: WorkflowDef = {
	id: 'pv-verify-continuous-infusion',
	title: 'Verifying a Continuous Infusion',
	sector: 'infusions',
	jobAid: 'verification',
	source: 'Pharmacist Verification & Med Manager v.1 (pp. 38-40)',
	hints: 2,
	patience: 4,
	requires: ['pv-verify-powerplan'],
	briefing: [
		'A drip that never wavers, running at one fixed rate until told otherwise. Simple, but no less deserving of your eye.',
	],
	outro: ['A steady drip, verified at its one true rate.'],
	steps: [
		{
			id: 'search-continuous-infusion',
			location: 'Orders/Medication List tab — Add Order',
			prompt:
				'A vasopressin continuous infusion is needed — not the titratable version.',
			aidRef: 'p.38 steps 1-2',
			rule: 'Click the Orders or Medication list tab, click Add, and search the name of the continuous infusion. A plain continuous infusion will not have "titrate" in the name. NEO or PED IV sets are pediatric/neonatal only and should be flexed to the IWK — adult IVs will not say "ADULT".',
			correct:
				'vasopressin continuous infusion (0.4 units/mL) in NaCl 0.9% 50 mL syringe (preferred)',
			wrong: [
				{
					label:
						'vasopressin NEO cont 0.16 units/mL (less than or equal to 3 kg) in NaCl 0.9% 20 mL',
					rule: 'NEO or PED IV sets are pediatric and neonatal only — adult orders will not have that naming. Select the adult continuous infusion instead.',
					source: 'job-aid',
					aidRef: 'p.38 step 2 note',
				},
				{
					label:
						'vasopressin PED Diabetes Insipidus cont 0.16 units/mL in NaCl 0.9% 100 mL',
					rule: 'NEO or PED IV sets are pediatric and neonatal only — adult orders will not have that naming. Select the adult continuous infusion instead.',
					source: 'job-aid',
					aidRef: 'p.38 step 2 note',
				},
			],
		},
		{
			id: 'sign-continuous-details',
			location: 'Continuous Details / Details tab',
			prompt:
				'There are no starting, min/max or titration fields to fill here — this is a fixed continuous rate. Finalize the order.',
			aidRef: 'p.39 step 4',
			rule: 'A continuous infusion’s Details section has no starting, min/max, or Titration instructions to complete — click Sign when complete. Inputting a duration will discontinue the infusion when that duration is met from the time the order is signed, not from when the bag is hung.',
			correct: [{ label: 'Sign', next: 'apply-verify-continuous' }],
			wrong: [
				{
					label: 'Duration',
					rule: 'A duration here discontinues the infusion once met, counted from when the order is signed — not from when the bag is hung. There is nothing else to complete on this screen; click Sign.',
					source: 'job-aid',
					aidRef: 'p.39 step 4 note',
				},
				{ label: 'Starting Dose' },
			],
		},
		{
			id: 'apply-verify-continuous',
			location: 'Medication Manager',
			prompt: 'Begin verifying the continuous infusion.',
			aidRef: 'p.39 step 5',
			rule: 'In Medication Manager, Apply the Verify action.',
			correct: 'Apply',
			wrong: [{ label: 'Submit' }, { label: 'Cancel' }],
		},
		{
			id: 'confirm-infuse-over-replace-every',
			location: 'Verify Continuous Order',
			prompt:
				'The Infusion Instructions became the Order Comments. Find the field that tells you when the bag will actually run out.',
			aidRef: 'p.39 step 6',
			rule: 'The Infusion Instructions populate in the Order Comments. The "Infuse Over" time appears as the "Replace every" field — that is when the bag or syringe will run out.',
			correct: 'Replace every',
			wrong: [{ label: 'Rate' }, { label: 'Normalized Rate' }],
		},
		{
			id: 'ok-verify-continuous',
			location: 'Verify Continuous Order',
			prompt: 'Everything checks out. Finalize the verification.',
			aidRef: 'p.39-40',
			rule: 'Click OK to Verify.',
			correct: [{ label: 'OK', next: 'submit-continuous' }],
			wrong: [{ label: 'Reject' }, { label: 'Cancel' }],
		},
		{
			id: 'submit-continuous',
			location: 'Medication Manager',
			prompt: 'Complete the verification.',
			aidRef: 'p.40 step 7',
			rule: 'Click Submit.',
			correct: [{ label: 'Submit', next: null }],
			wrong: [{ label: 'Cancel' }, { label: 'Apply' }],
		},
	],
};
