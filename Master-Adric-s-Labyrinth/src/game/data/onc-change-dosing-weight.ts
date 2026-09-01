import type { WorkflowDef } from '../types';

/**
 * Transcribed from: "Oncology Pharmacist Verification" (NS Health / IWK
 * Health, One Person One Record), "Changing Dosing Weight", pages 24-25.
 *
 * The job aid gives two independent, equally valid methods (a Powerform vs.
 * iView) — modelled here as a genuine branch rather than two workflows,
 * since both begin from the same Navigator Bar choice and converge on the
 * same Refresh step.
 */
export const oncChangeDosingWeight: WorkflowDef = {
  id: 'onc-change-dosing-weight',
  title: 'Changing Dosing Weight',
  sector: 'verify-order',
  jobAid: 'oncology',
  source: 'Oncology Pharmacist Verification (pp. 24-25)',
  hints: 2,
  patience: 3,
  briefing: [
    "The patient's weight has changed, and every weight-based measure in the calculator still remembers the old one.",
    'Two roads lead to the same correction. Take either — just take it.',
  ],
  outro: ['The banner reads true again. Every weight-based dose from here follows the new number.'],
  steps: [
    {
      id: 'choose-weight-update-method',
      location: 'Navigator Bar',
      prompt: "The patient's Dosing Weight on the Banner Bar is out of date. Update it — either method reaches the same result.",
      aidRef: 'p.24',
      rule: 'Update the Dosing Weight using either a Powerform (AdHoc) or iView (ONC System Assessment).',
      correct: [
        {
          label: 'AdHoc',
          note: 'Powerform method: chart the Pharmacist Dosing Weight Review.',
          next: 'chart-dosing-weight-powerform',
        },
        {
          label: 'iView',
          note: 'iView method: document Height/Weight under ONC System Assessment.',
          next: 'document-weight-iview',
        },
      ],
      wrong: [{ label: 'MAR Summary' }],
    },
    {
      id: 'chart-dosing-weight-powerform',
      location: 'Ad Hoc Charting',
      prompt: 'Chart the new dosing weight through the Powerform.',
      aidRef: 'p.24',
      rule: 'Select the Pharmacist Dosing Weight Review (or Height, Weight and Allergy) and click Chart, then input the New Dosing Weight, click the green checkmark, and Sign.',
      correct: [{ label: 'New Dosing Weight', next: 'refresh-banner-bar' }],
      wrong: [{ label: 'Dosing Weight Reviewed' }, { label: 'Dosing Weight Adjustment Needed' }],
    },
    {
      id: 'document-weight-iview',
      location: 'iView — ONC System Assessment — Measurements',
      prompt: 'Document the new measurement through iView instead.',
      aidRef: 'p.25',
      rule: 'Select ONC System Assessment, expand Measurements, document Height Measured & Weight Measured, click the green checkmark, then click the BSA Calculator to recalculate BSA and click the green checkmark to Sign.',
      correct: [{ label: 'Weight Measured', next: 'refresh-banner-bar' }],
      wrong: [{ label: 'Patient Stated Height/Length' }, { label: 'Height/Length Measured' }],
    },
    {
      id: 'refresh-banner-bar',
      location: 'PowerChart — Banner Bar',
      prompt: 'The new weight is signed but the banner still shows the old one. Bring it current.',
      aidRef: 'p.24',
      rule: 'Click Refresh — the Dose Weight will update in the Banner bar and be used in the Dosage Calculator for weight-based orders.',
      correct: [{ label: 'Refresh', next: null }],
      wrong: [{ label: 'Full screen' }, { label: 'Recent' }],
    },
  ],
};
