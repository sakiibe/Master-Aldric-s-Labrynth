import type { WorkflowDef } from '../../types';

/**
 * Transcribed from: "Pharmacist Verification & Med Manager v.1" (NS Health /
 * IWK Health, One Person One Record), "Reschedule an Order in Medication
 * Manager" — during verification (pp. 17-18) and after verification
 * (pp. 18-19), combined here as one continuous task on the same order.
 */
export const pvRescheduleOrder: WorkflowDef = {
	id: 'pv-reschedule-order',
	title: 'Rescheduling an Order',
	sector: 'verify-order',
	jobAid: 'verification',
	source: 'Pharmacist Verification & Med Manager v.1 (pp. 17-19)',
	hints: 3,
	patience: 4,
	requires: ['pv-change-frequency'],
	briefing: [
		'The chimes ring at their usual hour, but this dose was asked for at a different one entirely.',
		'You may bend the clock before you sign, or after — the working is the same either way.',
	],
	outro: ['The dose now falls exactly when it was asked for.'],
	steps: [
		{
			id: 'check-order-comments-for-time',
			location: 'Verify Med order window',
			prompt:
				'The Order Comments advise giving this dalteparin at 18:00 instead of its default time. Notice where that instruction lives.',
			aidRef: 'p.17 step 1',
			rule: 'The Order Comments advise the correct administration time — this may also be entered in the Rx Special Instructions section on order entry, which appears in the Comments tab in Medication Manager.',
			correct: 'Comments',
			wrong: [{ label: 'Order Type' }, { label: 'Product' }],
		},
		{
			id: 'select-custom-frequency',
			location: 'Frequency section',
			prompt:
				"The standard daily frequency doesn't give this specific time. Switch to something that will.",
			aidRef: 'p.17 step 2',
			rule: 'In the Frequency section, select "Custom".',
			correct: 'Custom',
			wrong: [{ label: 'daily' }, { label: 'q24h' }],
		},
		{
			id: 'set-custom-time',
			location: 'Custom Frequency',
			prompt: 'Set the new administration time to 18:00.',
			aidRef: 'p.18 step 3',
			rule: 'Change the New times to 18:00 (orders will default to SMAT otherwise) and click OK.',
			correct: [{ label: 'New times: 18:00', next: 'verify-reschedule' }],
			wrong: [{ label: 'Current times' }, { label: 'Every 1 day' }],
		},
		{
			id: 'verify-reschedule',
			location: 'Verify Med Order',
			prompt: 'The Next Administration time now reads 18:00. Finalize.',
			aidRef: 'p.18 step 4',
			rule: 'The Next Administration time will change to 18:00. Click OK to verify.',
			correct: [{ label: 'OK', next: 'submit-reschedule-verify' }],
			wrong: [{ label: 'Reject' }, { label: 'Cancel' }],
		},
		{
			id: 'submit-reschedule-verify',
			location: 'Medication Manager',
			prompt: 'Complete this verification-time reschedule.',
			aidRef: 'p.18 step 5',
			rule: 'Click Submit.',
			correct: 'Submit',
			wrong: [{ label: 'Cancel' }, { label: 'Apply' }],
		},
		{
			id: 'select-reschedule-action',
			location: 'Action column — already-verified order',
			prompt:
				'This order is already verified and now needs rescheduling after the fact.',
			aidRef: 'p.19 steps 1-2',
			rule: 'In the Action column, click the Drop Down or right click the order to be rescheduled and select the Reschedule action — orders must be verified before you can perform the Reschedule action; nursing can reschedule individual administrations but cannot permanently change administration times.',
			correct: 'Reschedule',
			wrong: [{ label: 'Modify' }, { label: 'Verify' }],
		},
		{
			id: 'apply-and-set-reschedule',
			location: 'Reschedule — Custom Frequency',
			prompt: 'Apply the reschedule action and set the new time.',
			aidRef: 'p.19 steps 3-4',
			rule: 'Click Apply, adjust the New times, and click OK.',
			correct: [{ label: 'OK', next: 'submit-reschedule-after' }],
			wrong: [{ label: 'Cancel' }, { label: 'Defaults' }],
		},
		{
			id: 'submit-reschedule-after',
			location: 'Medication Manager',
			prompt: 'Complete the after-verification reschedule.',
			aidRef: 'p.19 step 5',
			rule: 'Click Submit in Medication Manager.',
			correct: [{ label: 'Submit', next: null }],
			wrong: [{ label: 'Cancel' }, { label: 'Apply' }],
		},
	],
};
