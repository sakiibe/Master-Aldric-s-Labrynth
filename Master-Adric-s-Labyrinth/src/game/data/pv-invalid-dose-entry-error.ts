import type { WorkflowDef } from '../types';

/**
 * Transcribed from: "Pharmacist Verification & Med Manager v.1" (NS Health /
 * IWK Health, One Person One Record), "Invalid Dose Entry Error in
 * Medication Manager", pages 50-51.
 */
export const pvInvalidDoseEntryError: WorkflowDef = {
	id: 'pv-invalid-dose-entry-error',
	title: 'Resolving an Invalid Dose Entry Error',
	sector: 'verify-order',
	jobAid: 'verification',
	source: 'Pharmacist Verification & Med Manager v.1 (pp. 50-51)',
	hints: 2,
	patience: 3,
	requires: ['pv-build-iv-set-medmanager'],
	briefing: [
		'The ledger balks — a measure too small in units that make no sense for it. Somewhere, grams were asked to be millilitres.',
	],
	outro: ['Units corrected, dose accepted. The ledger stops arguing.'],
	steps: [
		{
			id: 'acknowledge-invalid-dose-alert',
			location: 'Invalid Dose Entry alert',
			prompt:
				"An error appears on clicking OK — the dose's units don't work for this field. Acknowledge it first.",
			aidRef: 'p.51 step 1',
			rule: 'Click OK on the Alert. It indicates a strength less than 0.0001 or a volume less than 0.01 was entered or calculated — a larger value or different units are needed.',
			correct: [{ label: 'OK', next: 'modify-dose-units' }],
			wrong: [{ label: 'Cancel' }, { label: 'Reject' }],
		},
		{
			id: 'modify-dose-units',
			location: 'Verify Med Order — Dose',
			prompt:
				'This dextrose 50% order needs its dose expressed in mL, not g. Fix the units.',
			aidRef: 'p.51 step 2',
			rule: 'Review the Dose and units — this error can occur for inhalers (which default to "inh" but need "puff"); here, change "g" to "mL". Click Modify.',
			correct: 'Modify',
			wrong: [{ label: 'Remove' }, { label: 'Update' }],
		},
		{
			id: 'change-to-ml-and-update',
			location: 'Verify Med Order',
			prompt: 'Convert the 25 g dose to its equivalent 50 mL and commit it.',
			aidRef: 'p.51 step 3',
			rule: 'Change to "50 mL" (25 g = 50 mL) and click Update.',
			correct: [{ label: 'Update', next: 'ok-invalid-dose-fixed' }],
			wrong: [{ label: 'Modify' }, { label: 'Remove' }],
		},
		{
			id: 'ok-invalid-dose-fixed',
			location: 'Verify Med Order',
			prompt: 'The dose now reads correctly. Finalize the verification.',
			aidRef: 'p.51 step 4',
			rule: 'Click OK to accept the corrected dose.',
			correct: [{ label: 'OK', next: 'submit-invalid-dose-fix' }],
			wrong: [{ label: 'Reject' }, { label: 'Cancel' }],
		},
		{
			id: 'submit-invalid-dose-fix',
			location: 'Medication Manager',
			prompt: 'Complete the verification.',
			aidRef: 'p.51 step 5',
			rule: 'Click Submit.',
			correct: [{ label: 'Submit', next: null }],
			wrong: [{ label: 'Cancel' }, { label: 'Apply' }],
		},
	],
};
