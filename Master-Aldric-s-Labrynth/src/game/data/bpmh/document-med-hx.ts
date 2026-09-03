import type { WorkflowDef } from '../../types';

/**
 * Transcribed from: "Document Home Meds & Admission Med Rec" (NS Health / IWK
 * Health, One Person One Record — BPMH & Admission Med Rec), pages 1–2.
 *
 * AUTHORING RULE: `step.rule` states positively what the job aid says the
 * correct action is, and is shown at the dead end behind any wrong door.
 * A `WrongChoice` only carries its own `rule` where the aid speaks to that
 * specific option — otherwise it is a bare label and inherits the step rule.
 * That way nothing shown to a player is invented.
 *
 * `needsReview: true` flags a LABEL we have not confirmed against a
 * screenshot. `pendingReview()` collects them.
 */
export const documentMedByHx: WorkflowDef = {
	id: 'bpmh-document-med-hx',
	title: 'Document Medication by Hx',
	sector: 'bpmh',
	jobAid: 'bpmh',
	source: 'BPMH & Admission Med Rec (pp. 1–2)',
	hints: 3,
	patience: 5,
	briefing: [
		'A patient has arrived, and with them a mystery: what have they been taking at home?',
		'Your task is the Best Possible Medication History. Every elixir, every dose, every last swallow — recorded before the prescriber may act.',
		'Walk the chambers. Choose the correct rune at each door. I shall be watching. Closely.',
	],
	outro: [
		'Documented. Signed. The history stands.',
		'I confess I understand perhaps a third of what just happened.',
		'Teach me this sorcery again tomorrow, apprentice.',
	],
	steps: [
		{
			id: 'nav-med-list',
			location: 'PowerChart — Navigator Bar (Menu)',
			prompt:
				'Open the part of the chart where home medications are documented.',
			aidRef: 'p.1 step 1',
			rule: 'Document Medication by Hx is reached from the Medication List or Orders tab on the Navigator Bar.',
			correct: [
				{ label: 'Medication List', note: 'The usual door.' },
				{ label: 'Orders', note: 'Also correct — either tab gets you there.' },
			],
			wrong: [{ label: 'MAR Summary' }],
		},
		{
			id: 'open-doc-med-hx',
			location: 'Medication List tab — toolbar',
			prompt: 'Open the window where the home medication history is entered.',
			aidRef: 'p.1 step 1',
			rule: 'From the Medication List or Orders tab, click Document Medication by Hx.',
			correct: 'Document Medication by Hx',
			wrong: [
				{
					label: 'Reconciliation',
					rule: 'The Meds History section must be completed first — reconciliation comes after.',
					source: 'job-aid',
					aidRef: 'p.5 step 1 note',
				},
				{ label: 'Check Interactions' },
			],
		},
		{
			id: 'add-home-med',
			location: 'Document Medication by Hx window',
			prompt:
				'The patient reports taking two medications at home. Begin adding them.',
			aidRef: 'p.1 step 3',
			rule: 'To add home medications, click Add — this opens the Add Order Search box.',
			correct: '+ Add',
			wrong: [
				{
					label: 'No Known Home Medications',
					rule: 'Select No Known Home Medications or Unable to Obtain as applicable. This patient has medications to record.',
					source: 'job-aid',
					aidRef: 'p.1 step 3 note',
				},
				{
					label: 'Unable To Obtain Information',
					rule: 'Select No Known Home Medications or Unable to Obtain as applicable. The patient is able to tell you what they take.',
					source: 'job-aid',
					aidRef: 'p.1 step 3 note',
				},
			],
		},
		{
			id: 'set-type',
			location: 'Add Order Search box',
			prompt:
				'Before searching, make sure the search will return home medications.',
			aidRef: 'p.1 step 4',
			rule: 'Ensure the Type box is set to "Document Medication by Hx".',
			correct: 'Type: Document Medication by Hx',
			wrong: [
				{ label: 'Type: Prescription', needsReview: true },
				{ label: 'Type: Inpatient', needsReview: true },
			],
		},
		{
			id: 'select-order-sentence',
			location: 'Search results — "sertraline"',
			prompt:
				'The patient takes sertraline 25 mg by mouth, once daily. Choose the entry to add.',
			aidRef: 'p.1 step 5',
			rule: 'Select the most appropriate order sentence — drug, dose, route and frequency.',
			correct: 'sertraline 25 mg oral capsule (= 1 cap, PO, Daily)',
			wrong: [
				{ label: 'sertraline' },
				{ label: 'sertraline 100 mg oral capsule' },
			],
			note: 'If a medication cannot be found in the database, it can be free-texted by entering a "Template Non-Formulary".',
		},
		{
			id: 'finish-adding',
			location: 'Add Order Search box',
			prompt: 'Both home medications are now entered. Close the search.',
			aidRef: 'p.1 step 6',
			rule: 'Once all home medications are entered, click Done in the bottom right corner.',
			correct: 'Done',
			wrong: [
				{ label: 'Cancel' },
				{
					label: 'Document History',
					rule: 'Document History comes when all medications are accurate — there are still details and compliance to record.',
					source: 'job-aid',
					aidRef: 'p.2 step 10',
				},
			],
		},
		{
			id: 'open-med-details',
			location: 'Prescription window — Pending Home Medications',
			prompt:
				'Dose, route and frequency need to be confirmed for the first medication.',
			aidRef: 'p.1 step 8',
			rule: 'Click on each medication to update any dose, route or frequency.',
			correct: 'sertraline (sertraline 25 mg oral capsule)',
			wrong: [
				{
					label: 'Leave Med History Incomplete - Finish Later',
					rule: 'Select Leave Med History Incomplete – Finish Later only if the history is not checked or not finished.',
					source: 'job-aid',
					aidRef: 'p.2 step 10',
				},
				{ label: 'Cancel' },
			],
		},
		{
			id: 'compliance-tab',
			location: 'Details for sertraline — tab strip',
			prompt:
				'The patient is still taking it as prescribed, last dose yesterday at 08:00. Where does that go?',
			aidRef: 'p.2 step 9',
			rule: 'Document Compliance and Last Dose taken in the Compliance tab.',
			correct: 'Compliance',
			wrong: [
				{ label: 'Details' },
				{
					label: 'Order Comments',
					rule: 'Order Comments is for a patient\u2019s own supply or other pertinent information. Compliance and last dose go in the Compliance tab.',
					source: 'job-aid',
					aidRef: 'p.2 step 9, p.3 step 4',
				},
			],
		},
		{
			id: 'document-history',
			location: 'Document Medication by Hx window',
			prompt:
				'Every medication is now accurate and complete. Commit the history.',
			aidRef: 'p.2 step 10',
			rule: 'When all medications are accurate, click Document History.',
			correct: 'Document History',
			wrong: [
				{
					label: 'Leave Med History Incomplete - Finish Later',
					rule: 'Select Leave Med History Incomplete – Finish Later only if the history is not checked or not finished. This one is complete.',
					source: 'job-aid',
					aidRef: 'p.2 step 10',
				},
				{ label: 'Cancel' },
			],
			note: 'Once you select Document History, the prescriber can order home medications.',
		},
		{
			id: 'view-home-meds',
			location: 'Navigator Bar — Medication List tab',
			prompt:
				'Pull up the list of documented home medications to check your work.',
			aidRef: 'p.2 step 11',
			rule: 'Click Medication History in the Medication List tab to view home medications. They also appear in Pharmacist Workflow.',
			correct: [
				{ label: 'Medication History', note: 'The list of home medications.' },
				{
					label: 'Pharmacist Workflow',
					note: 'Also correct — home medications appear here too.',
				},
			],
			wrong: [{ label: 'Medication History Snapshot', needsReview: true }],
		},
		{
			id: 'reset-wrong-chart',
			location: 'Reconciliation Status',
			prompt:
				'Meds History shows a green checkmark — but you realize it was documented on the wrong patient\u2019s chart. Undo it.',
			aidRef: 'p.2 step 12 note',
			rule: 'If an error was made, right click the check mark by Meds History and click Reset.',
			correct: [{ label: 'Right click Meds History \u2192 Reset', next: null }],
			wrong: [{ label: 'Admission' }, { label: 'Document History' }],
			note: 'Pharmacy staff can use the BPMH Documentation Powerform to confirm home medications and document other pertinent information.',
		},
	],
};
