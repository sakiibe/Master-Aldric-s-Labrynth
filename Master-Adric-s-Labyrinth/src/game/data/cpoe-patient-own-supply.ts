import type { WorkflowDef } from '../types';

/**
 * Transcribed from: "CPOE - Powerchart" (NS Health / IWK Health, One Person
 * One Record), "Ordering a Patient Own Supply", page 8.
 *
 * The same "Use Patient Supply" toggle also appears in the BPMH admission
 * reconciliation workflow (`bpmh-admission-med-rec`, step `patient-own-supply`)
 * — there it is reached from Order Reconciliation; here it is reached from a
 * fresh CPOE order. Keep the rule text for the toggle itself consistent
 * between the two if either is revised.
 */
export const cpoePatientOwnSupply: WorkflowDef = {
  id: 'cpoe-patient-own-supply',
  title: 'Ordering a Patient Own Supply',
  sector: 'order-entry',
  jobAid: 'cpoe',
  source: 'CPOE - Powerchart (p. 8)',
  hints: 1,
  patience: 2,
  briefing: [
    'The patient carries their own vial from home. There is no need to draw a fresh one from the shelf — only to say so.',
  ],
  outro: ['Marked, signed. Their own supply, properly accounted for.'],
  steps: [
    {
      id: 'use-patient-supply',
      location: 'Details for citalopram — new order',
      prompt:
        'The patient brought their own supply of this medication from home. Record that before signing.',
      aidRef: 'p.8',
      rule: 'Select the "Use Patient Supply" field in the Details section of the new order, then click Sign.',
      correct: [{ label: 'Use Patient Supply: Yes', next: null }],
      wrong: [
        {
          label: 'Use Patient Supply: No',
          rule: 'Select Yes under Use Patient Supply — No means the medication will be supplied by the facility instead of the patient’s own supply.',
          source: 'job-aid',
          aidRef: 'p.8',
        },
        { label: 'Special Instructions' },
      ],
    },
  ],
};
