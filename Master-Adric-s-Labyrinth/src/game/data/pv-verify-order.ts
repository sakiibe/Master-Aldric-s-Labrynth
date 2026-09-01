import type { WorkflowDef } from '../types';

/**
 * Transcribed from: "Pharmacist Verification & Med Manager v.1" (NS Health /
 * IWK Health, One Person One Record), "Verify an Order in Medication
 * Manager", pages 1-4.
 *
 * The foundational verification workflow — the general, non-oncology
 * counterpart to `onc-verify-iv-set`. No Cutover facility/location step and
 * no 1st/2nd split here; this is the everyday single-pass verification.
 */
export const pvVerifyOrder: WorkflowDef = {
  id: 'pv-verify-order',
  title: 'Verify an Order in Medication Manager',
  sector: 'verify-order',
  jobAid: 'verification',
  source: 'Pharmacist Verification & Med Manager v.1 (pp. 1-4)',
  hints: 3,
  patience: 5,
  briefing: [
    'A new brew awaits your seal of approval — the right vessel, the right measure, nothing added that was not asked for.',
    'This is the everyday shape of the working. Learn it well; every other verification bends back to this one.',
  ],
  outro: [
    'Signed, sealed, submitted. The brew moves on, exactly as it should.',
    'You checked it twice without my asking. I begin to trust this discipline.',
  ],
  steps: [
    {
      id: 'process-inpatient-order',
      location: 'Pharmacy Patient Monitor — Inpatient orders',
      prompt: 'STAT and NOW orders need verifying first. Begin working this cefazolin order.',
      aidRef: 'p.1 step 1',
      rule: 'From Pharmacy Patient Monitor, click Process under the Inpatient orders section — verify STAT (red band) or NOW (orange band) orders first.',
      correct: 'Process',
      wrong: [
        {
          label: 'View',
          rule: 'View opens Medication Manager without associating the order with the Verify action — click Process instead to begin verifying.',
          source: 'job-aid',
          aidRef: 'p.1 step 1',
        },
        { label: 'Suspend' },
      ],
    },
    {
      id: 'apply-verify-medmanager',
      location: 'Medication Manager — Acute Profile',
      prompt: 'The verify action already defaulted. Begin.',
      aidRef: 'p.1 step 2',
      rule: 'Medication Manager automatically displays, and the verify action defaults. Click Apply.',
      correct: 'Apply',
      wrong: [{ label: 'Submit' }, { label: 'Cancel' }],
    },
    {
      id: 'confirm-product-tab',
      location: 'Verify window',
      prompt: 'An auto-product was assigned to the IV set, but this order needs the pre-mixed bag instead. Confirm the correct product.',
      aidRef: 'p.1 step 3',
      rule: 'Complete a Manual Product Selection if needed — click the Product tab in the Verify window to confirm the correct product was selected. All pre-mixed bags are in the Products tab, not the IV Set tab.',
      correct: 'Product',
      wrong: [{ label: 'Printing' }, { label: 'Comments' }],
    },
    {
      id: 'move-premixed-bag',
      location: 'Manual Product Select',
      prompt: 'Move the pre-mixed bag into the selected products, then remove what auto-selected in its place.',
      aidRef: 'p.2',
      rule: 'Select the product (pre-mixed bag) or IV set (compounded), click Move, and click OK. Then move the wrong 1000 mg injection back to the Products tab.',
      correct: 'Move',
      wrong: [{ label: 'Reset' }, { label: 'Select' }],
    },
    {
      id: 'remove-extra-diluent',
      location: 'Verify Intermittent Order',
      prompt: 'The pre-mixed bag already contains its own diluent. Remove the separate sodium chloride line so the total volume is correct.',
      aidRef: 'p.2',
      rule: 'Click on the sodium chloride 0.9% and click Remove — the remaining product will be the pre-mixed bag. Confirm the Total volume is correct.',
      correct: 'Remove',
      wrong: [{ label: 'Update' }, { label: 'Modify' }],
    },
    {
      id: 'confirm-ordered-as',
      location: 'Verify Intermittent Order window',
      prompt: 'Nothing about the drug identity itself should change here — only the dose, via Modify.',
      aidRef: 'p.3',
      rule: 'Do not change the Ordered As field — that requires Cancel and Void and a new order. Modify changes the dose instead.',
      correct: 'Modify',
      wrong: [
        {
          label: 'Ordered As',
          rule: 'Do not change the Ordered As field — Cancel and Void and create a new order instead if the drug identity itself is wrong. Use Modify to change the dose.',
          source: 'job-aid',
          aidRef: 'p.3',
        },
        { label: 'Total volume mL' },
      ],
    },
    {
      id: 'add-order-comments',
      location: 'Verify Intermittent Order — Order comments',
      prompt: "The prescriber wants this re-assessed in 5 days. Document that so it's face-up on the MAR.",
      aidRef: 'p.3',
      rule: 'Add pertinent information in the Order comments section — this crosses over from CPOE.',
      correct: 'Order comments',
      wrong: [{ label: 'Product notes' }, { label: 'Sequence' }],
    },
    {
      id: 'review-comments-tab',
      location: 'Comments tab',
      prompt: 'This is an antimicrobial — a specific field is mandatory. Complete it.',
      aidRef: 'p.4',
      rule: 'Review the Comments tab — Antimicrobial Indication is a required field for all Antimicrobials.',
      correct: 'Antimicrobial Indication',
      wrong: [{ label: 'Control number' }, { label: 'Fill notes' }],
    },
    {
      id: 'verify-window-ok',
      location: 'Verify window',
      prompt: 'Everything is confirmed. Finalize the verification.',
      aidRef: 'p.4 step 4',
      rule: 'Click OK to Verify the order, Reject to decline the order, or Cancel to stop the verification.',
      correct: [{ label: 'OK', next: 'submit-verification' }],
      wrong: [{ label: 'Reject' }, { label: 'Cancel' }],
    },
    {
      id: 'submit-verification',
      location: 'Medication Manager',
      prompt: 'Complete the verification.',
      aidRef: 'p.4 step 5',
      rule: 'Click Submit in Medication Manager. A double chevron symbol indicates the action is complete but NOT submitted, and will remain as a pending action.',
      correct: [{ label: 'Submit', next: null }],
      wrong: [{ label: 'Cancel' }, { label: 'Apply' }],
    },
  ],
};
