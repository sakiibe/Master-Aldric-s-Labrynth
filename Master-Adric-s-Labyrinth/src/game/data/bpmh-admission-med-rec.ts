import type { WorkflowDef } from '../types';

/**
 * Transcribed from: "Document Home Meds & Admission Med Rec" (NS Health / IWK
 * Health, One Person One Record — BPMH & Admission Med Rec), pages 5–6.
 *
 * Gated behind the medication history workflow, because the aid gates it too:
 * the Meds History section must be completed first.
 */
export const admissionMedRec: WorkflowDef = {
  id: 'bpmh-admission-med-rec',
  title: 'Admission Medication Reconciliation',
  sector: 'bpmh',
  jobAid: 'bpmh',
  source: 'BPMH & Admission Med Rec (pp. 5–6)',
  hints: 2,
  patience: 3,
  requires: ['bpmh-document-med-hx'],
  briefing: [
    'The history is written. Now comes judgement: which of these home elixirs continue within these walls, and which stop at the threshold?',
    'Nothing may be signed while a required detail is missing. The system will tell you. It is not shy about it.',
    'Proceed, apprentice.',
  ],
  outro: [
    'Reconciled and signed. The green mark appears beside Admission.',
    'In my day this took three scribes and an argument.',
  ],
  steps: [
    {
      id: 'open-admission-rec',
      rule: 'Navigate to the Medication List or Orders tab and select Admission under Reconciliation. The Meds History section must be completed first.',
      location: 'Medication List tab — Reconciliation menu',
      prompt: 'The medication history is documented. Begin reconciling for this admission.',
      aidRef: 'p.5 step 1',
      correct: 'Admission',
      wrong: [
        { label: 'Transfer', needsReview: true },
        { label: 'Discharge to Home', needsReview: true },
      ],
    },
    {
      id: 'continue-or-stop',
      rule: 'In the Order Reconciliation window, click the circle under the green arrow to continue the home medication, or the red square to discontinue it.',
      location: 'Order Reconciliation: Admission',
      prompt:
        'Decide the fate of each home medication in the Orders Prior to Reconciliation column.',
      aidRef: 'p.5 step 2',
      correct: [
        {
          label: 'Circle under the green arrow',
          note: 'Continues the home medication.',
        },
        {
          label: 'Red square',
          note: 'Discontinues the home medication. Also a valid decision.',
        },
      ],
      wrong: [
        {
          label: 'Cancel',
          rule: 'Every home medication needs a decision — continue or discontinue. Leaving them undecided shows up as Missing Required Details.',
          source: 'job-aid',
          aidRef: 'p.5 step 2, "Ensure Missing Required Details is 0"',
        },
      ],
      note: 'Home medications are indicated by the scroll icon. Medications ordered for that encounter as an inpatient carry a hospital icon.',
    },
    {
      id: 'patient-own-supply',
      rule: 'Select Yes under Use Patient Own Supply to use the patient’s own supply.',
      location: 'Details for sertraline',
      prompt:
        'The patient brought their own supply of this medication from home. Record that.',
      aidRef: 'p.5 step 3',
      correct: 'Use Patient Own Supply: Yes',
      wrong: [
        {
          label: 'Use Patient Own Supply: No',
          rule: 'Select Yes to use Patient Own Supply. No means the medication will be supplied by the facility instead.',
          source: 'job-aid',
          aidRef: 'p.5 step 3',
        },
        { label: 'Special Instructions', needsReview: true },
      ],
    },
    {
      id: 'add-missed-med',
      rule: 'Click Add to search for and select additional home medications, with the Type box set to "Document Medication by Hx".',
      location: 'Order Reconciliation: Admission',
      prompt:
        'The patient mentions one more home medication that is not on the list. Add it.',
      aidRef: 'p.5 step 4',
      correct: '+ Add',
      wrong: [
        {
          label: 'Manage Plans',
          rule: 'To add a home medication here, use Add — and make sure the Type box is set to "Document Medication by Hx".',
          source: 'job-aid',
          aidRef: 'p.5 step 4',
        },
        { label: 'Dx Table', needsReview: true },
      ],
      note: 'When adding here, the Type box must still be set to "Document Medication by Hx".',
    },
    {
      id: 'reconcile-and-sign',
      rule: 'Click Reconcile and Sign to order the home medications as an inpatient.',
      location: 'Order Reconciliation: Admission — footer',
      prompt:
        'Missing Required Details reads 0. Order the continued home medications as an inpatient.',
      aidRef: 'p.5 step 5',
      correct: [{ label: 'Reconcile and Sign', next: null }],
      wrong: [
        {
          label: 'Reconcile and Plan',
          rule: 'Plan leaves the reconciliation complete but unsigned — the orders are not placed. Sign is what orders the home medications as an inpatient.',
          source: 'job-aid',
          aidRef: 'p.4 icon list, p.5 step 5',
        },
        {
          label: 'Cancel',
          rule: 'Cancel abandons the reconciliation. Click Reconcile and Sign to order the home medications as an inpatient.',
          source: 'job-aid',
          aidRef: 'p.5 step 5',
        },
      ],
      note: 'Admission then shows a green checkmark in the Reconciliation Status. If you chose Plan instead, a different icon appears.',
    },
  ],
};
