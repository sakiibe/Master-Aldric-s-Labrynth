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
import { pvVerifyOrder } from './pv-verify-order';
import { pvAddOrderMedManager } from './pv-add-order-medmanager';
import { pvModifyOrder } from './pv-modify-order';
import { pvCopyDiscontinueOrder } from './pv-copy-discontinue-order';
import { pvChangeOrderType } from './pv-change-order-type';
import { pvChangeFrequency } from './pv-change-frequency';
import { pvRescheduleOrder } from './pv-reschedule-order';
import { pvReprintLabel } from './pv-reprint-label';
import { pvModifyWhileVerifying } from './pv-modify-while-verifying';
import { pvVoidReenterOrder } from './pv-void-reenter-order';
import { pvRejectForReassessment } from './pv-reject-for-reassessment';
import { pvPatientOwnSupplyMedManager } from './pv-patient-own-supply-medmanager';
import { pvAddIvSetPowderedVial } from './pv-add-iv-set-powdered-vial';
import { pvVerifyCombinationStrengths } from './pv-verify-combination-strengths';
import { pvVerifyPowerplan } from './pv-verify-powerplan';
import { pvVerifyContinuousInfusion } from './pv-verify-continuous-infusion';
import { pvVerifyTitratableInfusion } from './pv-verify-titratable-infusion';
import { pvVerifyBolusContinuousBag } from './pv-verify-bolus-continuous-bag';
import { pvBuildIvSetMedManager } from './pv-build-iv-set-medmanager';
import { pvInvalidDoseEntryError } from './pv-invalid-dose-entry-error';

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
export { pvVerifyOrder } from './pv-verify-order';
export { pvAddOrderMedManager } from './pv-add-order-medmanager';
export { pvModifyOrder } from './pv-modify-order';
export { pvCopyDiscontinueOrder } from './pv-copy-discontinue-order';
export { pvChangeOrderType } from './pv-change-order-type';
export { pvChangeFrequency } from './pv-change-frequency';
export { pvRescheduleOrder } from './pv-reschedule-order';
export { pvReprintLabel } from './pv-reprint-label';
export { pvModifyWhileVerifying } from './pv-modify-while-verifying';
export { pvVoidReenterOrder } from './pv-void-reenter-order';
export { pvRejectForReassessment } from './pv-reject-for-reassessment';
export { pvPatientOwnSupplyMedManager } from './pv-patient-own-supply-medmanager';
export { pvAddIvSetPowderedVial } from './pv-add-iv-set-powdered-vial';
export { pvVerifyCombinationStrengths } from './pv-verify-combination-strengths';
export { pvVerifyPowerplan } from './pv-verify-powerplan';
export { pvVerifyContinuousInfusion } from './pv-verify-continuous-infusion';
export { pvVerifyTitratableInfusion } from './pv-verify-titratable-infusion';
export { pvVerifyBolusContinuousBag } from './pv-verify-bolus-continuous-bag';
export { pvBuildIvSetMedManager } from './pv-build-iv-set-medmanager';
export { pvInvalidDoseEntryError } from './pv-invalid-dose-entry-error';

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
  pvVerifyOrder,
  pvAddOrderMedManager,
  pvModifyOrder,
  pvCopyDiscontinueOrder,
  pvChangeOrderType,
  pvChangeFrequency,
  pvRescheduleOrder,
  pvReprintLabel,
  pvModifyWhileVerifying,
  pvVoidReenterOrder,
  pvRejectForReassessment,
  pvPatientOwnSupplyMedManager,
  pvAddIvSetPowderedVial,
  pvVerifyCombinationStrengths,
  pvVerifyPowerplan,
  pvVerifyContinuousInfusion,
  pvVerifyTitratableInfusion,
  pvVerifyBolusContinuousBag,
  pvBuildIvSetMedManager,
  pvInvalidDoseEntryError,
];
