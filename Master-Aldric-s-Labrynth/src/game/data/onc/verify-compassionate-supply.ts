import type { WorkflowDef } from '../../types';

/**
 * Transcribed from: "Oncology Pharmacist Verification" (NS Health / IWK
 * Health, One Person One Record), "Verifying Compassionate Supply" — 1st
 * Verification, page 17.
 *
 * Scope note: only the 1st verification is modelled in detail — the 2nd
 * verification repeats the shared Process -> Apply -> Action History OK ->
 * reselect the Compassionate supply IV set -> OK -> Submit shape already
 * taught in full in `onc-verify-iv-set`.
 */
export const oncVerifyCompassionateSupply: WorkflowDef = {
	id: 'onc-verify-compassionate-supply',
	title: 'Verifying Compassionate Supply',
	sector: 'verify-order',
	jobAid: 'oncology',
	source: 'Oncology Pharmacist Verification (p. 17)',
	hints: 2,
	patience: 3,
	requires: ['onc-verify-subcutaneous-syringe'],
	briefing: [
		'This reagent was never bought — it was given, outside the usual ledger. It still deserves the same care.',
	],
	outro: ['A gift, verified as carefully as anything paid for.'],
	steps: [
		{
			id: 'select-compassionate-iv-set',
			location: 'Manual Product Select — pembrolizumab',
			prompt:
				'This patient is receiving compassionate supply. Choose the matching IV set.',
			aidRef: 'p.17 step 4',
			rule: 'Manually select a Product or IV set, or click the Products tab to view all options — Compassionate Supply has its own IV sets with "compassionate supply" in the title.',
			correct: 'pembrolizumab (compassionate) 200 mg in NaCl 0.9% 50 mL',
			wrong: [
				{ label: 'pembrolizumab (compassionate) 400 mg in NaCl 0.9% 100 mL' },
				{ label: 'pembrolizumab _ mg in NaCl 0.9% 100 mL' },
			],
		},
		{
			id: 'verify-compassionate-ok',
			location: 'Manual Product Select / Verify window',
			prompt:
				'The compassionate supply IV set is selected. Finalize the verification.',
			aidRef: 'p.17 steps 5-6',
			rule: 'Verify the order with the Compassionate supply IV set selected, then click OK to Verify the order.',
			correct: [{ label: 'OK', next: 'submit-compassionate' }],
			wrong: [{ label: 'Reject' }, { label: 'Modify' }],
		},
		{
			id: 'submit-compassionate',
			location: 'Medication Manager',
			prompt: 'Complete the verification.',
			aidRef: 'p.17',
			rule: 'Click Submit in Medication Manager.',
			correct: 'Submit',
			wrong: [{ label: 'Cancel' }, { label: 'Apply' }],
		},
		{
			id: 'activate-compassionate',
			location: 'PowerChart — Systemic Therapy section',
			prompt: 'Send the order on to its second verification.',
			aidRef: 'p.17',
			rule: 'Navigate back to PowerChart and Activate the Days to prepare.',
			note: 'The 2nd verification repeats the shared Process → Apply → Action History OK → reselect the Compassionate supply IV set → OK → Submit pattern — see Verifying a Regular IV Set.',
			correct: [{ label: 'Activate', next: null }],
			wrong: [{ label: 'Renew' }, { label: 'Suspend' }],
		},
	],
};
