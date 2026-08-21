import type { WorkflowDef } from '../types';
import { documentMedByHx } from './bpmh-document-med-hx';
import { admissionMedRec } from './bpmh-admission-med-rec';

export { documentMedByHx } from './bpmh-document-med-hx';
export { admissionMedRec } from './bpmh-admission-med-rec';

/** Registry of every authored workflow. Drives the Overworld. */
export const workflows: WorkflowDef[] = [documentMedByHx, admissionMedRec];
