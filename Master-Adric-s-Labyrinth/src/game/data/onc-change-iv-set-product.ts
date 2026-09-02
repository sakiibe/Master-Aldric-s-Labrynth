import type { WorkflowDef } from '../types';

/**
 * Transcribed from: "Oncology Pharmacist Verification" (NS Health / IWK
 * Health, One Person One Record), "Changing Products in an IV set", pages
 * 26-27.
 */
export const oncChangeIvSetProduct: WorkflowDef = {
	id: 'onc-change-iv-set-product',
	title: 'Changing Products in an IV Set',
	sector: 'verify-order',
	jobAid: 'oncology',
	source: 'Oncology Pharmacist Verification (pp. 26-27)',
	hints: 2,
	patience: 3,
	requires: ['onc-change-dosing-weight'],
	briefing: [
		'Swap the vial, and the notes that came with it vanish — the warnings, the reconstitution instructions, all of it.',
		'Copy what matters before you break it. This is the whole discipline, in one small ritual.',
	],
	outro: ['New vials, same warnings. Nothing was lost in the swap.'],
	steps: [
		{
			id: 'preserve-fill-notes',
			location: 'Comments tab',
			prompt:
				'Changing the vial strength in this IV set will wipe its Product Notes and Fill Notes. Preserve the Fill Notes first.',
			aidRef: 'p.26 step 1',
			rule: 'Copy and paste the Fill Notes to Product Notes — Order Comments do not delete when you select different Products — then click OK on the Comments tab.',
			correct: 'Fill notes',
			wrong: [{ label: 'Rx comments' }, { label: 'Control number' }],
		},
		{
			id: 'select-new-vial-strength',
			location: 'Manual Product Select — Products tab',
			prompt:
				'Select the correct vial strengths for the new dose and move them across.',
			aidRef: 'p.26 steps 2-3',
			rule: 'Copy the content in the Product notes, then select the required vial strengths/sizes in the Product tab and Move to the correct sections. Click OK when complete.',
			correct: 'Move',
			wrong: [{ label: 'Reset' }, { label: 'Cancel' }],
		},
		{
			id: 'update-dose-fields',
			location: 'Selected products — Dose field',
			prompt:
				'Update each product’s dose to match the calculated total. Take care with the click.',
			aidRef: 'p.27 step 4',
			rule: 'Change the doses to equal the calculated dose. SINGLE click on the Dose field — do not double click. Click OK when complete.',
			correct: 'Dose',
			wrong: [{ label: 'Unit' }, { label: 'DspQty' }],
		},
		{
			id: 'restore-product-notes',
			location: 'Product notes',
			prompt:
				'The IV set’s Product Notes were wiped by the product change. Restore them from what was copied earlier.',
			aidRef: 'p.27 step 5',
			rule: 'The IV Set Product Notes delete and individual Product Notes display — delete these and paste the copied Product notes for the IV set.',
			correct: 'Product notes',
			wrong: [{ label: 'Order comments' }, { label: 'Special Instructions' }],
		},
		{
			id: 'restore-fill-notes',
			location: 'Comments tab',
			prompt: 'Move the preserved Fill Notes back into place.',
			aidRef: 'p.27 step 6',
			rule: 'Move Fill notes from Product notes to the appropriate section on the Comments tab. Click OK.',
			correct: 'Fill notes',
			wrong: [{ label: 'Rx comments' }, { label: 'Control number' }],
		},
		{
			id: 'confirm-dispense-fields',
			location:
				'Verify window — Sequence / Dispense category / Dispense from location',
			prompt:
				'Confirm the fields that route this order correctly before verifying.',
			aidRef: 'p.27 step 7',
			rule: 'Change the Sequence to "CHEMO", Dispense category to "IV Intermittent Hazardous", and Dispense from location to the correct chemo room. Click OK to verify.',
			correct: [{ label: 'Sequence: CHEMO', next: null }],
			wrong: [
				{ label: 'Sequence: INJECTION' },
				{ label: 'Sequence: COMPOUND' },
			],
		},
	],
};
