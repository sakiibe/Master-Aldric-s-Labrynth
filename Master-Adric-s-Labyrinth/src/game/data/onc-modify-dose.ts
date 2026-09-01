import type { WorkflowDef } from '../types';

/**
 * Transcribed from: "Oncology Pharmacist Verification" (NS Health / IWK
 * Health, One Person One Record), "Modifying a Dose on Powerchart", pages
 * 18-20.
 */
export const oncModifyDose: WorkflowDef = {
  id: 'onc-modify-dose',
  title: 'Modifying a Dose on PowerChart',
  sector: 'verify-order',
  jobAid: 'oncology',
  source: 'Oncology Pharmacist Verification (pp. 18-20)',
  hints: 2,
  patience: 3,
  briefing: [
    'The oncologist wants a smaller pour this cycle — but the recipe itself, the Target, must not shift beneath it.',
    'Adjust the vessel, never the recipe. Cycle six must still remember what cycle one intended.',
  ],
  outro: ['Adjusted, reasoned, signed. The Target Dose stands untouched for next time.'],
  steps: [
    {
      id: 'navigate-oncp-powerplan',
      location: 'Orders tab — Plans/Oncology',
      prompt: "Navigate to this patient's chemotherapy Powerplan to adjust a dose.",
      aidRef: 'p.18 step 1',
      rule: 'Navigate to the Orders tab in PowerChart and select the "ONCP" Powerplan — click the + by Plans and + by Oncology.',
      correct: 'ONCP LY CHOP + riTUXimab',
      wrong: [{ label: 'ONC LY CHOP + riTUXimab' }, { label: 'Document In Plan' }],
    },
    {
      id: 'open-dose-calculator',
      location: 'riTUXimab (Ruxience oncology) — unsigned order',
      prompt: 'The order is not yet signed. Open the tool that lets you adjust its dose safely.',
      aidRef: 'p.18 step 2',
      rule: 'Click the Dose Calculator icon by the medication if the order is not signed yet — always use the Dosage Calculator to change the dose so the Target Dose is maintained for subsequent cycles.',
      correct: 'Dose Calculator icon',
      wrong: [
        {
          label: 'Modify',
          rule: 'If the order is already signed, right click and select Modify instead — this order is not signed yet, so open the Dose Calculator icon directly.',
          source: 'job-aid',
          aidRef: 'p.18 step 2',
        },
        { label: 'Ingredient Details' },
      ],
    },
    {
      id: 'change-dose-adjustment',
      location: 'Dosage Calculator — riTUXimab (Ruxience) oncology',
      prompt: 'The oncologist wants a 5% dose reduction, discussed and documented. Adjust the dose without disturbing the Target Dose.',
      aidRef: 'p.19 step 3',
      rule: 'Change the Dose Adjustment field and select an Adjust Reason or free text in the box. Click Apply Dose. Do NOT change the Target Dose.',
      correct: 'Dose Adjustment',
      wrong: [
        {
          label: 'Target dose',
          rule: 'Do NOT change the Target Dose — only the Dose Adjustment (or Final dose) field via the Dosage Calculator, so the Target Dose is preserved for subsequent cycles.',
          source: 'job-aid',
          aidRef: 'p.19 step 3, note',
        },
        { label: 'Standard dose' },
      ],
    },
    {
      id: 'sign-modified-dose',
      location: 'Orders for Signature',
      prompt: 'The dose adjustment is applied and reasoned. Finalize the order.',
      aidRef: 'p.19 step 4',
      rule: 'Click Orders for Signature and Sign — if this is a verbal order from an oncologist, right click the order on the Powerplan and click "Ordering Physician" first.',
      correct: [{ label: 'Sign', next: null }],
      wrong: [
        {
          label: 'Ordering Physician',
          rule: 'Ordering Physician is only needed first when signing a verbal or phone order from an oncologist — for signing independently, go straight to Orders for Signature and Sign.',
          source: 'job-aid',
          aidRef: 'p.19 step 4',
        },
        { label: 'Reset' },
      ],
    },
  ],
};
