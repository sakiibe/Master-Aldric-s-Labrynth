import type { WorkflowDef } from '../types';

/**
 * Transcribed from: "Oncology Pharmacist Verification" (NS Health / IWK
 * Health, One Person One Record), "Skipping a Regimen", pages 22-23.
 */
export const oncSkipRegimen: WorkflowDef = {
  id: 'onc-skip-regimen',
  title: 'Skipping a Regimen',
  sector: 'verify-order',
  jobAid: 'oncology',
  source: 'Oncology Pharmacist Verification (pp. 22-23)',
  hints: 1,
  patience: 2,
  requires: ['onc-pretreatment-powerplan'],
  briefing: [
    'Not every cycle proceeds on schedule. Sometimes the correct action is to pass this one by, cleanly, and move to the next.',
  ],
  outro: ['This cycle stands aside. The next one waits, undisturbed.'],
  steps: [
    {
      id: 'search-regimen',
      location: 'Orders — Add Order Search box',
      prompt: 'A cycle needs to be skipped for this regimen. Find it first.',
      aidRef: 'p.22 step 2',
      rule: 'Search for a Regimen by typing "ONC" (ONC = Regimen).',
      correct: 'ONC LY CHOP + riTUXimab',
      wrong: [
        { label: 'ONCP LY CHOP + riTUXimab Cycle 1' },
        { label: 'ONCP LY CHOP + niMOtuzumab' },
      ],
    },
    {
      id: 'confirm-add-regimen',
      location: 'Add Regimen — ONC LY CHOP + riTUXimab',
      prompt: 'The estimated start date is confirmed for this cycle. Continue.',
      aidRef: 'p.23 step 3',
      rule: 'Complete the information in the Add Plan box — enter the cycle, visit start time, and estimated start date — and click OK. Information should auto-populate for future cycles.',
      correct: 'Est. Start',
      wrong: [{ label: 'Intent Of Therapy' }, { label: 'Line of Therapy' }],
    },
    {
      id: 'skip-cycle',
      location: 'Regimen Phase — Chemotherapy Cycle',
      prompt: 'This cycle is being skipped. Move on to the next Powerplan.',
      aidRef: 'p.23 step 4',
      rule: 'The Regimen Phase-Chemotherapy Cycle displays in the details panel — click Skip to move to the next Powerplan.',
      correct: [{ label: 'Skip', next: null }],
      wrong: [{ label: 'Start' }, { label: 'Extend' }],
    },
  ],
};
