import type { WorkflowDef } from '../types';

/**
 * Transcribed from: "Oncology Pharmacist Verification" (NS Health / IWK
 * Health, One Person One Record), "Verifying a Syringe" — 1st Verification,
 * pages 9-10.
 *
 * Scope note: only the 1st verification is modelled in detail — the 2nd
 * verification repeats the same Process -> Apply -> Action History OK ->
 * re-check "x syringes..." -> OK -> Submit shape already taught in full in
 * `onc-verify-iv-set`. See the `note` on the final step.
 */
export const oncVerifySyringe: WorkflowDef = {
  id: 'onc-verify-syringe',
  title: 'Verifying a Syringe',
  sector: 'verify-order',
  jobAid: 'oncology',
  source: 'Oncology Pharmacist Verification (pp. 9-10)',
  hints: 2,
  patience: 3,
  briefing: [
    'Not every dose fills a bag — some go into a syringe, and the count of syringes matters as much as the measure.',
  ],
  outro: ['One syringe, or several — either way, the label now says exactly which.'],
  steps: [
    {
      id: 'select-syringe-iv-set',
      location: 'Manual Product Select — DOXOrubicin',
      prompt: 'Syringes are built as IV sets, not as standalone products. Choose the correct one.',
      aidRef: 'p.9 step 4',
      rule: 'Manually select a Product or IV set, or click the Products tab to view all options — syringes will be in IV sets.',
      correct: 'DOXOrubicin _ mg IV direct',
      wrong: [
        { label: 'DOXOrubicin 2 mg/mL injection' },
        { label: 'sodium chloride 0.9% intravenous solution' },
      ],
    },
    {
      id: 'confirm-syringe-count-note',
      location: 'New Intermittent Order — Order comments',
      prompt:
        'The prescriber wants two syringes prepared for this dose. Confirm that instruction is documented before verifying.',
      aidRef: 'p.10 step 5',
      rule: 'Verify the order. Ensure the Order Comments or Product notes contain "x syringes with x mg (x mL) per syringe".',
      correct: 'Order comments',
      wrong: [{ label: 'Dosage form' }, { label: 'Communication type' }],
    },
    {
      id: 'verify-syringe-ok',
      location: 'New Intermittent Order',
      prompt: 'The syringe count is documented. Finalize the verification.',
      aidRef: 'p.10 step 6',
      rule: 'Click OK to Verify the order.',
      correct: [{ label: 'OK', next: 'submit-syringe' }],
      wrong: [{ label: 'Reject' }, { label: 'Modify' }],
    },
    {
      id: 'submit-syringe',
      location: 'Medication Manager',
      prompt: 'Complete the verification.',
      aidRef: 'p.10 step 7',
      rule: 'Click Submit in Medication Manager.',
      correct: 'Submit',
      wrong: [{ label: 'Cancel' }, { label: 'Apply' }],
    },
    {
      id: 'activate-syringe',
      location: 'PowerChart — Systemic Therapy section',
      prompt: 'Send the order on to its second verification.',
      aidRef: 'p.10 step 8',
      rule: 'Navigate back to PowerChart and Activate the Days to prepare.',
      note: 'The 2nd verification for a syringe repeats the same Process → Apply → Action History OK → re-check "x syringes..." → OK → Submit pattern shown in Verifying a Regular IV Set.',
      correct: [{ label: 'Activate', next: null }],
      wrong: [{ label: 'Renew' }, { label: 'Suspend' }],
    },
  ],
};
