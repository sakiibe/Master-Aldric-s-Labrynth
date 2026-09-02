import type { WorkflowDef } from '../types';

/**
 * Transcribed from: "CPOE - Powerchart" (NS Health / IWK Health, One Person
 * One Record), "Ordering a Prescription" — creating a new prescription that
 * was not previously ordered, pages 18-19.
 */
export const cpoeNewPrescription: WorkflowDef = {
	id: 'cpoe-new-prescription',
	title: 'Create a New Prescription',
	sector: 'order-entry',
	jobAid: 'cpoe',
	source: 'CPOE - Powerchart (pp. 18-19)',
	hints: 2,
	patience: 3,
	requires: ['cpoe-convert-to-prescription'],
	briefing: [
		'This one was never ordered within these walls at all — it must be written from nothing.',
		'When the ledger has no page for it, the Miscellaneous entries will hold your hand-written words.',
	],
	outro: [
		'A prescription conjured from nothing but a name and a dose. Prescribed, and sent on.',
	],
	steps: [
		{
			id: 'set-type-prescriptions',
			location: 'Add Order Search box',
			prompt:
				'This medication is not being ordered as an inpatient order — it needs to leave with the patient. Set the search accordingly.',
			aidRef: 'p.19 steps 1-2',
			rule: 'Click Add on the Orders or Medications List tab, then change the Type to Prescriptions.',
			correct: 'Type: Prescriptions',
			wrong: [
				{ label: 'Type: Inpatient' },
				{ label: 'Type: Document Medication by Hx' },
			],
		},
		{
			id: 'search-miscellaneous',
			location: 'Add Order Search box — Prescriptions',
			prompt:
				'The medication cannot be found by name. Find the free-text fallback.',
			aidRef: 'p.19 step 3',
			rule: 'If unable to find the medication, search "MISC" or "Miscellaneous" and select Miscellaneous Medication Rx, then click Done.',
			correct: 'Miscellaneous Medication Rx',
			wrong: [
				{ label: 'Miscellaneous Supply Rx' },
				{ label: 'Miscellaneous Health Equipment', needsReview: true },
			],
		},
		{
			id: 'freetext-prescription',
			location: 'Details for Miscellaneous Medication (SAP Drug)',
			prompt:
				'Enter the drug name, dose, route and frequency, and select where the prescription is sent.',
			aidRef: 'p.19 step 3',
			rule: 'Select the "Send To:" location for the prescription (e-fax or print; do not e-fax for discharge reconciliations), then free-text the Drug Name, dose, route, frequency, and remainder of the prescription information.',
			correct: 'Drug Name',
			wrong: [{ label: 'Samples' }, { label: 'No Sub' }],
		},
		{
			id: 'sign-new-prescription',
			location: 'Details for Miscellaneous Medication',
			prompt: 'The prescription is complete. Finalize it.',
			aidRef: 'p.19 step 3',
			rule: 'Click Sign when complete — the Status in the Medications List will become Prescribed.',
			correct: [{ label: 'Sign', next: null }],
			wrong: [
				{ label: 'Dispense From location' },
				{ label: 'Billing formula' },
			],
		},
	],
};
