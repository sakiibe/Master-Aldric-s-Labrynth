import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { JOB_AID_DOCS, matchSection } from '../../game/data/jobAidDocs';
import { aidPageFor } from '../../game/jobAidRef';
import type { BuiltWorkflow } from '../../game/types';
import { useSound } from '../../sound/useSound';
import { loadAidWidth, saveAidWidth } from '../../state/jobAidStorage';

/**
 * The Job Aids drawer — the source PDF for the district the player is in,
 * available without leaving the run.
 *
 * Which document opens is not configured per level: a workflow already declares
 * its `jobAid`, so this reads the district off the running workflow and looks
 * the document up in JOB_AID_DOCS. Adding a workflow to a district therefore
 * wires its job aid up automatically.
 *
 * Ported from the `Job Aids Panel` design handoff, with four deliberate
 * departures — all of them forced by this codebase rather than taste:
 *
 *  1. COLOURS come from the theme tokens, not the mock's literals. They were
 *     already the same palette to within a couple of digits (the mock's panel
 *     fill #2a1d44 against the theme's surface #2a1d47), and base.css holds a
 *     no-colour-literal rule, so the tokens win and the panel recolours with
 *     the rest of the game.
 *  2. THE PAGE the aid opens at is the workflow's, from its `source` citation —
 *     not the current junction's, which the step `aidRef`s would also allow.
 *     See OPEN_AT_CURRENT_STEP below; this is a game-design call, not a
 *     technical limit.
 *  3. THE FOOTER does not claim the run is paused. The handoff flagged that
 *     copy as a product decision to confirm, and there is no timer in this
 *     engine — patience is spent per wrong door, not per second — so the claim
 *     would simply be false. It states where the player is in the aid instead.
 *  4. THE VIEWER is a plain <iframe> on the browser's built-in PDF viewer. The
 *     handoff suggested pdf.js/react-pdf "if the codebase has one"; this
 *     codebase has no runtime dependency but React, and a reference panel is a
 *     thin case for the first one.
 */

/**
 * Open the aid at the page for the CURRENT JUNCTION rather than the workflow's
 * first page.
 *
 * Off by design. The step `aidRef`s make it a one-word change, but the game
 * meters help deliberately — a hint is a spent resource and a wrong door costs
 * patience — and opening the aid on the very page that answers the junction in
 * front of the player routes around both for free. Level-scoped matches the
 * handoff's "opens at this level's section" and keeps the aid a reference
 * rather than an answer key.
 *
 * Flip to `true` if playtesting says learners want the tighter jump.
 */
const OPEN_AT_CURRENT_STEP = false;

/** Drawer width as a % of the viewport. Matches the handoff's grip clamp. */
const MIN_WIDTH = 22;
const MAX_WIDTH = 85;
const DEFAULT_WIDTH = 34;

/**
 * Below this the drawer goes full-width instead of scaling down, per the
 * handoff. Kept in JS as well as CSS because the inline width is what the grip
 * writes, and it has to stop fighting the stylesheet at phone widths.
 */
const FULL_WIDTH_BELOW = 900;

interface JobAidPanelProps {
	workflow: BuiltWorkflow;
	/** Citation for the junction the player is standing at, e.g. "p.1 step 3". */
	stepAidRef?: string;
}

export function JobAidPanel({ workflow, stepAidRef }: JobAidPanelProps) {
	const doc = JOB_AID_DOCS[workflow.jobAid];
	const { playSfx } = useSound();

	const [open, setOpen] = useState(false);
	const [jumpOpen, setJumpOpen] = useState(false);
	const [width, setWidth] = useState(() => loadAidWidth() ?? DEFAULT_WIDTH);
	const [narrow, setNarrow] = useState(
		() => typeof window !== 'undefined' && window.innerWidth < FULL_WIDTH_BELOW,
	);
	/**
	 * Null until the player jumps to a section; until then the panel tracks the
	 * workflow's own page. Reset between workflows by the `key` App.tsx mounts
	 * this under — without it the panel would carry a page chosen in one
	 * district over onto the next district's document.
	 */
	const [page, setPage] = useState<number | null>(null);
	/** Null while unknown — the file is only checked once the panel is opened. */
	const [available, setAvailable] = useState<boolean | null>(null);

	const handleRef = useRef<HTMLButtonElement>(null);
	const headingRef = useRef<HTMLHeadingElement>(null);
	const titleId = useId();
	const drawerId = useId();

	const landingPage = aidPageFor(
		workflow.jobAid,
		OPEN_AT_CURRENT_STEP ? (stepAidRef ?? workflow.source) : workflow.source,
	);
	const shownPage = page ?? landingPage;
	const section = matchSection(doc, shownPage);

	useEffect(() => {
		const onResize = () => setNarrow(window.innerWidth < FULL_WIDTH_BELOW);
		window.addEventListener('resize', onResize);
		return () => window.removeEventListener('resize', onResize);
	}, []);

	/**
	 * Is the PDF actually installed?
	 *
	 * Asked explicitly rather than inferred from the <iframe>, because an
	 * embed gives no usable load/error signal: a missing file paints the
	 * browser's own opaque error page, which would sit over any fallback
	 * notice placed behind it and leave the player staring at a broken frame
	 * with nothing explaining why.
	 *
	 * Deferred until first open so the game makes no request for a document
	 * nobody has asked to read.
	 */
	useEffect(() => {
		if (!open || available !== null) return;
		let live = true;
		fetch(encodeURI(doc.file), { method: 'HEAD' })
			.then((r) => {
				// A dev server that answers unknown paths with index.html reports a
				// perfectly cheerful 200, so the content type is the real check.
				const type = r.headers.get('content-type') ?? '';
				if (live) setAvailable(r.ok && !type.includes('text/html'));
			})
			.catch(() => {
				if (live) setAvailable(false);
			});
		return () => {
			live = false;
		};
	}, [open, available, doc.file]);

	const close = useCallback(() => {
		playSfx('click');
		setOpen(false);
		setJumpOpen(false);
		handleRef.current?.focus();
	}, [playSfx]);

	// Escape closes, matching the title screen's overlays. Bound only while
	// open so it can never swallow an Escape meant for another scene.
	useEffect(() => {
		if (!open) return;
		headingRef.current?.focus();
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') close();
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [open, close]);

	/**
	 * Drag-to-resize. Width is measured from the viewport's right edge, so the
	 * grip stays under the pointer regardless of where the drag started, and is
	 * committed to storage once on release rather than on every move.
	 */
	const startDrag = (e: React.PointerEvent) => {
		if (narrow) return;
		e.preventDefault();
		let latest = width;

		const move = (ev: PointerEvent) => {
			const pct = ((window.innerWidth - ev.clientX) / window.innerWidth) * 100;
			latest = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.round(pct)));
			setWidth(latest);
		};
		const up = () => {
			window.removeEventListener('pointermove', move);
			window.removeEventListener('pointerup', up);
			window.removeEventListener('pointercancel', up);
			saveAidWidth(latest);
		};

		window.addEventListener('pointermove', move);
		window.addEventListener('pointerup', up);
		window.addEventListener('pointercancel', up);
	};

	const panelWidth = narrow ? 100 : width;
	const src = `${encodeURI(doc.file)}#page=${shownPage}&view=FitH`;

	return (
		<div
			className={`job-aid${open ? ' is-open' : ''}`}
			style={{ '--aid-width': `${panelWidth}vw` } as React.CSSProperties}
		>
			{open && (
				<div
					className="job-aid__scrim"
					onClick={close}
					/* The ✕, the handle and Escape are the real controls; this is a
					   convenience for pointer users, so it stays out of the
					   accessibility tree rather than posing as a second button. */
					aria-hidden="true"
				/>
			)}

			<div className="job-aid__group">
				<button
					type="button"
					ref={handleRef}
					className="job-aid__handle"
					aria-expanded={open}
					aria-controls={drawerId}
					onClick={() => {
						playSfx('click');
						if (open) {
							setOpen(false);
							setJumpOpen(false);
						} else {
							setOpen(true);
						}
					}}
				>
					<span className="job-aid__diamond" aria-hidden="true" />
					<span className="job-aid__handle-text">Job Aid</span>
					<span className="job-aid__chev" aria-hidden="true">
						{open ? '›' : '‹'}
					</span>
				</button>

				<div
					className="job-aid__grip"
					onPointerDown={startDrag}
					title="Drag to resize"
					aria-hidden="true"
				>
					<span />
				</div>

				<aside
					id={drawerId}
					className="job-aid__drawer"
					role="dialog"
					aria-modal="false"
					aria-labelledby={titleId}
					/* Not just cosmetic: a closed drawer is translated off-screen but
					   still in the DOM, and without this its links and the iframe
					   stay tabbable behind the scene. */
					inert={!open}
				>
					<div className="job-aid__head">
						<div className="job-aid__titles">
							<span className="job-aid__eyebrow">{workflow.title}</span>
							<h2
								className="job-aid__title"
								id={titleId}
								tabIndex={-1}
								ref={headingRef}
							>
								{doc.title}
							</h2>
						</div>
						<div className="job-aid__head-actions">
							<span className="job-aid__esc" aria-hidden="true">
								ESC
							</span>
							<button
								type="button"
								className="job-aid__close"
								aria-label="Close job aid"
								onClick={close}
							>
								✕
							</button>
						</div>
					</div>

					<div className="job-aid__doc">
						<div className="job-aid__docrow">
							<span className="job-aid__thumb" aria-hidden="true">
								PDF
							</span>
							<div className="job-aid__meta">
								<span className="job-aid__docname">{doc.title}</span>
								<span className="job-aid__docsub">
									{doc.publisher} · {doc.pageCount} pages
								</span>
							</div>
						</div>

						<div className="job-aid__actions">
							<button
								type="button"
								className="job-aid__btn job-aid__btn--filled"
								aria-expanded={jumpOpen}
								onClick={() => {
									playSfx('click');
									setJumpOpen((v) => !v);
								}}
							>
								Jump to section <span aria-hidden="true">▾</span>
							</button>
							<a
								className="job-aid__btn job-aid__btn--gold"
								href={src}
								target="_blank"
								rel="noopener noreferrer"
							>
								Open in new tab <span aria-hidden="true">↗</span>
							</a>
							<a
								className="job-aid__btn job-aid__btn--quiet"
								href={encodeURI(doc.file)}
								download
							>
								Download
							</a>
						</div>
					</div>

					{jumpOpen && (
						<div className="job-aid__sections">
							{doc.sections.map((s) => (
								<button
									key={`${s.title}-${s.page}`}
									type="button"
									className={`job-aid__section${
										section && s.title === section.title ? ' is-current' : ''
									}`}
									onClick={() => {
										playSfx('click');
										setPage(s.page);
										setJumpOpen(false);
									}}
								>
									<span>{s.title}</span>
									<span className="job-aid__page">p. {s.page}</span>
								</button>
							))}
						</div>
					)}

					<div className="job-aid__viewer">
						{available === false ? (
							<p className="job-aid__missing">
								<span>This job aid isn’t installed yet.</span>
								<span>
									Drop <code>{doc.file.replace('/job-aids/', '')}</code> into{' '}
									<code>public/job-aids/</code>.
								</span>
							</p>
						) : (
							/* Keyed on the page so a jump REMOUNTS the iframe. Rewriting
							   only the #page fragment of an already-loaded PDF does not
							   renavigate the built-in viewers, so without this the first
							   jump would silently do nothing. */
							<iframe
								key={src}
								src={src}
								title={`${doc.title} — page ${shownPage}`}
							/>
						)}
					</div>

					<div className="job-aid__foot">
						<span>
							{section ? `${section.title} · ` : ''}p. {shownPage}
						</span>
						{page !== null && page !== landingPage && (
							<button
								type="button"
								className="job-aid__back"
								onClick={() => {
									playSfx('click');
									setPage(null);
								}}
							>
								Back to this recipe’s page
							</button>
						)}
					</div>
				</aside>
			</div>
		</div>
	);
}
