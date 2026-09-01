import type { WorkflowDef } from '../types';

/**
 * Transcribed from: "Oncology Pharmacist Verification" (NS Health / IWK
 * Health, One Person One Record), "Verifying a Total Volume IV Set" — 1st
 * Verification, pages 11-12.
 *
 * Scope note: only the 1st verification is modelled in detail — the 2nd
 * verification repeats the shared Process -> Apply -> Action History OK ->
 * re-check the drug/diluent volume -> OK -> Submit shape already taught in
 * full in `onc-verify-iv-set`. See the `note` on the final step.
 */
export const oncVerifyTotalVolumeIvSet: WorkflowDef = {
  id: 'onc-verify-total-volume-iv-set',
  title: 'Verifying a Total Volume IV Set',
  sector: 'verify-order',
  jobAid: 'oncology',
  source: 'Oncology Pharmacist Verification (pp. 11-12)',
  hints: 2,
  patience: 4,
  requires: ['onc-verify-syringe'],
  briefing: [
    'Here the bag itself is the measure — the diluent is not an afterthought, it is arithmetic that must be exact.',
  ],
  outro: ['The total volume reads true. Concentration, dose, and math all agree.'],
  steps: [
    {
      id: 'select-total-volume-iv-set',
      location: 'Manual Product Select — riTUXimab',
      prompt: 'This order needs a total-volume IV set, not a plain product. Find it.',
      aidRef: 'p.11 step 4',
      rule: 'Manually select a Product or IV set, or click the Products tab to view all options — total volume IV sets will have "total volume" in the name.',
      correct: 'riTUXimab (Ruxience) _ mg rapid infusion in NaCl 0.9% 250 mL total volume',
      wrong: [
        { label: 'riTUXimab (Ruxience) oncology' },
        { label: 'sodium chloride 0.9% intravenous solution' },
      ],
    },
    {
      id: 'quantity-per-dose-prompt',
      location: 'sodium chloride 0.9% 250 mL bag — dose prompt',
      prompt: "A prompt appears because the dose doesn't match the bag's dispensing strength. Answer it.",
      aidRef: 'p.11 note',
      rule: 'If prompted, input "1" in the Quantity per dose field and click OK.',
      correct: 'Quantity per dose: 1',
      wrong: [
        { label: 'Quantity per dose: 0', needsReview: true },
        { label: 'Cancel' },
      ],
    },
    {
      id: 'modify-diluent-dose',
      location: 'Verify Intermittent Protocol Order Day 1 — sodium chloride dose',
      prompt:
        'The order comments note a concentration of 3 mg/mL for a 575 mg dose. Work out the correct sodium chloride volume before entering it.',
      aidRef: 'p.11 step 5',
      rule: 'The Order Comments note the concentration — calculate the volume of Sodium Chloride to add to prepare the total dose (e.g. total volume for 575 mg at 3 mg/mL is 191.7 mL; subtract the drug volume from that to get the diluent volume), then click on the "X mL" Dose field for Sodium Chloride and click Modify.',
      correct: 'Modify',
      wrong: [{ label: 'Remove' }, { label: 'Update' }],
    },
    {
      id: 'enter-diluent-volume',
      location: 'sodium chloride 0.9% dose field',
      prompt: 'Enter the calculated diluent volume and commit it.',
      aidRef: 'p.11 step 5',
      rule: 'Input the correct mL for Sodium Chloride and click Update — the Total Volume field will then read the calculated total (191.7 mL).',
      correct: [{ label: 'Update', next: 'verify-total-volume-ok' }],
      wrong: [{ label: 'Modify' }, { label: 'Remove' }],
    },
    {
      id: 'verify-total-volume-ok',
      location: 'Verify Intermittent Protocol Order Day 1',
      prompt: 'The diluent volume is correct. Finalize the verification.',
      aidRef: 'p.12 step 6',
      rule: 'Click OK to Verify the order.',
      correct: [{ label: 'OK', next: 'submit-total-volume' }],
      wrong: [{ label: 'Reject' }, { label: 'Modify' }],
    },
    {
      id: 'submit-total-volume',
      location: 'Medication Manager',
      prompt: 'Complete the verification.',
      aidRef: 'p.12 step 7',
      rule: 'Click Submit in Medication Manager.',
      correct: 'Submit',
      wrong: [{ label: 'Cancel' }, { label: 'Apply' }],
    },
    {
      id: 'activate-total-volume',
      location: 'PowerChart — Systemic Therapy section',
      prompt: 'Send the order on to its second verification.',
      aidRef: 'p.12 step 8',
      rule: 'Navigate back to PowerChart and Activate the Days to prepare.',
      note: 'The 2nd verification repeats the shared Process → Apply → Action History OK → re-check the drug/diluent volume for the 3 mg/mL concentration → OK → Submit pattern — see Verifying a Regular IV Set.',
      correct: [{ label: 'Activate', next: null }],
      wrong: [{ label: 'Renew' }, { label: 'Suspend' }],
    },
  ],
};
