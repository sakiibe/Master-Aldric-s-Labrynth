import type { WorkflowDef } from '../types';

/**
 * Transcribed from: "Pharmacist Verification & Med Manager v.1" (NS Health /
 * IWK Health, One Person One Record), "Copy and Discontinue an Order",
 * pages 9-10.
 *
 * The Medication Manager counterpart to `cpoe-cancel-reorder` (PowerChart's
 * "Cancel and Reorder") — same purpose (dose/route/frequency/PRN changes),
 * different action name.
 */
export const pvCopyDiscontinueOrder: WorkflowDef = {
  id: 'pv-copy-discontinue-order',
  title: 'Copy and Discontinue an Order',
  sector: 'verify-order',
  jobAid: 'verification',
  source: 'Pharmacist Verification & Med Manager v.1 (pp. 9-10)',
  hints: 2,
  patience: 3,
  briefing: [
    'The dose itself must change this time — a touch-up will not do. The whole measure must be recast.',
  ],
  outro: ['The old dose fades; the new one takes its place, properly re-cast.'],
  steps: [
    {
      id: 'select-copy-action',
      location: 'Action column dropdown',
      prompt: 'The dose needs to change. Select the action that allows it.',
      aidRef: 'p.9 step 1',
      rule: 'Select the Copy action — use Copy where Modify may not be appropriate (changing dose, route, frequency, or PRN). Comments, notes, and products may also be changed this way.',
      correct: 'Copy',
      wrong: [{ label: 'Modify' }, { label: 'Discontinue' }],
    },
    {
      id: 'apply-copy',
      location: 'Action bar',
      prompt: 'This creates a new order. Begin.',
      aidRef: 'p.9 step 2',
      rule: 'Click Apply.',
      correct: 'Apply',
      wrong: [{ label: 'Submit' }, { label: 'Cancel' }],
    },
    {
      id: 'modify-dose-in-copy',
      location: 'New Med Order',
      prompt: 'Change the dose on the new order.',
      aidRef: 'p.9 step 3',
      rule: 'Click on Dose and click Modify, then change the dose and click Update — include units of measure (e.g. mg).',
      correct: 'Modify',
      wrong: [{ label: 'Remove' }, { label: 'Update' }],
    },
    {
      id: 'change-product-copy',
      location: 'Manual Product Select',
      prompt: 'The strength needs to change too. Swap the product.',
      aidRef: 'p.9-10',
      rule: 'Change Filter Options to "All Routes and Dosage Forms" and unclick "Linked Products" to view all available products, then select the correct strength and move it to Selected products.',
      correct: 'Move',
      wrong: [{ label: 'Reset' }, { label: 'Select' }],
    },
    {
      id: 'ok-new-order-copy',
      location: 'New Med Order',
      prompt: 'Add or change any other details, then finalize.',
      aidRef: 'p.10 step 4',
      rule: 'Add or change other details in the New Med Order window and click OK when complete.',
      correct: [{ label: 'OK', next: 'submit-copy' }],
      wrong: [{ label: 'Remove' }, { label: 'Modify' }],
    },
    {
      id: 'submit-copy',
      location: 'Medication Manager',
      prompt: 'Complete the new order — the original discontinues automatically.',
      aidRef: 'p.11 step 5',
      rule: 'Click Submit.',
      correct: [{ label: 'Submit', next: null }],
      wrong: [{ label: 'Cancel' }, { label: 'Apply' }],
    },
  ],
};
