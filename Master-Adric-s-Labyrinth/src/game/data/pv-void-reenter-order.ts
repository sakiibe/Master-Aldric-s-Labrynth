import type { WorkflowDef } from '../types';

/**
 * Transcribed from: "Pharmacist Verification & Med Manager v.1" (NS Health /
 * IWK Health, One Person One Record), "Clarification – Rejecting or
 * Re-entering" — "The initial order was incorrectly entered on CPOE",
 * pages 24-26.
 */
export const pvVoidReenterOrder: WorkflowDef = {
  id: 'pv-void-reenter-order',
  title: 'Voiding and Re-entering an Order',
  sector: 'verify-order',
  jobAid: 'verification',
  source: 'Pharmacist Verification & Med Manager v.1 (pp. 24-26)',
  hints: 3,
  patience: 4,
  briefing: [
    'This one was never worth casting at all — a Template Non-Formulary where a real order was meant to stand.',
    'Undo it cleanly, and cast the true recipe in its place.',
  ],
  outro: ['The error is unmade. The true order stands in its place.'],
  steps: [
    {
      id: 'cancel-verify-window',
      location: 'Verify window',
      prompt: 'This Forxiga order was entered as a Template Non-Formulary in error, and needs to be voided rather than verified. Back out first.',
      aidRef: 'p.24 step 1',
      rule: 'Click Cancel in the Verify window.',
      correct: 'Cancel',
      wrong: [{ label: 'OK' }, { label: 'Reject' }],
    },
    {
      id: 'select-void-action',
      location: 'Action column',
      prompt: 'Select the action that removes this order entirely, without dispensing it.',
      aidRef: 'p.24 step 2',
      rule: 'Select the Void Action in Medication Manager.',
      correct: 'Void',
      wrong: [{ label: 'Reject' }, { label: 'Discontinue' }],
    },
    {
      id: 'apply-and-select-void-reason',
      location: 'Void window',
      prompt: 'State why this order is being voided, and make sure nothing prints.',
      aidRef: 'p.24 step 3',
      rule: 'Click Apply in Medication Manager. Select a Reason for Void and click OK. Do not print a label — change Label copies to 0 if required.',
      correct: 'Reason for void',
      wrong: [{ label: 'Communication type' }, { label: 'Printer' }],
    },
    {
      id: 'submit-void',
      location: 'Medication Manager',
      prompt: 'Complete the void.',
      aidRef: 'p.25 step 4',
      rule: 'Click Submit.',
      correct: 'Submit',
      wrong: [{ label: 'Cancel' }, { label: 'Apply' }],
    },
    {
      id: 'create-new-correct-order',
      location: 'Medication Manager — Product Search',
      prompt: 'Enter the medication that was actually intended, dapagliflozin, in place of the voided one.',
      aidRef: 'p.25 step 5',
      rule: 'Create a new order in Medication Manager (or PowerChart) — ensure the drug and dose used match what was actually intended, not the original error. Confirm the dose and click Update.',
      correct: 'Update',
      wrong: [{ label: 'Modify' }, { label: 'Remove' }],
    },
    {
      id: 'document-void-rationale',
      location: 'Verify Window — Comments tab, Rx comments',
      prompt: 'Note why this replaces the voided order.',
      aidRef: 'p.25 step 6',
      rule: 'In the Verify Window of the new order, add a note in the Comments tab under Rx comments.',
      correct: 'Rx comments',
      wrong: [{ label: 'Fill notes' }, { label: 'Control number' }],
    },
    {
      id: 'verify-new-order',
      location: 'Verify window',
      prompt: 'Keep the original prescriber listed, confirm communication type, and finalize.',
      aidRef: 'p.26 steps 7-9',
      rule: 'Keep the initial prescriber as Physician (use the MRP on the Banner Bar if unsure), ensure Communication type is Electronic, and click OK in the Verify Window to verify the order.',
      correct: [{ label: 'OK', next: null }],
      wrong: [
        {
          label: 'Physician',
          rule: 'Keep the initial prescriber listed as Physician — use the MRP on the Banner Bar if you are unsure who that was, rather than changing it to yourself.',
          source: 'job-aid',
          aidRef: 'p.26 step 7',
        },
        { label: 'Reject' },
      ],
    },
  ],
};
