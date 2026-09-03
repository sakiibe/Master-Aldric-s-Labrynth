import type { WorkflowDef } from '../../types';

/**
 * Transcribed from: "Pharmacist Verification & Med Manager v.1" (NS Health /
 * IWK Health, One Person One Record), "Add an Order using Medication
 * Manager", pages 6-7.
 *
 * Related to `cpoe-add-order` (adding via PowerChart), but a distinct entry
 * point: orders entered here auto-verify instead of routing to Pharmacy
 * Patient Monitor.
 */
export const pvAddOrderMedManager: WorkflowDef = {
	id: 'pv-add-order-medmanager',
	title: 'Add an Order using Medication Manager',
	sector: 'verify-order',
	jobAid: 'verification',
	source: 'Pharmacist Verification & Med Manager v.1 (pp. 6-7)',
	hints: 2,
	patience: 3,
	requires: ['pv-verify-order'],
	briefing: [
		'You need not always wait for the incantation to arrive from elsewhere — some may be cast from right here.',
		'Cast it yourself, and it needs no second seal. That convenience is not free — it demands the same care.',
	],
	outro: ['Ordered and self-verified. No second hand was needed.'],
	steps: [
		{
			id: 'search-and-add-drug',
			location: 'Acute Profile — Drug search bar',
			prompt: 'A new order for ramipril is needed. Begin.',
			aidRef: 'p.6 step 1',
			rule: 'Search the drug name in the search bar and click Add.',
			correct: 'Add',
			wrong: [{ label: 'Search' }, { label: 'Submit' }],
		},
		{
			id: 'select-product',
			location: 'Product Search',
			prompt: 'Select the correct strength.',
			aidRef: 'p.6 step 2',
			rule: 'Select the correct product and click OK.',
			correct: 'ramipril 5 mg capsule',
			wrong: [
				{ label: 'ramipril 2.5 mg capsule' },
				{ label: 'ramipril 10 mg capsule' },
			],
		},
		{
			id: 'update-dose',
			location: 'New Med Order',
			prompt:
				'The dose is correct as populated. Commit it — remember, any dose change needs a unit of measure.',
			aidRef: 'p.6 step 3',
			rule: 'In the New Med Order window, ensure the dose is correct and click Update. If changing the dose, include the unit of measure (e.g. mg).',
			correct: 'Update',
			wrong: [{ label: 'Modify' }, { label: 'Remove' }],
		},
		{
			id: 'complete-required-details',
			location: 'New Med Order',
			prompt: 'The prescriber is unknown. Use the tip to find who to list.',
			aidRef: 'p.6 step 4',
			rule: 'Populate required details (shown in yellow) — use the MRP on the Banner Bar if the Physician is unknown.',
			correct: 'Physician',
			wrong: [{ label: 'Route' }, { label: 'Duration' }],
		},
		{
			id: 'ok-new-med-order',
			location: 'New Med Order',
			prompt: 'Add any additional details, then finalize.',
			aidRef: 'p.6 step 5',
			rule: 'Add any additional details and click OK.',
			correct: [{ label: 'OK', next: 'submit-new-order' }],
			wrong: [{ label: 'Remove' }, { label: 'Modify' }],
		},
		{
			id: 'submit-new-order',
			location: 'Medication Manager',
			prompt: 'Complete the order.',
			aidRef: 'p.7 step 6',
			rule: 'Click Submit. Orders entered via Medication Manager are automatically verified — only orders entered via PowerChart route to Pharmacy Patient Monitor and require pharmacist verification.',
			correct: [{ label: 'Submit', next: null }],
			wrong: [{ label: 'Cancel' }, { label: 'Apply' }],
		},
	],
};
