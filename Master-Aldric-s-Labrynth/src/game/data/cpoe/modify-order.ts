import type { WorkflowDef } from '../../types';

/**
 * Transcribed from: "CPOE - Powerchart" (NS Health / IWK Health, One Person
 * One Record), "Modify an Order in Powerchart", page 3.
 */
export const cpoeModifyOrder: WorkflowDef = {
	id: 'cpoe-modify-order',
	title: 'Modify an Order',
	sector: 'order-entry',
	jobAid: 'cpoe',
	source: 'CPOE - Powerchart (p. 3)',
	hints: 1,
	patience: 2,
	requires: ['cpoe-add-order'],
	briefing: [
		'An order already stands, but a small clause within it must change.',
		'Modify is a scalpel, not a chisel — it touches only what it is meant to. Reach for the wrong tool and you reshape the wrong thing.',
	],
	outro: ['Amended and signed. The rest of the order sleeps undisturbed.'],
	steps: [
		{
			id: 'right-click-modify',
			location: 'Orders or Medication List tab',
			prompt:
				'The frequency is unchanged, but the prescriber wants a new instruction to appear as an Order Comment. Begin editing the order.',
			aidRef: 'p.3 steps 1-3',
			rule: 'Right click the medication and select Modify — used only for rate changes to continuous infusions, or to add/edit Order Comments or Special Instructions.',
			correct: 'Modify',
			wrong: [
				{
					label: 'Cancel and Reorder',
					rule: 'Only use Modify for rate changes to continuous infusions, or to add/edit Order Comments or Special Instructions — do not change the Dose or Frequency here; that requires Cancel and Reorder instead.',
					source: 'job-aid',
					aidRef: 'p.3 step 3 note',
				},
				{ label: 'Renew' },
			],
		},
		{
			id: 'sign-modify',
			location: 'Orders for Signature',
			prompt: 'The comment is entered. Finalize the change.',
			aidRef: 'p.3 step 4',
			rule: 'Click Orders for Signature and Sign.',
			correct: [{ label: 'Sign', next: null }],
			wrong: [
				{
					label: 'Reset',
					rule: 'Reset stops the Modify action rather than finalizing it — click Orders for Signature and Sign instead.',
					source: 'job-aid',
					aidRef: 'p.3 tip',
				},
				{ label: 'Void' },
			],
		},
	],
};
