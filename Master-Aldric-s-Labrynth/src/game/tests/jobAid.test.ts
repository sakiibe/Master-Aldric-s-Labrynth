import { describe, expect, it } from 'vitest';
import { workflows } from '../data';
import { JOB_AID_DOCS, matchSection } from '../data/jobAidDocs';
import { aidPageFor, parsePageRef } from '../jobAidRef';

/**
 * The Job Aids panel picks its document and page straight out of the authored
 * content — a workflow's `jobAid` and its `source`/`aidRef` citations. That
 * makes these tests a check on the CONTENT as much as on the parser: a
 * workflow citing an aid the registry doesn't know, or a citation shaped in a
 * way the parser can't read, should fail here rather than open a blank page in
 * front of a learner.
 */

describe('parsePageRef', () => {
	it('reads the first page out of every citation form in the content', () => {
		expect(parsePageRef('p.1 step 3')).toBe(1);
		expect(parsePageRef('p.12 steps 2-3')).toBe(12);
		expect(parsePageRef('p.4 step 1 note')).toBe(4);
		expect(parsePageRef('pp.18-19')).toBe(18);
		expect(parsePageRef('p.7 tip')).toBe(7);
		expect(parsePageRef('CPOE - Powerchart (pp. 9-11)')).toBe(9);
		// The BPMH sources use an en-dash rather than a hyphen.
		expect(parsePageRef('BPMH & Admission Med Rec (pp. 1–2)')).toBe(1);
	});

	it('returns undefined rather than a wrong page for unparseable input', () => {
		expect(parsePageRef(undefined)).toBeUndefined();
		expect(parsePageRef('')).toBeUndefined();
		expect(parsePageRef('step 3')).toBeUndefined();
	});
});

describe('aidPageFor', () => {
	it('falls back to page 1 when there is no citation', () => {
		expect(aidPageFor('cpoe', undefined)).toBe(1);
	});

	it('clamps a citation past the end of the document', () => {
		// The CPOE aid is 19 pages.
		expect(aidPageFor('cpoe', 'p.99')).toBe(19);
	});
});

describe('job aid documents', () => {
	it('every workflow belongs to a district with a registered document', () => {
		for (const w of workflows) {
			expect(JOB_AID_DOCS[w.jobAid], w.id).toBeDefined();
		}
	});

	it("every workflow's source cites its own district's aid", () => {
		for (const w of workflows) {
			const doc = JOB_AID_DOCS[w.jobAid];
			expect(
				w.source.startsWith(doc.sourcePrefix),
				`${w.id}: ${w.source}`,
			).toBe(true);
		}
	});

	it('every cited page exists in the document it cites', () => {
		for (const w of workflows) {
			const doc = JOB_AID_DOCS[w.jobAid];
			const refs = [w.source, ...w.steps.map((s) => s.aidRef)];
			for (const ref of refs) {
				const page = parsePageRef(ref);
				if (page === undefined) continue;
				expect(page, `${w.id}: ${ref} vs ${doc.title}`).toBeLessThanOrEqual(
					doc.pageCount,
				);
			}
		}
	});

	it('sections are ordered and land inside the document', () => {
		for (const doc of Object.values(JOB_AID_DOCS)) {
			const pages = doc.sections.map((s) => s.page);
			expect(pages, doc.id).toEqual([...pages].sort((a, b) => a - b));
			expect(pages[0], doc.id).toBeGreaterThanOrEqual(1);
			expect(pages[pages.length - 1], doc.id).toBeLessThanOrEqual(
				doc.pageCount,
			);
		}
	});

	it('names the section a page falls inside, taking the later of two on one page', () => {
		const cpoe = JOB_AID_DOCS.cpoe;
		expect(matchSection(cpoe, 1)?.title).toBe('Add an Order using CPOE');
		expect(matchSection(cpoe, 2)?.title).toBe('Add an Order using CPOE');
		expect(matchSection(cpoe, 3)?.title).toBe('Modify an Order');
		// Patient Own Supply and Template Non-Formulary both start on p.8.
		expect(matchSection(cpoe, 8)?.title).toBe(
			'Ordering a Template Non-Formulary',
		);
	});
});
