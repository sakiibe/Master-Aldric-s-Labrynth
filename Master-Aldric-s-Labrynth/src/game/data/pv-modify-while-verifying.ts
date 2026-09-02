import type { WorkflowDef } from '../types';

/**
 * Transcribed from: "Pharmacist Verification & Med Manager v.1" (NS Health /
 * IWK Health, One Person One Record), "Order Clarification during
 * Verification" — "Modify the order currently verifying", pages 20-22.
 */
export const pvModifyWhileVerifying: WorkflowDef = {
	id: 'pv-modify-while-verifying',
	title: 'Clarifying an Order While Verifying',
	sector: 'verify-order',
	jobAid: 'verification',
	source: 'Pharmacist Verification & Med Manager v.1 (pp. 20-22)',
	hints: 3,
	patience: 4,
	requires: ['pv-reprint-label'],
	briefing: [
		'A quick word with the prescriber changed the shape of this order — the route, the schedule, the reason it stands. Fold that into the working itself.',
	],
	outro: [
		'Clarified, corrected, and signed under your own name. The reasoning travels with the order.',
	],
	steps: [
		{
			id: 'select-modify-verified-order',
			location: 'Action column — verified order',
			prompt:
				'A verbal clarification changed this ondansetron order from PRN to scheduled. Begin correcting it in place.',
			aidRef: 'p.20 step 1',
			rule: 'On the verified order, select the Modify Action in Medication Manager.',
			correct: 'Modify',
			wrong: [{ label: 'Copy' }, { label: 'Void' }],
		},
		{
			id: 'change-order-type-if-needed',
			location: 'Manual Product Select — Order Type',
			prompt:
				'This medication was ordered as IV, not IV direct. Change it to the route actually intended.',
			aidRef: 'p.21',
			rule: 'This medication was ordered as IV, not IV direct — to change to IV direct, change the Order Type and select the correct injection product.',
			correct: 'Select',
			wrong: [{ label: 'Move' }, { label: 'Reset' }],
		},
		{
			id: 'change-stop-type-soft-stop',
			location: 'Verify Intermittent Order — Stop type',
			prompt:
				'Change this order from PRN to scheduled, with a 48-hour prompt to reassess rather than a hard cutoff.',
			aidRef: 'p.21 step 3',
			rule: 'Change the order from PRN to scheduled, with a Soft Stop for 48 hours. A Soft Stop does not discontinue the order after 48 hours — it is a prompt for clinicians to re-assess the medication’s continuation.',
			correct: 'Soft Stop',
			wrong: [
				{
					label: 'Hard Stop',
					rule: 'A Hard Stop or Physician Stop will discontinue the order after the specified duration — a Soft Stop is correct here since it should only prompt reassessment, not auto-discontinue.',
					source: 'job-aid',
					aidRef: 'p.22',
				},
				{
					label: 'Physician Stop',
					rule: 'A Hard Stop or Physician Stop will discontinue the order after the specified duration — a Soft Stop is correct here since it should only prompt reassessment, not auto-discontinue.',
					source: 'job-aid',
					aidRef: 'p.22',
				},
			],
		},
		{
			id: 'set-physician-to-self',
			location: 'Verify Intermittent Order — Physician',
			prompt:
				'This clarification came from you, the verifying pharmacist. Reflect that.',
			aidRef: 'p.22 step 4',
			rule: 'Change Physician to yourself, and ensure Communication type is Electronic with correct Dispense information.',
			correct: 'Physician',
			wrong: [{ label: 'Communication type' }, { label: 'Dispense category' }],
		},
		{
			id: 'complete-rx-intervention',
			location: 'Rx Intervention — Clinical Pharmacy',
			prompt: 'Document this clarification formally.',
			aidRef: 'p.22 step 6',
			rule: 'Select and complete an Rx Intervention — choose a Clinical Pharmacy Powerform, click Chart, complete it, click the green checkmark, and Sign.',
			correct: 'Rx Intervention',
			wrong: [{ label: 'Alert History' }, { label: 'Lot Info' }],
		},
		{
			id: 'ok-verify-modified-order',
			location: 'Verify window',
			prompt: 'Finalize the verification with the clarification documented.',
			aidRef: 'p.22 step 7',
			rule: 'Click OK in the Verify window to verify the order.',
			correct: [{ label: 'OK', next: 'submit-modified-order' }],
			wrong: [{ label: 'Reject' }, { label: 'Cancel' }],
		},
		{
			id: 'submit-modified-order',
			location: 'Medication Manager',
			prompt: 'Complete the clarification.',
			aidRef: 'p.22 step 8',
			rule: 'Click Submit in Medication Manager.',
			correct: [{ label: 'Submit', next: null }],
			wrong: [{ label: 'Cancel' }, { label: 'Apply' }],
		},
	],
};
