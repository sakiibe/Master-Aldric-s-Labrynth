/**
 * The four source PDFs, one per Overworld district.
 *
 * This is the level -> document mapping the Job Aids panel runs on: a workflow
 * already declares its `jobAid`, so the panel needs no per-level wiring — it
 * reads the district off the running workflow and opens that district's aid.
 *
 * `sections` is transcribed from each PDF's own headings, so a page number here
 * is the page the heading is printed on, not an approximation. They drive the
 * "Jump to section" list; `matchSection()` also uses them to name whichever
 * section a given page falls inside.
 *
 * The files themselves live in `public/job-aids/` and are NOT in git (see the
 * .gitignore entry and public/job-aids/README.md) — they are health-authority
 * documents, and the game degrades to a "not installed" notice without them.
 */

import type { JobAidId } from '../types';

export interface AidSection {
	title: string;
	/** 1-based page in the PDF, as printed in the document. */
	page: number;
}

export interface JobAidDoc {
	id: JobAidId;
	/** Document title as printed on the PDF's own header. */
	title: string;
	/** Path under public/. Encoded at use time, never hand-escaped here. */
	file: string;
	/** Publisher line, shown under the title in the panel. */
	publisher: string;
	pageCount: number;
	/**
	 * The prefix every `WorkflowDef.source` for this district starts with, e.g.
	 * `'CPOE - Powerchart (pp. 1-2)'`. Used by the content test to prove no
	 * workflow cites an aid this registry doesn't know about.
	 */
	sourcePrefix: string;
	sections: AidSection[];
}

export const JOB_AID_DOCS: Record<JobAidId, JobAidDoc> = {
	bpmh: {
		id: 'bpmh',
		title: 'BPMH & Admission Med Rec',
		file: '/job-aids/bpmh-admission-med-rec.pdf',
		publisher: 'NS Health / IWK Health — One Person One Record',
		pageCount: 6,
		sourcePrefix: 'BPMH & Admission Med Rec',
		sections: [
			{ title: 'Document Medication by Hx', page: 1 },
			{ title: 'BPMH Documentation Powerform', page: 3 },
			{ title: 'Medication Reconciliation Icons', page: 4 },
			{ title: 'Admission Medication Reconciliation', page: 5 },
		],
	},

	verification: {
		id: 'verification',
		title: 'Pharmacist Verification & Med Manager',
		file: '/job-aids/pharmacist-verification-med-manager.pdf',
		publisher: 'NS Health / IWK Health — One Person One Record',
		pageCount: 51,
		sourcePrefix: 'Pharmacist Verification & Med Manager',
		sections: [
			{ title: 'Verify an Order in Medication Manager', page: 1 },
			{ title: 'Add an Order using Medication Manager', page: 6 },
			{ title: 'Modifying an Order', page: 7 },
			{ title: 'Copy and Discontinue an Order', page: 9 },
			{ title: 'Changing an Order Type', page: 11 },
			{ title: 'Changing a Frequency', page: 13 },
			{ title: 'Reschedule during Verification', page: 17 },
			{ title: 'Reschedule after Verification', page: 18 },
			{ title: 'Reprint a Label', page: 19 },
			{ title: 'Order Clarification during Verification', page: 20 },
			{ title: 'Clarification — Rejecting or Re-entering', page: 24 },
			{ title: 'Patient Own Supply', page: 28 },
			{ title: 'Add an IV Set using a Powdered Vial', page: 30 },
			{ title: 'Verifying Combinations of Different Strengths', page: 34 },
			{ title: 'Verifying Powerplans', page: 36 },
			{ title: 'Continuous vs Titratable Infusions', page: 38 },
			{ title: 'Verifying a Bolus off a Continuous Bag', page: 43 },
			{ title: 'Build an IV Set in Medication Manager', page: 46 },
			{ title: 'Invalid Dose Entry Error', page: 50 },
		],
	},

	cpoe: {
		id: 'cpoe',
		title: 'CPOE — Powerchart',
		file: '/job-aids/cpoe-powerchart.pdf',
		publisher: 'NS Health / IWK Health — One Person One Record',
		pageCount: 19,
		sourcePrefix: 'CPOE - Powerchart',
		sections: [
			{ title: 'Add an Order using CPOE', page: 1 },
			{ title: 'Modify an Order', page: 3 },
			{ title: 'Modify Continuous Infusion Rate', page: 4 },
			{ title: 'Cancel / Discontinue an Order', page: 4 },
			{ title: 'Cancel and Re-order', page: 5 },
			{ title: 'Ordering Weight-Based Medications', page: 6 },
			{ title: 'Ordering a Patient Own Supply', page: 8 },
			{ title: 'Ordering a Template Non-Formulary', page: 8 },
			{ title: 'Ordering a Powerplan', page: 9 },
			{ title: 'Ordering Therapeutic Substitutions', page: 11 },
			{ title: 'Ordering a Taper or Titration', page: 16 },
			{ title: 'Ordering Self-Administered Medications', page: 17 },
			{ title: 'Ordering a Prescription', page: 18 },
		],
	},

	oncology: {
		id: 'oncology',
		title: 'Oncology Pharmacist Verification',
		file: '/job-aids/oncology-pharmacist-verification.pdf',
		publisher: 'NS Health / IWK Health — One Person One Record',
		pageCount: 27,
		sourcePrefix: 'Oncology Pharmacist Verification',
		sections: [
			{ title: 'Verifying an IV Set — Clinical Verification', page: 1 },
			{ title: 'Future Orders: 1st Verification, IV Set', page: 2 },
			{ title: 'Activated Orders: 2nd Verification, IV Set', page: 7 },
			{ title: 'Verifying a Syringe', page: 9 },
			{ title: 'Verifying a Total Volume IV Set', page: 11 },
			{ title: 'Verifying an Infusor', page: 13 },
			{ title: 'Verifying a Subcutaneous Syringe', page: 15 },
			{ title: 'Verifying Compassionate Supply', page: 17 },
			{ title: 'Modifying a Dose on Powerchart', page: 18 },
			{ title: 'Pre-Treatment Powerplans', page: 20 },
			{ title: 'Skipping a Regimen', page: 22 },
			{ title: 'Changing Dosing Weight', page: 24 },
			{ title: 'Tips', page: 25 },
			{ title: 'Changing Products in an IV Set', page: 26 },
		],
	},
};

/**
 * The section a page sits in — the last section that starts at or before it.
 *
 * Two sections share page 8 in CPOE and page 4 in the verification aid; the
 * later one wins, which is the honest answer for a bare page number and the
 * reason this is a `reduce` rather than a `find`.
 */
export function matchSection(
	doc: JobAidDoc,
	page: number,
): AidSection | undefined {
	return doc.sections.reduce<AidSection | undefined>(
		(best, s) => (s.page <= page ? s : best),
		undefined,
	);
}
