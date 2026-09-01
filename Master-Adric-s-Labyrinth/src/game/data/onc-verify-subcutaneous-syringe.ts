import type { WorkflowDef } from '../types';

/**
 * Transcribed from: "Oncology Pharmacist Verification" (NS Health / IWK
 * Health, One Person One Record), "Verifying an Subcutaneous Syringe" — 1st
 * Verification, pages 15-16.
 *
 * Scope note: only the 1st verification is modelled in detail — the 2nd
 * verification repeats the shared Process -> Apply -> Action History OK ->
 * reselect the IV set -> OK -> Submit shape already taught in full in
 * `onc-verify-iv-set`.
 */
export const oncVerifySubcutaneousSyringe: WorkflowDef = {
  id: 'onc-verify-subcutaneous-syringe',
  title: 'Verifying a Subcutaneous Syringe',
  sector: 'verify-order',
  jobAid: 'oncology',
  source: 'Oncology Pharmacist Verification (pp. 15-16)',
  hints: 2,
  patience: 3,
  requires: ['onc-verify-infusor'],
  briefing: [
    'The needle is shallow this time, not deep — but do not mistake that for a lesser working. The label rules stay the same.',
  ],
  outro: ['Verified under the skin, labelled the same as any hazardous brew.'],
  steps: [
    {
      id: 'select-subcut-iv-set',
      location: 'Manual Product Select — azaCITIDine',
      prompt: "Subcutaneous syringes are built as IV sets too. Make sure you're selecting from the right tab.",
      aidRef: 'p.15 step 4',
      rule: 'Manually select a Product or IV set, or click the Products tab to view all options — ensure you are selecting the IV set.',
      correct: 'azaCITIDine _ mg subcut',
      wrong: [
        { label: 'azaCITIDine Peds _ mg in NaCl 0.9%' },
        { label: 'azaCITIDine 100 mg injection' },
      ],
    },
    {
      id: 'confirm-dispense-category-subcut',
      location: 'Verify Intermittent Protocol Order Days 1 to 7',
      prompt: "Double-check the Dispense category before verifying — it's easy to assume a subcutaneous route changes it.",
      aidRef: 'p.16 note',
      rule: 'The Dispense category will be "IV Intermittent Hazardous" despite being a subcutaneous syringe — the Dispense category determines the label category.',
      correct: 'Dispense category: IV Intermittent Hazardous',
      wrong: [
        {
          label: 'Dispense category: Subcutaneous',
          rule: 'The Dispense category stays "IV Intermittent Hazardous" even for a subcutaneous syringe — it determines the label category, not the route.',
          source: 'job-aid',
          aidRef: 'p.16 note',
        },
        { label: 'Route: subcut', needsReview: true },
      ],
    },
    {
      id: 'verify-subcut-ok',
      location: 'Verify Intermittent Protocol Order Days 1 to 7',
      prompt: 'Review the relevant information, check the Comments for any additional notes, and finalize.',
      aidRef: 'p.16 step 5',
      rule: 'Review the relevant information, click the Comments button to review any additional notes, and click OK to verify.',
      correct: [{ label: 'OK', next: 'submit-subcut' }],
      wrong: [{ label: 'Reject' }, { label: 'Modify' }],
    },
    {
      id: 'submit-subcut',
      location: 'Medication Manager',
      prompt: 'Complete the verification.',
      aidRef: 'p.16',
      rule: 'Click Submit in Medication Manager.',
      correct: [{ label: 'Submit', next: null }],
      wrong: [{ label: 'Cancel' }, { label: 'Apply' }],
    },
  ],
};
