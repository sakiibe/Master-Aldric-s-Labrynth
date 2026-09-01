# Pharmacy Cutover Maze — project brief

Clinical cutover training game for pharmacy staff at Nova Scotia Health, ahead
of an Oracle Cerner Go-Live. Follow-up to an earlier game, "Charts, Please!".

Two developers, ~2 weeks. First workflow playable by Aug 24, full game Sep 11.

## What the game is

A maze/decision game teaching the "clickology" of Cerner pharmacy workflows.
At each junction the player sees three doors labelled with real Cerner buttons
(`Product…`, `Comments…`, `Order Type`) and picks the correct next step.
Correct picks advance through the workflow. Wrong picks hit a dead end that
shows the rule from the job aid, and the player returns to the same junction.

**Audience is already trained on Cerner.** This is a knowledge check, not first
exposure. Design accordingly: distractors should be genuinely confusable
options, not obviously-unrelated buttons.

## Theme

Apothecary / alchemy lab. A mentor character, **Master Aldric** — a tall robed
alchemist — gives briefings and delivers dead-end rules in a Hades-style
dialogue box (portrait + text box, typewriter reveal).

Light comedic frame: the player is trained on the modern systems and Aldric
wants to learn this "sorcery". Dead ends interrupt him mid-activity (in a bath,
applying makeup, boiling over a cauldron) — 5–6 variants, rotated so the same
one never fires twice in a row.

Alchemy is the only theme. An earlier plan for a swappable modern-pharmacy skin
was dropped.

## Decided mechanics

- No leaderboard, no timer.
- **Patience**: N per workflow — Master Aldric's patience, not the player's
  health. A dead end costs one. Backtracking itself is free and unlimited; it
  is the wrong pick that costs. At zero, the workflow restarts from step one.
  Call it `patience` in code and `theme.labels.patience` in UI copy — never
  "lives" or "HP" in anything a player reads.
- **Hints**: N per workflow, the other scarce resource. Spending one makes the
  correct door(s) glow for that step. Per-step and idempotent — re-hinting an
  already-hinted step is free, and a spent hint survives a wrong pick and a
  backtrack.
- Progress persists in `localStorage`.
- Firebase analytics is under consideration (see Open questions).

## Architecture

Layered `types / data / engine / state / ui`. Two rules, strictly enforced:

1. **`game/` imports nothing from `state/` or `ui/`.** No React, no DOM, no
   `localStorage`, no `Date.now()`, no `Math.random()`. The whole game loop is
   unit-testable without rendering anything.
2. **`ui/` never imports `data/` directly.** It receives a `BuiltWorkflow` from
   `state/`.

```
src/
├── main.tsx
├── App.tsx
├── game/
│   ├── types.ts              # authoring + built + run state + theme types
│   ├── rng.ts                # seeded hash/shuffle
│   ├── buildWorkflow.ts      # pure: WorkflowDef -> BuiltWorkflow + validation
│   ├── engine.ts             # pure: choose / backtrack / useHint / progress
│   ├── theme.ts              # design tokens, vocabulary, dead-end scenes
│   ├── data/                 # one file per workflow + index.ts registry
│   └── __tests__/
├── state/                    # the ONLY layer that touches localStorage
│   ├── storage.ts            # load/save PersistedProgress, version + migrate
│   ├── useRun.ts             # wraps engine calls, persists on change
│   └── ThemeContext.tsx
└── ui/
    ├── scenes/               # Overworld, Briefing, Junction, DeadEnd, Complete
    ├── components/           # DialogueBox, Door, HintButton, PatienceMeter
    ├── art/                  # inline SVG components, keyed by theme asset refs
    └── styles/transitions.css
```

## The authoring/built type split

This is the central design idea. `types.ts` holds two families:

- **Authoring types** (`WorkflowDef`, `StepDef`, `WrongChoice`, `CorrectChoice`)
  are hand-written while transcribing a job aid PDF. Deliberately loose:
  `correct` may be a bare string, `next` may be omitted, a wrong door may be
  just a label.
- **Built types** (`BuiltWorkflow`, `BuiltStep`, `BuiltDoor`) are strict and
  fully resolved. `buildWorkflow()` is the only producer. The engine only ever
  sees these.

Because normalization happens once at build time, the engine contains no
`typeof correct === 'string'` branches, and the authoring shape can change
later without touching engine code.

**The authoring types are frozen.** They are the contract two people split
transcription work against. Do not change them without flagging it.

## Content authoring rules

Everything a player reads must be transcription, not invention. Concretely:

- `StepDef.rule` (required) states **positively** what the job aid says the
  correct action is: *"Document Compliance and Last Dose taken in the
  Compliance tab."* It is shown at the dead end behind **any** wrong door at
  that junction.
- `WrongChoice.rule` is optional, used only where the aid speaks to that
  specific option (e.g. the "No Known Home Medications" note). Requires a
  `source`.
- `WrongChoice.needsReview: true` flags a **label** we have not confirmed
  against a screenshot — a different failure from a wrong rule, hence a
  separate flag.
- `aidRef` carries provenance (`'p.1 step 3 note'`) on steps and choices.
  Choice-level overrides step-level.
- `pendingReview(def)` generates the SME sign-off queue from these flags. It is
  wired into a content test so the queue is generated, never hand-tracked.

## Non-obvious invariants

Get these wrong and the bugs are subtle:

- **`BuiltStep.doors` is display order; `BuiltStep.correctDoorIds` is authored
  order.** They do not match. Door order is a seeded shuffle
  (`hash(workflowId + '/' + stepId)`) so it is stable across sessions and
  backtracks — otherwise a paid-for hint would point at a door that moved.
  `correctDoorIds[0]` is the primary path, used to generate the recipe recap.
- **A wrong pick does not change `stepId`.** It sets `status: 'deadEnd'`.
  Backtracking is just flipping status back — there is nothing to restore.
- **`RunState` must stay plain and serializable.** It goes into localStorage
  verbatim: no class instances, no `Set`, no `Map`, no `Date`.
- **`buildWorkflow` collects every validation problem before throwing**, so a
  bad transcription yields one readable checklist rather than dying on the
  first error.
- **`erasableSyntaxOnly` is on** (Vite template default). No constructor
  parameter properties, no `enum`, no `namespace`. String literal unions
  instead of enums — they also serialize cleanly.

## Build order

Do these in sequence. Stop at each checkpoint and confirm before continuing.

**Stage 1 — core (should be one shot)**
`types.ts`, `rng.ts`, `buildWorkflow.ts`, `engine.ts`, unit tests, and the
authored `WorkflowDef`s. Most of this already exists in the repo — read it
rather than regenerating it. What is NOT yet built and needs adding:

- `patience` / `patienceRemaining` on `WorkflowDef` and `RunState`
- decrement in the wrong-door branch of `choose()`
- a fifth `RunStatus`, `'failed'`, entered when patience hits zero
- `restart(workflow)` returning a fresh run of the same workflow
- `theme.labels.patience` / `patiencePlural`, and an Aldric out-of-patience line
- tests for all of the above (see Patience semantics below)

Checkpoint: `npm run typecheck` clean and all tests green. This layer is fully
specified — no design judgement needed.

**Stage 2 — vertical slice**
`state/` plus the Junction and DeadEnd scenes only, with placeholder art
(plain rects). One workflow playable end to end. Checkpoint: a person can
click through the whole workflow, hit dead ends, spend hints, exhaust Aldric's
patience, and reach Complete.

**Stage 3 — the rest**
Overworld, Briefing, Complete, real SVG art, the four CSS transitions (advance
slide, wrong-turn shake, backtrack slide-back, complete fade).

## Patience semantics

Settled, and each point needs a test:

- Zero patience sets `status: 'failed'`. It does NOT auto-restart — the player
  sits in a failed scene, Aldric gets a line, and the recipe learned so far
  stays visible behind a "Begin again" action. Instant reset reads as a crash.
- `restart()` **refills patience and hints**. The lost run is punishment
  enough; carrying an empty hint budget into attempt two makes it feel
  unwinnable for no teaching benefit.
- A failed run does not persist. Closing the tab mid-death and returning starts
  the workflow fresh rather than resuming into the failed scene.
- The wrong pick that hits zero still shows its dead-end rule first. The player
  should learn the rule that ended the run, not just lose.
- Hints are unaffected by patience otherwise — spending a hint never costs
  patience, and a spent hint still survives a wrong pick and a backtrack.

## Open questions — ask, do not assume

- **Firebase**: whether to add it at all, and if so whether events are
  anonymous+aggregate or per-user. This is NSH staff performance data — the
  per-user version likely needs a privacy review, the anonymous per-step
  version probably does not.
- **`screenshot?`** on `StepDef` is reserved for a stretch goal (showing the
  real PowerChart screen). Keep the field and a conditional render; do not
  build a viewer.

## Verification

```bash
npm run typecheck    # tsc --noEmit
npm run test:run     # vitest run
```

Both must pass before any stage is considered done. The engine tests are the
specification — if a change breaks one, the change is wrong until argued
otherwise.
