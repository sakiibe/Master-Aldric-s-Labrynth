import type { WorkflowDef } from '../types';

/**
 * Transcribed from: "Pharmacist Verification & Med Manager v.1" (NS Health /
 * IWK Health, One Person One Record), "Verifying Powerplans", pages 36-38.
 *
 * The verification-side counterpart to `cpoe-powerplan` (creating/initiating
 * one) and `onc-pretreatment-powerplan` (the oncology pre-treatment plan).
 */
export const pvVerifyPowerplan: WorkflowDef = {
  id: 'pv-verify-powerplan',
  title: 'Verifying Powerplans',
  sector: 'verify-order',
  jobAid: 'verification',
  source: 'Pharmacist Verification & Med Manager v.1 (pp. 36-38)',
  hints: 2,
  patience: 3,
  requires: ['pv-verify-combination-strengths'],
  briefing: [
    'A whole bundle of orders arrives at once, all from the same working. Each one still needs your eye before it stands.',
  ],
  outro: ['The whole bundle stands verified, order by order.'],
  steps: [
    {
      id: 'process-powerplan-order',
      location: 'Pharmacy Patient Monitor',
      prompt: "An initiated Powerplan's orders are waiting. Begin.",
      aidRef: 'p.36 step 2',
      rule: 'Click Process. Only Powerplans that were Initiated are active and require pharmacist verification — Powerplans that are "Planned" will not route to PPM. Hover over the Powerplan icon to view its name.',
      correct: 'Process',
      wrong: [{ label: 'View' }, { label: 'Suspend' }],
    },
    {
      id: 'apply-verify-powerplan-orders',
      location: 'Medication Manager',
      prompt: "Begin verifying the Powerplan's orders.",
      aidRef: 'p.36 step 3',
      rule: 'In Medication Manager, the Verify action will default. Click Apply.',
      correct: 'Apply',
      wrong: [{ label: 'Submit' }, { label: 'Cancel' }],
    },
    {
      id: 'view-all-powerplan-orders',
      location: 'Verify window — PowerChart icon',
      prompt: 'Before verifying each order, see the whole Powerplan they belong to.',
      aidRef: 'p.37 steps 5-7',
      rule: 'To view all orders selected on the Powerplan, click the PowerChart icon on the Verify window, then click the Orders tab on the Navigator Bar, open the Plans section, select the Powerplan, and review all orders.',
      correct: 'PowerChart icon',
      wrong: [{ label: 'Product' }, { label: 'Comments' }],
    },
    {
      id: 'verify-each-powerplan-order',
      location: 'Medication Manager',
      prompt: 'Verify each order individually, assigning the correct product where required.',
      aidRef: 'p.37 step 4',
      rule: 'Verify each order individually, assigning the correct product as required, then navigate back to Medication Manager and click OK to Verify (or Reject to decline).',
      correct: [{ label: 'OK', next: 'submit-powerplan' }],
      wrong: [{ label: 'Reject' }, { label: 'Cancel' }],
    },
    {
      id: 'submit-powerplan',
      location: 'Medication Manager',
      prompt: "Complete the Powerplan's verification.",
      aidRef: 'p.38 step 9',
      rule: 'Click Submit when complete.',
      correct: [{ label: 'Submit', next: null }],
      wrong: [{ label: 'Cancel' }, { label: 'Apply' }],
    },
  ],
};
