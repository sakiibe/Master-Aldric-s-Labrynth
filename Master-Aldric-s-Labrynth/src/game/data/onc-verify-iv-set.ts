import type { WorkflowDef } from '../types';

/**
 * Transcribed from: "Oncology Pharmacist Verification" (NS Health / IWK
 * Health, One Person One Record), "Verifying an IV set" — "Future Orders:
 * 1st Verification for a regular IV set" and "Activated Orders: 2nd
 * Verification for a regular IV set", pages 2-9.
 *
 * This is the foundational, most-detailed verification workflow — every
 * other product-type verification workflow in this job aid (syringe, total
 * volume set, infusor, subcutaneous syringe, compassionate supply) shares
 * this same Process -> Apply -> Verify -> Submit -> Activate shape and
 * refers back here for it rather than re-teaching it.
 */
export const oncVerifyIvSet: WorkflowDef = {
	id: 'onc-verify-iv-set',
	title: 'Verifying a Regular IV Set',
	sector: 'verify-order',
	jobAid: 'oncology',
	source: 'Oncology Pharmacist Verification (pp. 2-9)',
	hints: 4,
	patience: 6,
	requires: ['onc-clinical-verification'],
	briefing: [
		'A new brew waits, unproven, in the Future — it must pass your hand twice before it may touch the patient.',
		'Once before it wakes, and once after. Each time the same care: the vessel, the measure, the words on the label.',
		'This is the whole shape of the ritual. Learn it here, and the others will feel familiar.',
	],
	outro: [
		'Twice verified, twice signed. The brew may proceed to the patient.',
		'I begin to understand why you check things twice, apprentice.',
	],
	steps: [
		{
			id: 'process-future-order',
			location: 'Pharmacy Patient Monitor',
			prompt:
				'A new systemic therapy order sits in Future status, awaiting first verification. Begin.',
			aidRef: 'p.2 steps 1-4',
			rule: 'Navigate to Pharmacy Patient Monitor. Update settings for Future orders so only Future-status orders display, then click Process on the order.',
			correct: 'Process',
			wrong: [{ label: 'View' }, { label: 'Suspend' }],
		},
		{
			id: 'apply-verify-action',
			location: 'Medication Manager — Acute Profile',
			prompt:
				'Medication Manager already defaulted the action for you. Begin the verification.',
			aidRef: 'p.2 step 5, p.3 step 2',
			rule: 'Medication Manager will automatically display Verify as the default action — click Apply to begin.',
			correct: 'Apply',
			wrong: [{ label: 'Discontinue' }, { label: 'Void' }],
		},
		{
			id: 'select-facility-location',
			location: 'Future Order - Facility/Location Selection',
			prompt:
				'This is a Cutover migration, not a live clinical order. Select the correct facility and location.',
			aidRef: 'p.3 step 3, note',
			rule: 'Input the facility and location, then click Ok. For Cutover, select the Facility & Location as "Historical Migration".',
			correct: 'Historical Migration',
			wrong: [
				{ label: 'Queen Elizabeth II Health Sciences Centre' },
				{ label: 'VG Systemic Therapy 11 VIC' },
			],
		},
		{
			id: 'select-iv-set',
			location: 'Manual Product Select',
			prompt: 'Choose the prebuilt IV set matching this dose.',
			aidRef: 'p.4 step 4',
			rule: 'IV sets are prebuilt for different size solution bags with the dose ranges in the description — click the applicable IV set and click Select.',
			correct: 'DOCEtaxel _ mg in NaCl 0.9% 250 mL',
			wrong: [
				{ label: 'DOCEtaxel _ mg in NaCl 0.9% 50 mL' },
				{ label: 'DOCEtaxel _ mg in NaCl 0.9% 500 mL' },
			],
		},
		{
			id: 'confirm-selected-products',
			location: 'Manual Product Select — Selected products',
			prompt: 'The IV set is chosen. Bring it over and move on.',
			aidRef: 'p.4 step 5',
			rule: 'This brings the selection over to the Selected products box on the right-hand side. Click OK.',
			correct: [{ label: 'OK', next: 'complete-verify-window' }],
			wrong: [{ label: 'Move' }, { label: 'Reset' }],
		},
		{
			id: 'complete-verify-window',
			location: 'Verify Intermittent Protocol Order Day 1',
			prompt:
				'Dose, rate, infuse-over, dispense category and sequence are all confirmed — Sequence must read CHEMO. Finalize the verification.',
			aidRef: 'p.4 step 6',
			rule: 'Once all information is confirmed accurate — Sequence should always be CHEMO, Dispense Category "IV Intermittent Hazardous" — click OK at the bottom of the window.',
			correct: [{ label: 'OK', next: 'submit-medmanager' }],
			wrong: [{ label: 'Reject' }, { label: 'Modify' }],
		},
		{
			id: 'submit-medmanager',
			location: 'Medication Manager',
			prompt: 'Two arrows now mark the entry. Complete the step.',
			aidRef: 'p.6 step 7',
			rule: 'This brings you back to Medication Manager and displays two arrows on the entry — click the Submit button to complete this step.',
			correct: 'Submit',
			wrong: [{ label: 'Cancel' }, { label: 'Apply' }],
		},
		{
			id: 'activate-order',
			location: 'PowerChart — Systemic Therapy section, Orders tab',
			prompt:
				'The order still needs to flow to Pharmacy Patient Monitor for its second verification. Finish the first verification.',
			aidRef: 'p.6 step 8',
			rule: 'The final step to the 1st verification is to return to PowerChart and Activate the order — navigate back to the systemic therapy section within the Orders tab and click the word "Activate".',
			correct: 'Activate',
			wrong: [{ label: 'Renew' }, { label: 'Suspend' }],
		},
		{
			id: 'process-activated-order',
			location: 'Pharmacy Patient Monitor',
			prompt:
				'The order is now Active and needs its second verification. Begin.',
			aidRef: 'p.7 step 1',
			rule: 'Select the order requiring a 2nd verification in the customized PPM and click Process.',
			correct: 'Process',
			wrong: [{ label: 'View' }, { label: 'Suspend' }],
		},
		{
			id: 'apply-second-verify',
			location: 'Medication Manager',
			prompt: 'Begin the second verification.',
			aidRef: 'p.7 step 2',
			rule: 'Medication Manager auto-populates Verify in the action column — click Apply at the bottom of the profile to begin.',
			correct: 'Apply',
			wrong: [{ label: 'Discontinue' }, { label: 'Void' }],
		},
		{
			id: 'acknowledge-action-history',
			location: 'Action History window',
			prompt: 'Nothing here needs modifying or verifying. Move past it.',
			aidRef: 'p.8 step 3',
			rule: 'The Action History window has nothing to modify or verify on this screen — simply click the Ok button to proceed.',
			correct: [{ label: 'Ok', next: 'second-verify-ok' }],
			wrong: [{ label: 'Reject' }, { label: 'Cancel' }],
		},
		{
			id: 'second-verify-ok',
			location: 'Verify Intermittent Protocol Order Day 1',
			prompt:
				'All required information is reviewed for the second verification. Finalize it.',
			aidRef: 'p.8 step 4',
			rule: 'Once reviewing all required information, click the Ok button at the bottom — this will prompt a label to print.',
			correct: [{ label: 'Ok', next: 'submit-second-verify' }],
			wrong: [{ label: 'Reject' }, { label: 'Modify' }],
		},
		{
			id: 'submit-second-verify',
			location: 'Medication Manager',
			prompt: 'Complete the second verification.',
			aidRef: 'p.9 step 5',
			rule: 'This brings you back to the Medication Manager profile — click submit to complete your verification, generating a Label for preparation.',
			correct: [{ label: 'Submit', next: null }],
			wrong: [{ label: 'Cancel' }, { label: 'Apply' }],
		},
	],
};
