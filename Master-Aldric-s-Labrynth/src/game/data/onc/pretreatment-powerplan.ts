import type { WorkflowDef } from '../../types';

/**
 * Transcribed from: "Oncology Pharmacist Verification" (NS Health / IWK
 * Health, One Person One Record), "Pre-Treatment Powerplans Powerchart",
 * pages 20-22.
 */
export const oncPretreatmentPowerplan: WorkflowDef = {
	id: 'onc-pretreatment-powerplan',
	title: 'Pre-Treatment Powerplans',
	sector: 'verify-order',
	jobAid: 'oncology',
	source: 'Oncology Pharmacist Verification (pp. 20-22)',
	hints: 2,
	patience: 3,
	requires: ['onc-modify-dose'],
	briefing: [
		'Before the first true dose, there is preparation — pre-medications, labs, prescriptions to send ahead.',
		'Everything here must be ready before treatment day arrives, or the whole regimen waits on you.',
	],
	outro: ['The ground is prepared. Treatment day may proceed as scheduled.'],
	steps: [
		{
			id: 'search-pretreatment-plan',
			location: 'Orders — Add Order Search box',
			prompt:
				'A new patient is starting LY CHOP therapy. Find the pre-treatment plan.',
			aidRef: 'p.20 step 2',
			rule: 'Search for a Pre-Treatment plan by typing "ONCP" (ONCP = PowerPlan/Cycle).',
			correct: 'ONCP CHOP Pre-Treatment Plan',
			wrong: [{ label: 'ONC LY CHOP' }, { label: 'ONCP LY CHOP Cycle 1' }],
		},
		{
			id: 'confirm-add-plan',
			location: 'Add Plan — ONCP CHOP Pre-Treatment Plan',
			prompt:
				"This is a future outpatient visit, not today's visit. Set it up correctly.",
			aidRef: 'p.21 step 3',
			rule: 'Complete the information in the Add Plan box — select the correct visit type and estimated start time — and click OK.',
			correct: 'Future Outpatient Visit',
			wrong: [{ label: 'This Visit' }, { label: 'Future Inpatient Visit' }],
		},
		{
			id: 'select-prescriptions',
			location: 'Pre-Treatment Plan — Prescriptions section',
			prompt:
				'A blue X marks the prescriptions still missing required details. Begin completing them.',
			aidRef: 'p.21 steps 5-6',
			rule: 'Click on the Prescriptions section, select the medications by clicking the box (a blue X indicates required details are missing), then right click the order and select Modify.',
			correct: 'Modify',
			wrong: [{ label: 'Reference Information' }, { label: 'Comments' }],
		},
		{
			id: 'set-send-to',
			location: 'Details for allopurinol',
			prompt:
				'This prescription needs to go to the community pharmacy. Complete the remaining details.',
			aidRef: 'p.22 step 7',
			rule: 'Complete remaining order details and select a Send To location (e.g. Community Pharmacy or Print).',
			correct: 'Send To',
			wrong: [{ label: 'Offset Details' }, { label: 'Diagnoses' }],
		},
		{
			id: 'apply-diagnosis-all-phases',
			location: 'Diagnosis Selection box',
			prompt:
				'Every phase of this plan shares the same diagnosis. Apply it everywhere at once rather than phase by phase.',
			aidRef: 'p.22 step 10',
			rule: 'When all Prescriptions are complete and you click Orders for Signature, the Diagnosis Selection box appears — select Apply Diagnosis to All Phases and click OK.',
			correct: 'Apply Diagnosis to All Phases',
			wrong: [{ label: 'Diagnoses' }, { label: 'Comments' }],
		},
		{
			id: 'sign-pretreatment',
			location: 'Orders for Signature',
			prompt: 'The plan is complete. Finalize it.',
			aidRef: 'p.22 step 11',
			rule: 'Click Sign.',
			correct: [{ label: 'Sign', next: null }],
			wrong: [{ label: 'Orders For Cosignature' }, { label: 'Dx Table' }],
		},
	],
};
