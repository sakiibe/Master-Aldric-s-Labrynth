import type { WorkflowDef } from '../types';

/**
 * Transcribed from: "Oncology Pharmacist Verification" (NS Health / IWK
 * Health, One Person One Record), "Verifying an IV set" — "Clinical
 * Verification", page 1.
 *
 * This is the Powerplan-level clinical sign-off (regimen appropriate,
 * funding, bloodwork, BSA), distinct from the per-order "1st/2nd
 * Verification" workflows that follow it for each product type.
 */
export const oncClinicalVerification: WorkflowDef = {
  id: 'onc-clinical-verification',
  title: 'Clinical Verification of Systemic Therapy',
  sector: 'verify-order',
  jobAid: 'oncology',
  source: 'Oncology Pharmacist Verification (p. 1)',
  hints: 1,
  patience: 2,
  briefing: [
    'Before a single vial is drawn, the whole working must be judged sound — the regimen, the funding, the bloodwork, all of it.',
    'This is the first ward against a mistaken brew: your name, your judgement, against the whole Powerplan.',
  ],
  outro: ['A green mark stands where your judgement was given. The Powerplan may proceed.'],
  steps: [
    {
      id: 'open-stc-powerform',
      location: 'AdHoc folder — Toolbar',
      prompt:
        'The systemic therapy Powerplan needs its clinical verification completed before pharmacy can proceed. Open the right form.',
      aidRef: 'p.1 step 2',
      rule: 'In the AdHoc folder on the Toolbar, select the Pharmacy STC Verification Powerform and Chart.',
      correct: 'Pharmacy STC Verification',
      wrong: [{ label: 'BPMH Documentation' }, { label: 'Height, Weight and Allergy' }],
    },
    {
      id: 'sign-stc-form',
      location: 'Pharmacy STC Verification Day 1',
      prompt:
        'Every field — orders signed by the oncology provider, regimen appropriateness, funding, bloodwork, BSA — is reviewed and correct. Finalize the form.',
      aidRef: 'p.1 step 2',
      rule: 'Complete & Sign the form via the green checkmark.',
      correct: [{ label: 'green checkmark (Sign)', next: null }],
      wrong: [
        { label: 'Cancel', needsReview: true },
        { label: 'Close', needsReview: true },
      ],
    },
  ],
};
