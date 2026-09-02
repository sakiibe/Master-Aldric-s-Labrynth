import type { WorkflowDef } from '../types';

/**
 * Transcribed from: "CPOE - Powerchart" (NS Health / IWK Health, One Person
 * One Record), "Add an Order using CPOE in Powerchart", pages 1-2.
 *
 * The foundational CPOE workflow — every other CPOE workflow in this job aid
 * (Modify, Cancel and Reorder, Powerplans, ...) assumes an order already
 * exists, so this is the natural first stop in the district.
 */
export const cpoeAddOrder: WorkflowDef = {
	id: 'cpoe-add-order',
	title: 'Add an Order using CPOE',
	sector: 'order-entry',
	jobAid: 'cpoe',
	source: 'CPOE - Powerchart (pp. 1-2)',
	hints: 3,
	patience: 5,
	briefing: [
		'A new incantation must be entered into the ledger — a real order, for a real patient, not a rehearsal.',
		'Every clause matters: the vessel, the measure, the hour it takes effect. Sloppy casting here reaches the patient.',
		'Walk the chambers. I shall watch for spilled reagents.',
	],
	outro: [
		'Signed and entered. The order stands.',
		'A most peculiar incantation — no cauldron, no chant, and yet it works.',
	],
	steps: [
		{
			id: 'nav-orders-tab',
			location: 'Navigator Bar',
			prompt: 'Begin placing a new order for this patient.',
			aidRef: 'p.1 step 1',
			rule: 'Click the Orders tab on the Navigator Bar and click the Add button to begin a new order.',
			correct: 'Orders',
			wrong: [
				{
					label: 'Medication List',
					rule: 'You must use the Orders tab to order Powerplans — not the Medication List tab.',
					source: 'job-aid',
					aidRef: 'p.1 step 1 note',
				},
				{ label: 'MAR Summary' },
			],
		},
		{
			id: 'click-add',
			location: 'Orders tab — toolbar',
			prompt: 'Open the search window to place the order.',
			aidRef: 'p.1 step 1',
			rule: 'On the Orders tab, click the Add button to open the Add Order window.',
			correct: '+ Add',
			wrong: [
				{ label: 'Reconciliation' },
				{ label: 'Document Medication by Hx' },
			],
		},
		{
			id: 'set-order-type',
			location: 'Add Order Search box',
			prompt:
				'Before searching, confirm the search will return inpatient orders.',
			aidRef: 'p.1 step 2',
			rule: 'Ensure the Type box is set to "Inpatient" so the search returns orderable inpatient items.',
			correct: 'Type: Inpatient',
			wrong: [
				{ label: 'Type: Prescriptions' },
				{ label: 'Type: Document Medication by Hx' },
			],
		},
		{
			id: 'search-select-order',
			location: 'Add Order Search box — results',
			prompt:
				'The prescriber wants a one-time dose of acetaminophen 975 mg by mouth. Select the matching order sentence.',
			aidRef: 'p.1 steps 2-3',
			rule: 'Begin typing the order name (or route) in the Search bar; pre-populated order sentences will display. Select the most appropriate order.',
			correct: 'acetaminophen (975 mg, PO, tab, Once)',
			wrong: [
				{ label: 'acetaminophen (80 mg, PO, tab-chew, Once)' },
				{ label: 'acetaminophen extended release (650 mg, PO, tab-cr, Once)' },
			],
			note: 'If unable to find the correct order, select Enter on the keyboard.',
		},
		{
			id: 'finish-search',
			location: 'Add Order Search box',
			prompt:
				'The order sits selected behind the search window. Close the search.',
			aidRef: 'p.1 step 4',
			rule: 'Click Done at the bottom of the window.',
			correct: 'Done',
			wrong: [{ label: 'Advanced Options' }, { label: 'Type: Inpatient' }],
		},
		{
			id: 'first-dose-priority',
			location: 'Orders for Signature — Details for acetaminophen',
			prompt: 'This is a one-time STAT dose. Set the priority accordingly.',
			aidRef: 'p.2 step 7',
			rule: 'Change First Dose Priority for STAT or NOW as appropriate.',
			correct: 'STAT',
			wrong: [{ label: 'Routine' }, { label: '(None)' }],
		},
		{
			id: 'order-comments',
			location: 'Details for acetaminophen',
			prompt:
				'The prescriber wants "maximum 4 grams/day" visible on the MAR and in the order. Record it.',
			aidRef: 'p.2 step 9',
			rule: 'Enter Order Comments (notes that are face up on the MAR and in the order) if needed.',
			correct: 'Order Comments',
			wrong: [{ label: 'Diagnoses' }, { label: 'Special Instructions' }],
		},
		{
			id: 'sign-order',
			location: 'Orders for Signature',
			prompt: 'Every detail is confirmed. Finalize the order.',
			aidRef: 'p.2 step 10',
			rule: 'Click Sign.',
			correct: [{ label: 'Sign', next: null }],
			wrong: [{ label: 'Dx Table' }, { label: 'Orders For Cosignature' }],
		},
	],
};
