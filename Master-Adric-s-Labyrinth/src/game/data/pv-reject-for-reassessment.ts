import type { WorkflowDef } from '../types';

/**
 * Transcribed from: "Pharmacist Verification & Med Manager v.1" (NS Health /
 * IWK Health, One Person One Record), "Clarification – Rejecting or
 * Re-entering" — "The initial order is not appropriate and requires the
 * initial prescriber/team to re-assess", pages 26-28.
 */
export const pvRejectForReassessment: WorkflowDef = {
  id: 'pv-reject-for-reassessment',
  title: 'Rejecting an Order for Reassessment',
  sector: 'verify-order',
  jobAid: 'verification',
  source: 'Pharmacist Verification & Med Manager v.1 (pp. 26-28)',
  hints: 2,
  patience: 4,
  requires: ['pv-void-reenter-order'],
  briefing: [
    'Nothing here was mis-cast — it was simply the wrong recipe for what ails this patient. That is the prescriber’s judgement to revisit, not yours to overwrite.',
  ],
  outro: [
    'Declined, documented, and sent back for a second look. The patient waits a little longer, but safely.',
  ],
  steps: [
    {
      id: 'review-labs-and-comments',
      location: 'PowerChart — Results Review / Verify window Comments',
      prompt: 'This caspofungin dose looks off for an unclear indication. Investigate before acting.',
      aidRef: 'p.26 steps 1-2',
      rule: 'In the Verify window, review the Dose and Frequency. Click the PowerChart icon to review labs and microbiology via Results Review, then click the Comments tab to review the antimicrobial indication.',
      correct: 'Comments',
      wrong: [{ label: 'Product' }, { label: 'Order Type' }],
    },
    {
      id: 'complete-rx-intervention-reject',
      location: 'Rx Intervention',
      prompt: 'Document the clinical concern formally before rejecting.',
      aidRef: 'p.27 steps 3-4',
      rule: 'Select the Rx Intervention tab in the Verify Order Window, select the appropriate Powerform, click Chart, complete it, click the green checkmark, and Sign.',
      correct: 'Rx Intervention',
      wrong: [{ label: 'Alert History' }, { label: 'Lot Info' }],
    },
    {
      id: 'reject-order',
      location: 'Verify window',
      prompt: 'The dose is not appropriate and needs the prescriber to reassess it. Decline the order rather than verifying it.',
      aidRef: 'p.27 step 5',
      rule: 'Click Reject in the Verify Window.',
      correct: [{ label: 'Reject', next: 'submit-rejection' }],
      wrong: [{ label: 'OK' }, { label: 'Cancel' }],
    },
    {
      id: 'submit-rejection',
      location: 'Medication Manager',
      prompt: 'Complete the rejection — it will route to the prescriber’s Message Center.',
      aidRef: 'p.27 step 6',
      rule: 'Click Submit. The rejected order routes to the initial prescriber’s Message Center. Nursing may still administer a rejected medication; it will show a pharmacist-rejected icon and alert on the MAR.',
      correct: [{ label: 'Submit', next: 'receive-new-order' }],
      wrong: [{ label: 'Cancel' }, { label: 'Apply' }],
    },
    {
      id: 'receive-new-order',
      location: 'Message Center / new order',
      prompt: 'The prescriber responds with a corrected order over the phone. Receive it and clean up the rejected one.',
      aidRef: 'p.28 steps 9-11',
      rule: 'Receive/enter the new order (and Discontinue/Void the previous one). Change the Physician to the prescriber placing the new order, and set Communication type to Verbal or Phone with Read Back — this routes to that prescriber for co-signature.',
      correct: 'Communication type',
      wrong: [{ label: 'Physician' }, { label: 'Dispense category' }],
    },
    {
      id: 'ok-verify-new-order-reject',
      location: 'Verify window',
      prompt: 'Finalize the corrected order.',
      aidRef: 'p.28 step 12',
      rule: 'Click OK to verify the order.',
      correct: [{ label: 'OK', next: null }],
      wrong: [{ label: 'Reject' }, { label: 'Cancel' }],
    },
  ],
};
