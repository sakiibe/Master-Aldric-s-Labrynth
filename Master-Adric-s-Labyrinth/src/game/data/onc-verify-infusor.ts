import type { WorkflowDef } from '../types';

/**
 * Transcribed from: "Oncology Pharmacist Verification" (NS Health / IWK
 * Health, One Person One Record), "Verifying an Infusor" — 1st Verification
 * for a Fluorouracil Infusor, pages 13-14.
 *
 * Scope note: only the 1st verification is modelled in detail — the 2nd
 * verification repeats the shared Process -> Apply -> Action History OK ->
 * reselect the same Product/IV Set tab -> OK -> Submit shape already taught
 * in full in `onc-verify-iv-set` (and no Activate step is described for the
 * infusor 2nd verification in the source).
 */
export const oncVerifyInfusor: WorkflowDef = {
	id: 'onc-verify-infusor',
	title: 'Verifying an Infusor',
	sector: 'verify-order',
	jobAid: 'oncology',
	source: 'Oncology Pharmacist Verification (pp. 13-14)',
	hints: 2,
	patience: 3,
	requires: ['onc-verify-total-volume-iv-set'],
	briefing: [
		'This dose does not stop at the bedside — it travels with the patient, sealed in its own small engine, for days.',
		'Some are drawn ready-made from the shelf; others must be built here. Know which shelf to reach for.',
	],
	outro: [
		'Sealed, timed, labelled. It will keep working long after you’ve gone home.',
	],
	steps: [
		{
			id: 'choose-prefilled-or-compounded',
			location: 'Manual Product Select — fluorouracil',
			prompt:
				'This dose falls within a prefilled infusor’s dose-banded range rather than needing a compounded bag. Choose the right tab.',
			aidRef: 'p.13 note',
			rule: 'Dose banding is applied in the builds of the IV sets — the dose will fall into the range of the outsourced prefilled infusor. Pre-Filled Infusors are in the Products tab (select "All Routes and Dosage Forms" and unselect "Linked Products" to see them all); compounded infusors are in the IV Sets tab.',
			correct: [
				{
					label: 'Products tab',
					note: 'Pre-filled infusor — dose banded, outsourced.',
					next: 'select-prefilled-infusor',
				},
				{
					label: 'IV Sets tab',
					note: 'Compounded infusor, built in-house.',
					next: 'select-compounded-infusor',
				},
			],
			wrong: [{ label: 'Order comments' }],
		},
		{
			id: 'select-prefilled-infusor',
			location: 'Manual Product Select — Products tab',
			prompt: 'Select the prefilled infusor whose range covers this dose.',
			aidRef: 'p.13',
			rule: 'Select the prefilled infusor description matching the dose band, then click Select.',
			correct: [
				{
					label:
						'fluorouracil 3600 mg/230 mL D5W prefilled infusor (outsourced)',
					next: 'verify-infusor-ok',
				},
			],
			wrong: [
				{
					label:
						'fluorouracil 3200 mg/230 mL D5W prefilled infusor (outsourced)',
				},
				{
					label:
						'fluorouracil 4000 mg/230 mL D5W prefilled infusor (outsourced)',
				},
			],
		},
		{
			id: 'select-compounded-infusor',
			location: 'Manual Product Select — IV Sets tab',
			prompt:
				'Select the compounded infusor IV set and calculate the diluent volume.',
			aidRef: 'p.14 step 4',
			rule: 'Select the compounded infusor IV set (input "1" in Quantity per dose if prompted), then calculate the Dextrose volume needed to reach the total volume noted in the Product notes.',
			correct: [
				{
					label:
						'fluorouracil _ mg over 46h in D5W 230 mL total volume infusor',
					next: 'verify-infusor-ok',
				},
			],
			wrong: [
				{ label: 'fluorouracil Peds _ mg in D5W 250 mL' },
				{ label: 'fluorouracil Peds _ mg in D5W 50 mL' },
			],
		},
		{
			id: 'verify-infusor-ok',
			location: 'Verify Intermittent Protocol Order',
			prompt:
				'The infusor’s volume and duration are set. Finalize the verification.',
			aidRef: 'p.14 step 5',
			rule: 'Complete all verification fields, enter the duration in the infuse-over boxes, and click OK to Verify the order.',
			correct: [{ label: 'OK', next: 'submit-infusor' }],
			wrong: [{ label: 'Reject' }, { label: 'Modify' }],
		},
		{
			id: 'submit-infusor',
			location: 'Medication Manager',
			prompt: 'Complete the verification.',
			aidRef: 'p.14',
			rule: 'Click Submit in Medication Manager.',
			correct: [{ label: 'Submit', next: null }],
			wrong: [{ label: 'Cancel' }, { label: 'Apply' }],
		},
	],
};
