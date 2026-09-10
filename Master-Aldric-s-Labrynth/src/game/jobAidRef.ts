/**
 * Reading page numbers out of the citations the workflows already carry.
 *
 * Every `WorkflowDef` cites its aid and page range in `source`
 * ("CPOE - Powerchart (pp. 1-2)") and most steps cite a page in `aidRef`
 * ("p.1 step 3 note"). That is enough to open the job aid at the right place
 * without adding a second, hand-maintained page map that could drift out of
 * step with the content.
 *
 * Both fields are hand-typed prose, so parsing is deliberately forgiving:
 * anything shaped like `p.N` / `pp. N-N` yields N, and anything else yields
 * `undefined` rather than a wrong page. The panel treats `undefined` as
 * "open at page 1", never as an error.
 */

import { JOB_AID_DOCS } from './data/jobAidDocs';
import type { JobAidId } from './types';

/**
 * First page cited in a `p.` / `pp.` reference.
 *
 * Handles every form in the content today — `p.1 step 3`, `p.1 steps 2-3`,
 * `pp.18-19`, `p.4 note` — plus the en-dash the BPMH sources use, by only ever
 * looking for the first run of digits after the `p`.
 */
export function parsePageRef(ref: string | undefined): number | undefined {
	if (!ref) return undefined;
	const m = /\bpp?\.\s*(\d+)/i.exec(ref);
	if (!m) return undefined;
	const page = Number(m[1]);
	return Number.isInteger(page) && page > 0 ? page : undefined;
}

/**
 * The page a workflow's job aid should open at.
 *
 * Clamped to the document, so a typo'd citation ("p.99" in a 19-page aid) opens
 * the last page rather than handing the PDF viewer an out-of-range fragment it
 * would silently ignore.
 */
export function aidPageFor(jobAid: JobAidId, ref: string | undefined): number {
	const doc = JOB_AID_DOCS[jobAid];
	const page = parsePageRef(ref) ?? 1;
	return Math.min(Math.max(page, 1), doc.pageCount);
}
