import type { WorkflowDef } from '../types';

/**
 * Transcribed from: "Pharmacist Verification & Med Manager v.1" (NS Health /
 * IWK Health, One Person One Record), "Other Verification Scenarios" —
 * "Patient Own Supply", pages 28-29.
 *
 * A third appearance of the same underlying concept: `bpmh-admission-med-rec`
 * covers it from reconciliation, `cpoe-patient-own-supply` from a fresh
 * order, and this is the Medication Manager verification side (a different
 * field: Dispense from location, rather than the Use Patient Supply toggle).
 */
export const pvPatientOwnSupplyMedManager: WorkflowDef = {
	id: 'pv-patient-own-supply-medmanager',
	title: 'Verifying a Patient Own Supply',
	sector: 'verify-order',
	jobAid: 'verification',
	source: 'Pharmacist Verification & Med Manager v.1 (pp. 28-29)',
	hints: 2,
	patience: 3,
	requires: ['pv-reject-for-reassessment'],
	briefing: [
		'The patient’s own vial arrives at your bench for verification, same as any other — but the ledger must know it costs nothing to dispense.',
	],
	outro: ['Verified, and no charge raised for what was already theirs.'],
	steps: [
		{
			id: 'process-own-supply-order',
			location: 'Pharmacy Patient Monitor',
			prompt: 'The patient brought their own citalopram. Begin verifying it.',
			aidRef: 'p.28 step 1',
			rule: 'In Pharmacy Patient Monitor, select the medication and click Process.',
			correct: 'Process',
			wrong: [{ label: 'View' }, { label: 'Suspend' }],
		},
		{
			id: 'apply-verify-own-supply',
			location: 'Medication Manager',
			prompt: 'Begin the verification.',
			aidRef: 'p.29 step 2',
			rule: 'Medication Manager automatically displays with the Verify action defaulted. Click Apply.',
			correct: 'Apply',
			wrong: [{ label: 'Submit' }, { label: 'Cancel' }],
		},
		{
			id: 'set-dispense-from-patients-own-med',
			location: 'Verify Med order',
			prompt:
				'The Patient’s own medication box is already checked. Make sure the dispense location reflects that too, so no charge is submitted for labelling.',
			aidRef: 'p.29 step 3',
			rule: 'In the Verify Med order screen, the Patient’s own medication box is selected. Change the Dispense from location to Patient’s Own Med — this ensures a charge is not submitted for labelling.',
			correct: 'Dispense from location',
			wrong: [{ label: 'Billing formula' }, { label: 'Dispense category' }],
		},
		{
			id: 'ok-verify-own-supply',
			location: 'Verify Med order',
			prompt: 'Finalize the verification.',
			aidRef: 'p.29 step 4',
			rule: 'Click OK to verify.',
			correct: [{ label: 'OK', next: 'submit-own-supply' }],
			wrong: [{ label: 'Reject' }, { label: 'Cancel' }],
		},
		{
			id: 'submit-own-supply',
			location: 'Medication Manager',
			prompt: 'Complete the verification.',
			aidRef: 'p.29 step 5',
			rule: 'Click Submit.',
			correct: [{ label: 'Submit', next: null }],
			wrong: [{ label: 'Cancel' }, { label: 'Apply' }],
		},
	],
};
