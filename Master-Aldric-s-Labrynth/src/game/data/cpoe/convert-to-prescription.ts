import type { WorkflowDef } from '../../types';

/**
 * Transcribed from: "CPOE - Powerchart" (NS Health / IWK Health, One Person
 * One Record), "Ordering a Prescription" — converting an already-ordered
 * medication, page 18.
 */
export const cpoeConvertToPrescription: WorkflowDef = {
	id: 'cpoe-convert-to-prescription',
	title: 'Convert an Order to a Prescription',
	sector: 'order-entry',
	jobAid: 'cpoe',
	source: 'CPOE - Powerchart (p. 18)',
	hints: 1,
	patience: 2,
	requires: ['cpoe-self-administered-meds'],
	briefing: [
		'The patient leaves these walls, but the medicine must follow them home.',
		'What was ordered within must now be written as something they can carry.',
	],
	outro: ['Converted, printed, sent along. The recipe travels with them now.'],
	steps: [
		{
			id: 'convert-to-prescription',
			location: 'Orders or Medication List tab',
			prompt:
				'This medication, already ordered inpatient, needs to go home with the patient as a prescription. Begin.',
			aidRef: 'p.18 step 1',
			rule: 'Right click the medication and click "Convert to Prescription".',
			correct: 'Convert to Prescription',
			wrong: [{ label: 'Renew' }, { label: 'Copy' }],
		},
		{
			id: 'choose-send-to',
			location: 'Details — Send To',
			prompt:
				'This is a discharge reconciliation, so the prescription must be printed rather than sent electronically.',
			aidRef: 'p.18 step 1',
			rule: 'Select the "Send To:" location for the prescription (e-fax to community pharmacy or print). Do not e-fax for discharge reconciliations.',
			correct: 'Print',
			wrong: [
				{
					label: 'Test QEII Pharmacy',
					rule: 'Do not e-fax a prescription for a discharge reconciliation — select Print instead.',
					source: 'job-aid',
					aidRef: 'p.18 step 1',
				},
				{ label: 'No Suit' },
			],
		},
		{
			id: 'sign-prescription',
			location: 'Details for diphenhydrAMINE',
			prompt: 'Quantity and refills are complete. Finalize the prescription.',
			aidRef: 'p.18 step 1',
			rule: 'Complete prescription details (quantity and refills) and Sign the order — the Status in the Medications List will become Prescribed.',
			correct: [{ label: 'Sign', next: null }],
			wrong: [
				{ label: 'Orders For Signature' },
				{ label: 'Orders For Nurse Review' },
			],
		},
	],
};
