import type { WorkflowDef } from '../types';
import { documentMedByHx } from './bpmh-document-med-hx';
import { admissionMedRec } from './bpmh-admission-med-rec';
import { cpoeAddOrder } from './cpoe-add-order';
import { cpoeModifyOrder } from './cpoe-modify-order';
import { cpoeModifyInfusionRate } from './cpoe-modify-infusion-rate';
import { cpoeConvertToTitratable } from './cpoe-convert-to-titratable';
import { cpoeCancelReorder } from './cpoe-cancel-reorder';
import { cpoeWeightBasedDosing } from './cpoe-weight-based-dosing';
import { cpoePatientOwnSupply } from './cpoe-patient-own-supply';
import { cpoeTemplateNonFormulary } from './cpoe-template-non-formulary';
import { cpoePowerplan } from './cpoe-powerplan';
import { cpoeTherapeuticSubstitution } from './cpoe-therapeutic-substitution';
import { cpoeTaperTitration } from './cpoe-taper-titration';
import { cpoeSelfAdministeredMeds } from './cpoe-self-administered-meds';
import { cpoeConvertToPrescription } from './cpoe-convert-to-prescription';
import { cpoeNewPrescription } from './cpoe-new-prescription';

export { documentMedByHx } from './bpmh-document-med-hx';
export { admissionMedRec } from './bpmh-admission-med-rec';
export { cpoeAddOrder } from './cpoe-add-order';
export { cpoeModifyOrder } from './cpoe-modify-order';
export { cpoeModifyInfusionRate } from './cpoe-modify-infusion-rate';
export { cpoeConvertToTitratable } from './cpoe-convert-to-titratable';
export { cpoeCancelReorder } from './cpoe-cancel-reorder';
export { cpoeWeightBasedDosing } from './cpoe-weight-based-dosing';
export { cpoePatientOwnSupply } from './cpoe-patient-own-supply';
export { cpoeTemplateNonFormulary } from './cpoe-template-non-formulary';
export { cpoePowerplan } from './cpoe-powerplan';
export { cpoeTherapeuticSubstitution } from './cpoe-therapeutic-substitution';
export { cpoeTaperTitration } from './cpoe-taper-titration';
export { cpoeSelfAdministeredMeds } from './cpoe-self-administered-meds';
export { cpoeConvertToPrescription } from './cpoe-convert-to-prescription';
export { cpoeNewPrescription } from './cpoe-new-prescription';

/** Registry of every authored workflow. Drives the Overworld. */
export const workflows: WorkflowDef[] = [
  documentMedByHx,
  admissionMedRec,
  cpoeAddOrder,
  cpoeModifyOrder,
  cpoeModifyInfusionRate,
  cpoeConvertToTitratable,
  cpoeCancelReorder,
  cpoeWeightBasedDosing,
  cpoePatientOwnSupply,
  cpoeTemplateNonFormulary,
  cpoePowerplan,
  cpoeTherapeuticSubstitution,
  cpoeTaperTitration,
  cpoeSelfAdministeredMeds,
  cpoeConvertToPrescription,
  cpoeNewPrescription,
];
