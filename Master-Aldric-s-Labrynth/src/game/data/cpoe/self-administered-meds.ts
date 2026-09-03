import type { WorkflowDef } from '../../types';

/**
 * Transcribed from: "CPOE - Powerchart" (NS Health / IWK Health, One Person
 * One Record), "Ordering Self-Administered Medications", page 17.
 *
 * The job aid splits into two independent paths depending on the unit —
 * Rehab/other locations vs. the Multi-Organ Transplant Clinic (MOTP) —
 * modelled here as a genuine branch rather than two separate workflows,
 * since both begin from the same Navigator Bar choice.
 */
export const cpoeSelfAdministeredMeds: WorkflowDef = {
	id: 'cpoe-self-administered-meds',
	title: 'Ordering Self-Administered Medications',
	sector: 'order-entry',
	jobAid: 'cpoe',
	source: 'CPOE - Powerchart (p. 17)',
	hints: 1,
	patience: 2,
	requires: ['cpoe-taper-titration'],
	briefing: [
		'Some patients may measure their own doses — but the ledger must still know it.',
		'The path differs by hall: Rehab keeps its own custom, and the Transplant Clinic keeps another.',
	],
	outro: ['Marked as self-administered. The patient’s own hand, on record.'],
	steps: [
		{
			id: 'choose-self-med-path',
			location: 'Navigator Bar',
			prompt:
				'This patient will self-administer some of their medications. Where you begin depends on the setting.',
			aidRef: 'p.17',
			rule: 'For Rehab or other inpatient locations, work from the Orders or Medication List tab. For the Multi-Organ Transplant Clinic (MOTP), work from the Medication Request tab instead.',
			correct: [
				{
					label: 'Medication List',
					note: 'Rehab/other locations: select the medications for Self-Meds, then Modify.',
					next: 'rehab-modify-comment',
				},
				{
					label: 'Medication Request',
					note: 'MOTP: select medications to self-administer with a MOTP reason.',
					next: 'motp-submit',
				},
			],
			wrong: [{ label: 'MAR Summary' }],
		},
		{
			id: 'rehab-modify-comment',
			location: 'Orders or Medication List tab — Order Comments',
			prompt: 'Mark the selected medications as self-administered.',
			aidRef: 'p.17 steps 1-2',
			rule: 'Select the medications to order for Self-Meds, right click and select Modify, then in the Order Comments tab type "Self-Administered Medication" or "Self-Med" and Sign. This Order Comment populates on all modified orders.',
			correct: [{ label: 'Self-Administered Medication', next: null }],
			wrong: [{ label: 'Special Instructions' }, { label: 'Diagnoses' }],
		},
		{
			id: 'motp-submit',
			location: 'Medication Request tab',
			prompt:
				'Select the medications and reason, then submit the self-med request.',
			aidRef: 'p.17 steps 2-3',
			rule: 'Select medications to be self-administered with Reason "MOTP – Start Self-Med", then click Submit.',
			correct: [{ label: 'MOTP – Start Self-Med', next: null }],
			wrong: [
				{ label: 'Self-Administered Medication' },
				{ label: 'Patient Declined', needsReview: true },
			],
		},
	],
};
