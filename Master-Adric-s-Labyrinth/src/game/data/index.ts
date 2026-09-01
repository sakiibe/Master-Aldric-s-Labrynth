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
import { oncClinicalVerification } from './onc-clinical-verification';
import { oncVerifyIvSet } from './onc-verify-iv-set';
import { oncVerifySyringe } from './onc-verify-syringe';
import { oncVerifyTotalVolumeIvSet } from './onc-verify-total-volume-iv-set';
import { oncVerifyInfusor } from './onc-verify-infusor';
import { oncVerifySubcutaneousSyringe } from './onc-verify-subcutaneous-syringe';
import { oncVerifyCompassionateSupply } from './onc-verify-compassionate-supply';
import { oncModifyDose } from './onc-modify-dose';
import { oncPretreatmentPowerplan } from './onc-pretreatment-powerplan';
import { oncSkipRegimen } from './onc-skip-regimen';
import { oncChangeDosingWeight } from './onc-change-dosing-weight';
import { oncChangeIvSetProduct } from './onc-change-iv-set-product';

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
export { oncClinicalVerification } from './onc-clinical-verification';
export { oncVerifyIvSet } from './onc-verify-iv-set';
export { oncVerifySyringe } from './onc-verify-syringe';
export { oncVerifyTotalVolumeIvSet } from './onc-verify-total-volume-iv-set';
export { oncVerifyInfusor } from './onc-verify-infusor';
export { oncVerifySubcutaneousSyringe } from './onc-verify-subcutaneous-syringe';
export { oncVerifyCompassionateSupply } from './onc-verify-compassionate-supply';
export { oncModifyDose } from './onc-modify-dose';
export { oncPretreatmentPowerplan } from './onc-pretreatment-powerplan';
export { oncSkipRegimen } from './onc-skip-regimen';
export { oncChangeDosingWeight } from './onc-change-dosing-weight';
export { oncChangeIvSetProduct } from './onc-change-iv-set-product';

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
  oncClinicalVerification,
  oncVerifyIvSet,
  oncVerifySyringe,
  oncVerifyTotalVolumeIvSet,
  oncVerifyInfusor,
  oncVerifySubcutaneousSyringe,
  oncVerifyCompassionateSupply,
  oncModifyDose,
  oncPretreatmentPowerplan,
  oncSkipRegimen,
  oncChangeDosingWeight,
  oncChangeIvSetProduct,
];
