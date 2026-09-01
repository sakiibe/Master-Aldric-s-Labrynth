import type { WorkflowDef } from '../types';

/**
 * Transcribed from: "CPOE - Powerchart" (NS Health / IWK Health, One Person
 * One Record), "Cancel/Discontinue an Order in Powerchart" — specifically
 * "Change a continuous infusion with a normalized rate to a titratable
 * infusion", pages 4-5.
 */
export const cpoeConvertToTitratable: WorkflowDef = {
  id: 'cpoe-convert-to-titratable',
  title: 'Convert a Normalized-Rate Infusion to Titratable',
  sector: 'infusions',
  jobAid: 'cpoe',
  source: 'CPOE - Powerchart (pp. 4-5)',
  hints: 2,
  patience: 4,
  requires: ['cpoe-modify-infusion-rate'],
  briefing: [
    'A fixed drip is no longer enough — the patient needs a brew that responds to them, titrated moment to moment.',
    'The old order cannot simply be edited into this shape. It must end, and a new one must be cast in its place.',
    'Mind the pediatric vessels on the shelf — they look alike, but are not for this patient.',
  ],
  outro: [
    'The old drip is silenced; the titratable one answers to the patient now.',
    'Two orders for one drip. I begin to see the shape of this discipline.',
  ],
  steps: [
    {
      id: 'cancel-discontinue-infusion',
      location: 'IV Solutions/Infusions',
      prompt:
        'The fentanyl infusion is changing from a normalized rate to a titratable order. Remove the old order first.',
      aidRef: 'p.4 step 1',
      rule: 'Right click and Cancel/Discontinue the continuous infusion.',
      correct: 'Cancel/Discontinue',
      wrong: [{ label: 'Suspend' }, { label: 'Void' }],
    },
    {
      id: 'sign-discontinue',
      location: 'Orders for Signature',
      prompt: 'Finalize the discontinuation.',
      aidRef: 'p.4 step 2',
      rule: 'Click Orders for Signature and Sign.',
      correct: 'Sign',
      wrong: [{ label: 'Reset' }, { label: 'Dx Table' }],
    },
    {
      id: 'add-titratable-order',
      location: 'Add Order Search box',
      prompt: 'Search for the replacement order — it must support titration.',
      aidRef: 'p.5 step 3',
      rule: 'Add a new order and search/select an order sentence with "titratable" in the order name.',
      correct: 'fentanyl titratable infusion (10 mcg/mL) in NaCl 0.9% 100 mL',
      wrong: [
        {
          label: 'fentanyl NEO/PED titrate infusion 10 mcg/mL in NaCl 0.9% 25 mL syringe',
          rule: 'PED and NEO/PED order sentences are for pediatric or neonatal dosing — adult dosing has nothing additional in the order name.',
          source: 'job-aid',
          aidRef: 'p.5 step 3 note',
        },
        {
          label:
            'fentanyl PED PICU FLUID REST titrate 50 mcg/mL (greater than 10 kg) in 40 mL (undiluted)',
          rule: 'PED and NEO/PED order sentences are for pediatric or neonatal dosing — adult dosing has nothing additional in the order name.',
          source: 'job-aid',
          aidRef: 'p.5 step 3 note',
        },
      ],
    },
    {
      id: 'titrate-rate-field',
      location: 'Continuous Details — fentanyl (additive) titrate',
      prompt: 'The Rate field needs to reflect that this is a titrated infusion.',
      aidRef: 'p.5 step 4',
      rule: 'In Continuous Details, the Rate populates as free-text ("Titrate") — this can be changed to anything free-text.',
      correct: 'Rate: Titrate',
      wrong: [{ label: 'Normalized Rate' }, { label: 'Infuse Over' }],
    },
    {
      id: 'titration-oef',
      location: 'Details for fentanyl — Order Entry Format (OEF)',
      prompt: 'Record the titration parameters for this infusion.',
      aidRef: 'p.5 step 5',
      rule: 'The titratable order sentence has a different Order Entry Format with Starting Dose, Minimum Dose, Maximum Dose, and Titration Instructions — include the starting dose and review the titration instructions.',
      correct: 'Starting Dose',
      wrong: [{ label: 'IV Concentration' }, { label: 'Route of administration' }],
    },
    {
      id: 'sign-titratable',
      location: 'Orders for Signature',
      prompt: 'Everything is complete. Finalize the titratable order.',
      aidRef: 'p.5 step 6',
      rule: 'Click Sign.',
      correct: [{ label: 'Sign', next: null }],
      wrong: [{ label: 'Orders For Cosignature' }, { label: 'Dx Table' }],
    },
  ],
};
