import type { WorkflowDef } from '../types';

/**
 * Transcribed from: "CPOE - Powerchart" (NS Health / IWK Health, One Person
 * One Record), "Ordering Therapeutic Substitutions", pages 11-15.
 *
 * Scope note: the job aid's pp.13-15 detail (Pharmacy Patient Monitor,
 * Medication Manager, Resolve Med Order) is the pharmacist-side resolution
 * of the "Pharmacy to Dose" branch, not a CPOE prescriber action — it likely
 * belongs under the Pharmacist Verification job aid instead, so it is left
 * out of this workflow rather than transcribed here. The Cancel branch
 * (p.15) reduces to the Template Non-Formulary workflow already covered
 * separately (`cpoe-template-non-formulary`), so it is referenced by a note
 * rather than re-modelled as its own branch.
 */
export const cpoeTherapeuticSubstitution: WorkflowDef = {
  id: 'cpoe-therapeutic-substitution',
  title: 'Ordering Therapeutic Substitutions',
  sector: 'order-entry',
  jobAid: 'cpoe',
  source: 'CPOE - Powerchart (pp. 11-13, 15)',
  hints: 2,
  patience: 3,
  requires: ['cpoe-powerplan'],
  briefing: [
    'The reagent asked for is not on our shelf — but a close cousin is. The ledger will offer you its equivalent.',
    'When the match is not exact, you must choose how the substitution proceeds. There is more than one correct way.',
  ],
  outro: ['Substituted, dosed, signed. Close enough is sometimes exactly right.'],
  steps: [
    {
      id: 'search-select-nonformulary',
      location: 'Orders or Medication List tab — Add Order Search box',
      prompt:
        'The prescriber ordered valsartan-hydrochlorothiazide 80mg-12.5mg. Select the matching entry — note the red diamond marking it non-formulary.',
      aidRef: 'p.11 steps 1-2',
      rule: 'Click Add on the Orders or Medication List tab, then search for and select the medication. A red diamond icon indicates the medication is non-formulary.',
      correct: 'valsartan-hydrochlorothiazide 80mg-12.5mg oral tablet',
      wrong: [
        { label: 'valsartan-hydrochlorothiazide 160mg-25mg oral tablet' },
        { label: 'valsartan-hydrochlorothiazide 320mg-25mg oral tablet' },
      ],
    },
    {
      id: 'choose-substitution-path',
      location: 'Choose Therapeutic Substitution (No Exact Match)',
      prompt:
        'There is no exact formulary match for this combination. Pharmacy can supply it directly, or defer the dose to Pharmacy Patient Monitor — either is a legitimate way forward.',
      aidRef: 'p.12 steps 4-6',
      rule: 'Click either OK (accepts the recommended substitution directly) or Pharmacy to Dose (routes it to Pharmacy Patient Monitor to resolve).',
      note: 'Cancelling here and free-texting the original medication as a Template Non-Formulary order instead is also valid — see the Template Non-Formulary workflow.',
      correct: [
        {
          label: 'OK',
          note: 'The order now shows the individual medications with recommended doses — Dose, unit, route and frequency still need confirming before signing.',
          next: 'sign-substitution',
        },
        {
          label: 'Pharmacy to Dose',
          note: 'Pharmacy Patient Monitor will resolve the dose — the order signs as Incomplete for now.',
          next: 'sign-incomplete',
        },
      ],
      wrong: [
        {
          label: 'Done',
          rule: 'Done belongs to the Add Order search window behind this popup — resolve the therapeutic substitution first, with OK or Pharmacy to Dose.',
          source: 'authored-needs-review',
          needsReview: true,
        },
      ],
    },
    {
      id: 'sign-substitution',
      location: 'Details for hydrochlorothiazide / valsartan',
      prompt: 'The recommended doses are populated. Confirm the required fields before signing.',
      aidRef: 'p.12 step 4',
      rule: 'The Dose, unit, route and frequency are required fields on the substituted order — confirm them, then click Sign. A paired icon marks that a therapeutic substitution occurred.',
      correct: [{ label: 'Sign', next: null }],
      wrong: [{ label: 'Reject', needsReview: true }, { label: 'Dx Table' }],
    },
    {
      id: 'sign-incomplete',
      location: 'Orders for Signature',
      prompt:
        'No fields are mandatory yet — Pharmacy will resolve the dose. Sign the order as-is so it routes for processing.',
      aidRef: 'p.13 step 1',
      rule: 'Click Sign — the order status will display as Incomplete, and Pharmacy Patient Monitor will process it from there.',
      correct: [{ label: 'Sign', next: null }],
      wrong: [{ label: 'Void' }, { label: 'Suspend' }],
    },
  ],
};
