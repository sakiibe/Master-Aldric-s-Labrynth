import type { WorkflowDef } from '../types';

/**
 * Transcribed from: "CPOE - Powerchart" (NS Health / IWK Health, One Person
 * One Record), "Modify Continuous Infusion Rate in Powerchart", page 4.
 */
export const cpoeModifyInfusionRate: WorkflowDef = {
  id: 'cpoe-modify-infusion-rate',
  title: 'Modify a Continuous Infusion Rate',
  sector: 'infusions',
  jobAid: 'cpoe',
  source: 'CPOE - Powerchart (p. 4)',
  hints: 1,
  patience: 2,
  briefing: [
    'A steady drip must run faster now. Nothing else about the brew changes — only the flow.',
    'Find the right vessel, adjust the one number that matters, and let the rest be.',
  ],
  outro: ['The rate is updated. The drip continues, none the wiser.'],
  steps: [
    {
      id: 'right-click-infusion',
      location: 'IV Solutions/Infusions',
      prompt:
        'The fentanyl infusion rate needs to change to a new normalized rate. Begin.',
      aidRef: 'p.4 step 1',
      rule: 'Right click the infusion order and select Modify.',
      correct: 'Modify',
      wrong: [{ label: 'Copy' }, { label: 'Cancel and Reorder' }],
    },
    {
      id: 'continuous-details-rate',
      location: 'Continuous Details — Details for fentanyl (additive)',
      prompt: 'Update the infusion to the new rate.',
      aidRef: 'p.4 step 2',
      rule: 'In the Continuous Details section, change the Normalized Rate.',
      correct: 'Normalized Rate',
      wrong: [{ label: 'Bag Volume' }, { label: 'Infusion instructions' }],
    },
    {
      id: 'sign-infusion',
      location: 'Orders for Signature',
      prompt: 'The new rate is set. Finalize.',
      aidRef: 'p.4 step 3',
      rule: 'Click Orders for Signature and then Sign.',
      correct: [{ label: 'Sign', next: null }],
      wrong: [{ label: 'Suspend' }, { label: 'Activate' }],
    },
  ],
};
