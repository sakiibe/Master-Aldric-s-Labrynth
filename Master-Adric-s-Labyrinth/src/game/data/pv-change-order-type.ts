import type { WorkflowDef } from '../types';

/**
 * Transcribed from: "Pharmacist Verification & Med Manager v.1" (NS Health /
 * IWK Health, One Person One Record), "Changing an Order Type", pages 11-13.
 */
export const pvChangeOrderType: WorkflowDef = {
  id: 'pv-change-order-type',
  title: 'Changing an Order Type',
  sector: 'verify-order',
  jobAid: 'verification',
  source: 'Pharmacist Verification & Med Manager v.1 (pp. 11-13)',
  hints: 2,
  patience: 3,
  requires: ['pv-copy-discontinue-order'],
  briefing: [
    'The ledger sometimes cannot tell what shape a dose takes — a plain draught, a timed dose, or something ongoing. That judgement falls to you.',
  ],
  outro: ['The order now wears its correct shape — no more, no less than it needs.'],
  steps: [
    {
      id: 'select-product-type',
      location: 'Select Product Type',
      prompt: "PowerChart couldn't determine whether this dalteparin order is a plain med, intermittent, or continuous. Pick correctly.",
      aidRef: 'p.11',
      rule: 'On Verification, the Select Product Type window may appear. Selecting the most appropriate option assigns the correct Order Type to the order — a subcut dalteparin dose is a "Med".',
      correct: 'Med',
      wrong: [{ label: 'Intermittent' }, { label: 'Continuous' }],
    },
    {
      id: 'open-order-type-tab',
      location: 'Verify Intermittent Order',
      prompt: "This ondansetron order is defaulting to an order type that wants total volume, rate and infuse-over instructions it doesn't need. Fix the order type itself.",
      aidRef: 'p.12 step 1',
      rule: 'In the verification window, an IV-direct order may default to "Verify Intermittent Order", which requires total volume, rate, and infuse over instructions it does not need. Click the Order Type tab.',
      correct: 'Order Type',
      wrong: [{ label: 'Product' }, { label: 'Comments' }],
    },
    {
      id: 'select-iv-direct-product',
      location: 'Manual Product Select',
      prompt: 'Select the IV-direct product.',
      aidRef: 'p.12 step 2',
      rule: 'Select product and click OK. The Order Type tab is only available for medications that can be administered multiple ways, such as IV-direct or IV intermittent.',
      correct: 'Move',
      wrong: [{ label: 'Select' }, { label: 'Reset' }],
    },
    {
      id: 'ok-verify-med-window',
      location: 'Verify Med Order',
      prompt: 'The window is now the more appropriate "Verify Med Window" for this IV-direct order. Finalize it.',
      aidRef: 'p.13 step 3',
      rule: 'The verify window will now be a "Verify Med Window", which is more appropriate for this IV-direct order — it does not require Total volume, Rate, or Infuse over time. Click OK to verify.',
      correct: [{ label: 'OK', next: 'submit-order-type' }],
      wrong: [{ label: 'Reject' }, { label: 'Cancel' }],
    },
    {
      id: 'submit-order-type',
      location: 'Medication Manager',
      prompt: 'Complete the verification.',
      aidRef: 'p.13 step 4',
      rule: 'Click Submit.',
      correct: [{ label: 'Submit', next: null }],
      wrong: [{ label: 'Cancel' }, { label: 'Apply' }],
    },
  ],
};
