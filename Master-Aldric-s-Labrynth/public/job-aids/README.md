# Job aid PDFs

The four source documents the in-game **Job Aids** panel opens, one per
Overworld district. Drop them in this folder under exactly these names:

| File name | Document | Pages | District |
|---|---|---|---|
| `bpmh-admission-med-rec.pdf` | BPMH & Admission Med Rec | 6 | BPMH & Med Rec |
| `pharmacist-verification-med-manager.pdf` | Pharmacist Verification & Med Manager v.1 | 51 | Pharmacist Verification |
| `cpoe-powerchart.pdf` | CPOE – Powerchart | 19 | CPOE |
| `oncology-pharmacist-verification.pdf` | Oncology Pharmacist Verification | 27 | Oncology Orders |

Names are lowercase and hyphenated on purpose: Netlify's filesystem is
case-sensitive where Windows is not, and spaces in the original filenames would
have to be percent-encoded in every link.

The panel reads these names from `src/game/data/jobAidDocs.ts`. If you rename a
file, rename it there too — and update `pageCount` if you swap in a revision
with a different length, since it is what clamps an out-of-range page.

## Why these aren't in git

They are NS Health / IWK Health documents rather than game assets, so they are
gitignored and distributed with the build instead of the source. Without them
the game still runs: the panel opens and shows a "not installed" notice where
the PDF would be.

## Page numbers

The panel opens each aid at the page the current workflow cites in its
`source`, and the "Jump to section" list is transcribed from each PDF's own
headings. Both are checked against these page counts by
`src/game/tests/jobAid.test.ts`, so a mismatched revision fails the test suite
rather than silently opening the wrong page.
