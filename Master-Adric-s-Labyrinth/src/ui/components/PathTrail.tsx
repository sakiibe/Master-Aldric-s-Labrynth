import { Fragment, useEffect, useRef } from 'react';
import type { TakenStep } from '../../game/types';

interface PathTrailProps {
  /** RunState.taken — the only source. Not recomputed from visited or the
   * workflow definition, so the three invariants below hold by construction
   * rather than by anything this component has to enforce:
   *   - never shows the current step's correct answer: choose() only
   *     appends to `taken` on a correct pick, so an unresolved junction has
   *     nothing here to show yet.
   *   - a wrong pick adds nothing: choose()'s wrong-door branch never
   *     touches `taken`.
   *   - backtracking doesn't remove chips: backtrack() doesn't touch
   *     `taken` either — there was never anything to remove.
   */
  taken: TakenStep[];
  /** True once the workflow is complete — drops the trailing "current step" chip. */
  complete?: boolean;
}

/**
 * The click-path trail. One chip per `taken` entry, joined by arrows, plus a
 * dashed "?" chip standing in for the junction the player is at right now
 * (presentational only — it carries no data). Scrolls horizontally and
 * keeps the newest chip in view as the trail grows.
 */
export function PathTrail({ taken, complete = false }: PathTrailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [taken.length, complete]);

  const chips: { key: string; label: string; current: boolean }[] = taken.map((step, i) => ({
    key: `${step.stepId}:${i}`,
    label: step.label,
    current: false,
  }));
  if (!complete) chips.push({ key: 'current', label: '?', current: true });

  return (
    <div className="path-trail">
      <span className="path-trail__prefix">Path:</span>
      <div className="path-trail__scroll" ref={scrollRef}>
        {chips.map((chip, i) => (
          <Fragment key={chip.key}>
            <span
              className={`path-trail__chip${chip.current ? ' path-trail__chip--current' : ''}`}
              title={chip.label}
            >
              {chip.label}
            </span>
            {i < chips.length - 1 && (
              <span className="path-trail__arrow" aria-hidden="true">
                →
              </span>
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
