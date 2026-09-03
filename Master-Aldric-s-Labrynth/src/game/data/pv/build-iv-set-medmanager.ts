import type { WorkflowDef } from '../../types';

/**
 * Transcribed from: "Pharmacist Verification & Med Manager v.1" (NS Health /
 * IWK Health, One Person One Record), "Build an IV Set in Medication
 * Manager", pages 46-49.
 *
 * References `cpoe-template-non-formulary` directly (p.46: "If ordered as a
 * Template Non-Formulary, click Cancel [and build the real IV set instead]").
 */
export const pvBuildIvSetMedManager: WorkflowDef = {
	id: 'pv-build-iv-set-medmanager',
	title: 'Building an IV Set in Medication Manager',
	sector: 'verify-order',
	jobAid: 'verification',
	source: 'Pharmacist Verification & Med Manager v.1 (pp. 46-49)',
	hints: 3,
	patience: 5,
	requires: ['pv-verify-bolus-continuous-bag'],
	briefing: [
		'No shelf holds this exact compound pre-made — a Template Non-Formulary stands in its place, but the formulary can build the real thing.',
		'Cast it component by component, and let the free-text order fade once the true one stands.',
	],
	outro: [
		'A proper compounded bag, built from its parts. The stand-in order is gone.',
	],
	steps: [
		{
			id: 'cancel-if-template-nonform',
			location: 'Medication Manager',
			prompt:
				'This TNF-KCl order was placed as a Template Non-Formulary, but a real IV set should be built instead. Back out of it first.',
			aidRef: 'p.46 step 2',
			rule: 'Most IV sets should be built in the formulary. If ordered as a Template Non-Formulary, click Cancel in Medication Manager.',
			correct: 'Cancel',
			wrong: [{ label: 'OK' }, { label: 'Apply' }],
		},
		{
			id: 'search-main-component',
			location: 'Acute Profile — Drug search',
			prompt:
				'Search for the main component of the IV set you’re about to build.',
			aidRef: 'p.46 step 3',
			rule: 'Search the main component of the IV set (e.g. potassium chloride).',
			correct: 'Add',
			wrong: [{ label: 'Search' }, { label: 'Submit' }],
		},
		{
			id: 'select-continuous-product-type',
			location: 'Select Product Type',
			prompt:
				'This will be a continuous infusion, not a plain med or intermittent dose.',
			aidRef: 'p.46 step 4',
			rule: 'Select an appropriate product/IV bag and click OK, then select the Continuous Product Type and click OK.',
			correct: 'Continuous',
			wrong: [{ label: 'Med' }, { label: 'Intermittent' }],
		},
		{
			id: 'leave-normalized-rate-blank',
			location: 'New Continuous Order — Normalized rate',
			prompt:
				'Enter the total volume, but leave the rate-per-weight field alone — it doesn’t apply here.',
			aidRef: 'p.47',
			rule: 'Type in the Dose (total volume) and click Update. Leave the Normalized rate field BLANK — normalized rates are weight- or target-based (e.g. mcg/kg/min), whereas mL/hr is the speed at which the pump delivers the physical volume.',
			correct: 'Dose',
			wrong: [
				{
					label: 'Normalized rate',
					rule: 'Leave the Normalized rate field blank when building a plain-rate IV set — normalized rates are weight- or target-based, while the Rate field (mL/hr) is what the pump actually delivers.',
					source: 'job-aid',
					aidRef: 'p.47 note',
				},
				{ label: 'Frequency' },
			],
		},
		{
			id: 'set-rate-and-add-second-drug',
			location: 'New Continuous Order',
			prompt:
				'Set the pump rate, then add the second component of this IV set.',
			aidRef: 'p.47',
			rule: 'Complete required details, using the Rate field for the physical rate ordered (e.g. 50 mL/hr). Then search the next drug (e.g. Magnesium Sulfate) in the Search bar and press Enter.',
			correct: 'Rate',
			wrong: [{ label: 'Infuse over' }, { label: 'Replace every' }],
		},
		{
			id: 'document-build-rationale',
			location: 'Comments tab — Rx comments',
			prompt:
				'Note why this was built as a compounded IV rather than the Template Non-Formulary it was ordered as.',
			aidRef: 'p.48',
			rule: 'Enter the dose of the other component and click Update. In the Comments tab, input a rationale and click OK — a note here is only visible to Pharmacy staff; use Product Notes or an Intervene action for nursing/provider visibility.',
			correct: 'Rx comments',
			wrong: [{ label: 'Fill notes' }, { label: 'Control number' }],
		},
		{
			id: 'ok-new-continuous-order',
			location: 'New Continuous Order',
			prompt: 'The built IV set is complete. Finalize it.',
			aidRef: 'p.48',
			rule: 'When complete, click OK on the New Continuous Order window, then click Submit.',
			correct: [{ label: 'OK', next: 'void-tnf-order' }],
			wrong: [{ label: 'Cancel' }, { label: 'Remove' }],
		},
		{
			id: 'void-tnf-order',
			location: 'Acute Profile — original TNF order',
			prompt:
				'The original Template Non-Formulary order is now redundant. Remove it without dispensing it.',
			aidRef: 'p.49 step 5',
			rule: 'Assign the Void action to the template non-formulary (TNF) order and click Apply. Select a Reason for void and click OK — do not print a label.',
			correct: 'Void',
			wrong: [{ label: 'Discontinue' }, { label: 'Reject' }],
		},
		{
			id: 'submit-built-iv-set',
			location: 'Medication Manager',
			prompt: 'Complete both the new build and the void.',
			aidRef: 'p.49 step 7',
			rule: 'Click Submit.',
			correct: [{ label: 'Submit', next: null }],
			wrong: [{ label: 'Cancel' }, { label: 'Apply' }],
		},
	],
};
