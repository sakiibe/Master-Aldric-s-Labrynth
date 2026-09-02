import type { WorkflowDef } from '../types';

/**
 * Transcribed from: "Pharmacist Verification & Med Manager v.1" (NS Health /
 * IWK Health, One Person One Record), "Medication Manager: Add an IV set
 * using a Powdered Vial with no Volume", pages 30-33.
 */
export const pvAddIvSetPowderedVial: WorkflowDef = {
	id: 'pv-add-iv-set-powdered-vial',
	title: 'Adding an IV Set with a Powdered Vial',
	sector: 'verify-order',
	jobAid: 'verification',
	source: 'Pharmacist Verification & Med Manager v.1 (pp. 30-33)',
	hints: 3,
	patience: 4,
	requires: ['pv-patient-own-supply-medmanager'],
	briefing: [
		'This reagent starts as dust, not liquid — the vessel it comes in has no volume of its own until you give it one.',
	],
	outro: ['Dust made liquid, dosed, and timed. The vial finally has a shape.'],
	steps: [
		{
			id: 'select-vancomycin-med',
			location: 'Product Search',
			prompt:
				'Search for vancomycin and pick the adult peripheral IV set for this dose range.',
			aidRef: 'p.30 steps 1-2',
			rule: 'Type the full or partial name of the drug in the Search Bar and click Add, then select the appropriate medication or infusion and click OK. This is a protected antimicrobial, so an order alert will display — click OK to acknowledge it.',
			correct: 'vancomycin (doses 1.5 to 1.75 g) in NaCl 0.9% 500 mL',
			wrong: [
				{
					label:
						'vancomycin central line (doses 1.75 to 2 g) in NaCl 0.9% 1000 mL',
					rule: 'This order is for the peripheral IV set, not a central line — selecting a central line IV set changes the concentration and volume this patient does not have access through.',
					source: 'authored-needs-review',
				},
				{
					label: 'vancomycin NEO/PED 5mg/mL in NaCl 0.9% INT',
					rule: 'NEO/PED IV sets are pediatric and neonatal only — select the adult IV set instead.',
					source: 'job-aid',
					aidRef: 'p.30',
				},
			],
		},
		{
			id: 'modify-powdered-vial-dose',
			location: 'New Med Order — Dose field',
			prompt:
				'The dose field is blank because this is a powdered vial with no set volume. Enter it.',
			aidRef: 'p.30 step 3',
			rule: 'In the New Med Order Window, select below the Dose field and click Modify.',
			correct: 'Modify',
			wrong: [{ label: 'Remove' }, { label: 'Update' }],
		},
		{
			id: 'type-dose-and-update',
			location: 'New Med Order',
			prompt: 'Type the calculated dose and commit it — units are mandatory.',
			aidRef: 'p.31 step 4',
			rule: 'Type the Dose and click Update. You MUST include units in the Dose field. Click the Dose Calculator icon to calculate mg/kg or other weight-based dosing.',
			correct: [{ label: 'Update', next: 'set-total-volume' }],
			wrong: [{ label: 'Modify' }, { label: 'Remove' }],
		},
		{
			id: 'set-total-volume',
			location: 'New Med Order — Total volume mL',
			prompt:
				'This powdered vial has no volume of its own. Decide how to handle the Total volume field, per the reconstitution guidance.',
			aidRef: 'p.31 step 5',
			rule: 'If the medication is a powdered vial with no volume in the dose, navigate to the IV Drug Dosing Guidelines for reconstitution information and add that volume to the Total volume field (free-text) — or leave it as just the diluent volume. Populating Total volume flows to the MAR, but nursing will still need to enter the drug volume on administration.',
			correct: 'Total volume mL',
			wrong: [{ label: 'Ingredient volume mL' }, { label: 'Duration' }],
		},
		{
			id: 'set-infuse-over',
			location: 'New Med Order — Infuse over',
			prompt:
				'Set the infusion rate — for peripheral IVs, this comes from the dosing guidelines, not a guess.',
			aidRef: 'p.31-32',
			rule: 'Enter the Infuse over period only if needed — either enter "0" to bypass, or navigate to the IV Drug Dosing Guidelines to input the accurate rate for a peripheral or central line as ordered.',
			correct: 'Infuse over',
			wrong: [{ label: 'Rate' }, { label: 'Duration' }],
		},
		{
			id: 'enter-indication-comments',
			location: 'Comments — Antimicrobial Indication',
			prompt: 'Record why this antimicrobial was ordered.',
			aidRef: 'p.32',
			rule: 'Enter an Indication in the Comments section.',
			correct: 'Antimicrobial Indication',
			wrong: [{ label: 'Control number' }, { label: 'Fill notes' }],
		},
		{
			id: 'ok-verify-powdered-vial',
			location: 'New Intermittent Order',
			prompt:
				'Everything is complete. Finalize — remember, orders entered via Medication Manager verify automatically.',
			aidRef: 'p.33 step 6',
			rule: 'Click OK to Verify the order. Orders entered in Medication Manager automatically verify — only orders entered via PowerChart route to Pharmacy Patient Monitor and Medication Manager for verification.',
			correct: [{ label: 'OK', next: 'submit-powdered-vial' }],
			wrong: [{ label: 'Cancel' }, { label: 'Remove' }],
		},
		{
			id: 'submit-powdered-vial',
			location: 'Medication Manager',
			prompt: 'Complete the order.',
			aidRef: 'p.33 step 7',
			rule: 'Click Submit in Medication Manager.',
			correct: [{ label: 'Submit', next: null }],
			wrong: [{ label: 'Cancel' }, { label: 'Apply' }],
		},
	],
};
