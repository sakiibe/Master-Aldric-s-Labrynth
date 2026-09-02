import type { WorkflowDef } from '../types';

/**
 * Transcribed from: "CPOE - Powerchart" (NS Health / IWK Health, One Person
 * One Record), "Ordering a Template Non-Formulary in Powerchart", pages 8-9.
 *
 * `bpmh-document-med-hx` only mentions this in passing, as a `note` on its
 * `select-order-sentence` step ("If a medication cannot be found... it can
 * be free-texted"). This is the first time it is built into a real junction.
 */
export const cpoeTemplateNonFormulary: WorkflowDef = {
	id: 'cpoe-template-non-formulary',
	title: 'Ordering a Template Non-Formulary',
	sector: 'order-entry',
	jobAid: 'cpoe',
	source: 'CPOE - Powerchart (pp. 8-9)',
	hints: 2,
	patience: 3,
	requires: ['cpoe-patient-own-supply'],
	briefing: [
		'No shelf holds this reagent. It exists nowhere in our stores, and yet the prescriber wants it written down.',
		'When the ledger has no entry, you write your own — carefully, and in plain words.',
		'Know too: what is written this way cannot be checked against anything else. The care is yours alone.',
	],
	outro: ['A name and a dose, written by hand. The ledger accepts it.'],
	steps: [
		{
			id: 'search-template-non-form',
			location: 'Add Order Search box',
			prompt:
				'The medication cannot be found as a standard order. Search for the free-text alternative.',
			aidRef: 'p.8 steps 1-2',
			rule: 'Click Add, then search "Template Non-Form" in the search bar.',
			correct: 'Template Non-Form',
			wrong: [{ label: 'acetaminophen' }, { label: 'Type: Prescriptions' }],
		},
		{
			id: 'select-template-type',
			location: 'Search results — Template Non-Form',
			prompt:
				'This is a one-time (not continuous or intermittent) free-text medication order. Select the matching entry.',
			aidRef: 'p.8 step 3',
			rule: 'Select the appropriate order and click Done.',
			correct: 'template non-formulary (medication)',
			wrong: [
				{ label: 'template non-formulary (continuous)' },
				{ label: 'template non-formulary (intermittent)' },
			],
		},
		{
			id: 'freetext-details',
			location: 'Details for template non-formulary (medication)',
			prompt: 'Enter the medication name and dose the prescriber ordered.',
			aidRef: 'p.8 step 4, note',
			rule: 'Free-text the medication name and dose. Select route and add other pertinent information — template non-formulary medications should often be marked "Patient Own Supply".',
			correct: 'Drug Name',
			wrong: [{ label: 'Research Account' }, { label: 'Stop type' }],
		},
		{
			id: 'sign-template',
			location: 'Orders for Signature',
			prompt: 'The free-text order is complete. Finalize it.',
			aidRef: 'p.9 step 5',
			rule: 'Click Sign.',
			correct: 'Sign',
			wrong: [{ label: 'Void' }, { label: 'Suspend' }],
		},
		{
			id: 'acknowledge-no-interaction-check',
			location: 'Interaction Checking dialog',
			prompt:
				'A dialog warns that this free-text drug cannot be checked for interactions. Acknowledge it.',
			aidRef: 'p.9 step 6',
			rule: 'Click OK to acknowledge that template non-formulary orders do not have interaction checking.',
			correct: [{ label: 'OK', next: null }],
			wrong: [
				{ label: 'Cancel', needsReview: true },
				{ label: 'Reject', needsReview: true },
			],
		},
	],
};
