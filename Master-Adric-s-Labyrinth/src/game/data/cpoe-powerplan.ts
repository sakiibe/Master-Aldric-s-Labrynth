import type { WorkflowDef } from '../types';

/**
 * Transcribed from: "CPOE - Powerchart" (NS Health / IWK Health, One Person
 * One Record), "Ordering a Powerplan in Powerchart", pages 9-11.
 */
export const cpoePowerplan: WorkflowDef = {
  id: 'cpoe-powerplan',
  title: 'Ordering a Powerplan',
  sector: 'order-entry',
  jobAid: 'cpoe',
  source: 'CPOE - Powerchart (pp. 9-11)',
  hints: 2,
  patience: 3,
  briefing: [
    'Some rituals are too large for one incantation — a whole admission’s worth of orders, bundled as one grand working.',
    'Not every clause casts itself. Some wait, dormant, for your hand.',
    'And a working left merely planned protects no one — it must be woken.',
  ],
  outro: [
    'The whole bundle stands initiated and signed — diet, vitals, medications, all at once.',
    'One incantation, a dozen effects. I admit it: I am impressed.',
  ],
  steps: [
    {
      id: 'search-powerplan',
      location: 'Orders tab — Add Order Search box',
      prompt: 'The patient is being admitted to Medicine. Find the admission order set.',
      aidRef: 'p.9 steps 1-2',
      rule: 'Click Add and search for a Powerplan — try general terms like "Admission" or "Post-op" to find it easily.',
      correct: 'MED Admission to Medicine',
      wrong: [{ label: 'acetaminophen' }, { label: 'Template Non-Form' }],
    },
    {
      id: 'select-powerplan-orders',
      location: 'MED Admission to Medicine — Powerplan orders',
      prompt:
        'Some orders in this Powerplan are pre-selected; the prescriber also wants Vital Signs/Monitoring included. Select it.',
      aidRef: 'p.10 step 4',
      rule: 'Some orders are pre-selected (a checkmark in the box); others require manual selection. Orders are categorized into sections, e.g. Diet, Vital Signs/Monitoring, Medications.',
      correct: 'Vital Signs/Monitoring',
      wrong: [{ label: 'Interprofessional Consults' }, { label: 'Suggested Plans' }],
    },
    {
      id: 'initiate-now',
      location: 'MED Admission to Medicine — Powerplan footer',
      prompt: 'The order selections are complete. Activate the orders now, rather than leaving them planned.',
      aidRef: 'p.10 step 5',
      rule: 'Click Initiate Now — Plan for Later does not route medication orders to Pharmacy Patient Monitor for verification; only Initiate Now activates the orders.',
      correct: 'Initiate Now',
      wrong: [
        {
          label: 'Plan for Later',
          rule: 'Plan for Later leaves the Powerplan Planned rather than active — it does not route medication orders to Pharmacy Patient Monitor for verification. Click Initiate Now instead.',
          source: 'job-aid',
          aidRef: 'p.10 step 5 note',
        },
        { label: 'Add to Phase' },
      ],
    },
    {
      id: 'orders-for-signature-powerplan',
      location: 'MED Admission to Medicine',
      prompt: 'The Powerplan is initiated. Move to review and sign the orders it placed.',
      aidRef: 'p.10 step 6',
      rule: 'Click Orders for Signature.',
      correct: 'Orders For Signature',
      wrong: [{ label: 'Check Alerts' }, { label: 'Add Comments' }],
    },
    {
      id: 'sign-powerplan',
      location: 'Orders for Signature',
      prompt: 'The Powerplan’s orders are reviewed. Finalize them.',
      aidRef: 'p.10 step 7',
      rule: 'Review the order and click Sign.',
      correct: [{ label: 'Sign', next: null }],
      wrong: [{ label: 'Orders For Nurse Review' }, { label: 'Dx Table' }],
    },
  ],
};
