/**
 * Foundational types for the pharmacy cutover maze.
 *
 * Two families of types live here:
 *
 *   1. AUTHORING types  (`WorkflowDef`, `StepDef`, `WrongChoice`, ...)
 *      Loose and pleasant to hand-write while transcribing a job aid.
 *      This is the contract we split authoring work against — freeze it
 *      before dividing workflows between authors.
 *
 *   2. BUILT types      (`BuiltWorkflow`, `BuiltStep`, `BuiltDoor`)
 *      Strict and fully resolved. `buildWorkflow()` is the only thing that
 *      produces these, and `engine.ts` only ever sees these.
 *
 * The split is deliberate: because normalization happens once at build time,
 * the engine contains no `typeof correct === 'string'` branches, and the
 * authoring shape can change later without touching engine code.
 */

export type WorkflowId = string;
export type StepId = string;
export type DoorId = string;

export type SectorId =
  | 'verify-order'
  | 'manual-product'
  | 'frequencies'
  | 'clarification'
  | 'bpmh'
  | 'infusions';

/* ------------------------------------------------------------------ */
/* Authoring                                                           */
/* ------------------------------------------------------------------ */

/**
 * Where a rule came from.
 *
 * Every wrong door needs a rule, but not every rule is literally printed in
 * the job aid — some are written to explain why a plausible-looking button is
 * the wrong one. Those are tagged `authored-needs-review` so a pharmacist can
 * sign them off before Go-Live. `pendingReview()` in buildWorkflow.ts turns
 * this into the review queue.
 */
export type RuleSource = 'job-aid' | 'authored-needs-review';

export interface WrongChoice {
  /** Button label, exactly as it appears in PowerChart. */
  label: string;
  /**
   * Optional per-door rule, used ONLY where the job aid speaks to this
   * specific option (e.g. the "No Known Home Medications" note). Omit it and
   * the dead end falls back to the step's positive rule — which is the
   * default, because a rule about the correct step is always grounded, while
   * a claim about what a wrong button does usually is not.
   */
  rule?: string;
  /** Required whenever `rule` is set. */
  source?: RuleSource;
  /** Provenance for review, e.g. "p.1 step 3 note". */
  aidRef?: string;
  /**
   * Set when the LABEL itself needs checking against a screenshot — i.e. we
   * are not certain this button exists on this screen with this wording.
   */
  needsReview?: boolean;
}

export interface CorrectChoice {
  label: string;
  /** Short line Aldric says on a correct pick. */
  note?: string;
  /**
   * Step this leads to.
   *   omitted -> the following step in `steps[]` (the common case)
   *   null    -> this pick completes the workflow
   *   StepId  -> explicit jump, for genuinely branching workflows
   */
  next?: StepId | null;
  aidRef?: string;
}

/**
 * One right answer, or several equally-right ones.
 *
 * The array form covers real cases from the job aids — "Medication List *or*
 * Orders tab" — and is also how the Modify/Copy/Void/Reject branch will work:
 * several correct doors, each with its own `next`.
 */
export type Correct = string | CorrectChoice[];

export interface StepDef {
  id: StepId;
  /** Where in PowerChart the player is standing, e.g. "Navigator Bar". */
  location: string;
  /** What they are trying to do at this junction. */
  prompt: string;
  correct: Correct;
  /**
   * The junction's rule, stated positively — what the job aid says the
   * correct action is. Shown at the dead end behind ANY wrong door here
   * unless that door carries its own `rule`.
   *
   * Positive phrasing is deliberate: it is transcription rather than
   * invention, so it needs no SME sign-off, and for a post-training audience
   * it prompts recall instead of explaining a button they did not pick.
   */
  rule: string;
  wrong: WrongChoice[];
  /** Job-aid Note/Tip that Aldric surfaces after a correct pick. */
  note?: string;
  /** RESERVED for the screenshot stretch goal. Not rendered yet. */
  screenshot?: string;
  /** Default provenance for this step's choices. */
  aidRef?: string;
}

export interface WorkflowDef {
  id: WorkflowId;
  title: string;
  sector: SectorId;
  /** Job aid this was transcribed from, with page range. */
  source: string;
  /** Hints granted for this workflow. */
  hints: number;
  /** Master Aldric's patience for this workflow. A wrong pick costs one; zero fails the run. */
  patience: number;
  /** Doors shown at every junction. Defaults to 3. */
  doorsPerJunction?: number;
  /** Aldric's briefing lines — one per dialogue-box advance. */
  briefing: string[];
  /** Aldric's lines on the Complete scene. */
  outro: string[];
  /** Workflows that must be cleared first. Drives Overworld lock state. */
  requires?: WorkflowId[];
  steps: StepDef[];
}

/* ------------------------------------------------------------------ */
/* Built (engine-facing)                                               */
/* ------------------------------------------------------------------ */

export interface BuiltDoor {
  id: DoorId;
  label: string;
  kind: 'correct' | 'wrong';
  /** Dead-end rule. Present iff kind === 'wrong'. */
  rule?: string;
  source?: RuleSource;
  aidRef?: string;
  /** Aldric's line on a correct pick. Present only on correct doors. */
  note?: string;
  /** Destination. Present only on correct doors; null ends the workflow. */
  next?: StepId | null;
}

export interface BuiltStep {
  id: StepId;
  /** Authoring position. Used for the progress bar, never for navigation. */
  index: number;
  location: string;
  prompt: string;
  note?: string;
  screenshot?: string;
  aidRef?: string;
  /**
   * DISPLAY order — deterministically shuffled, stable across sessions and
   * backtracks so a spent hint keeps pointing at the same door.
   */
  doors: BuiltDoor[];
  /**
   * AUTHORED order — `correctDoorIds[0]` is the primary path used to build
   * the recipe recap. Do not assume this matches `doors` order.
   */
  correctDoorIds: DoorId[];
}

export interface BuiltWorkflow {
  id: WorkflowId;
  title: string;
  sector: SectorId;
  source: string;
  hints: number;
  patience: number;
  doorsPerJunction: number;
  briefing: string[];
  outro: string[];
  requires: WorkflowId[];
  entryStepId: StepId;
  steps: BuiltStep[];
  byId: Record<StepId, BuiltStep>;
  /** The full correct click path, for the "recipe learned" recap. */
  recipe: string[];
}

/* ------------------------------------------------------------------ */
/* Run state                                                           */
/* ------------------------------------------------------------------ */

export type RunStatus = 'briefing' | 'junction' | 'deadEnd' | 'complete' | 'failed';

export interface DeadEnd {
  stepId: StepId;
  doorId: DoorId;
  label: string;
  rule: string;
  source: RuleSource;
  /** Which Aldric dead-end scene to show. The theme supplies the content. */
  sceneIndex: number;
}

export interface TakenStep {
  stepId: StepId;
  label: string;
}

/**
 * One player's position in one workflow.
 *
 * Kept plain and serializable on purpose — this object goes into localStorage
 * verbatim. No class instances, no Sets, no Maps, no Dates.
 */
export interface RunState {
  workflowId: WorkflowId;
  status: RunStatus;
  /** Current junction. Deliberately unchanged by a wrong pick. */
  stepId: StepId;
  /** Steps entered, in order. Last entry === stepId. */
  visited: StepId[];
  /** Correct doors taken, in order — this becomes the recipe recap. */
  taken: TakenStep[];
  hintsRemaining: number;
  /** Steps where a hint was spent. Those doors glow. */
  hintedSteps: StepId[];
  wrongCount: number;
  wrongByStep: Record<StepId, number>;
  /** Present iff status === 'deadEnd' or 'failed' — the rule that ended the run is shown either way. */
  deadEnd?: DeadEnd;
  /** Rotates dead-end scenes so the same one never fires twice in a row. */
  sceneCursor: number;
  /** Master Aldric's patience left this run. A wrong pick decrements it; zero sets status: 'failed'. */
  patienceRemaining: number;
}

/** Shape written to localStorage by the state layer. The engine never sees it. */
export interface PersistedProgress {
  version: 1;
  completed: WorkflowId[];
  /** In-flight runs, keyed by workflow id. */
  runs: Record<WorkflowId, RunState>;
}

/* ------------------------------------------------------------------ */
/* Theme                                                               */
/* ------------------------------------------------------------------ */

export interface DeadEndScene {
  id: string;
  /** Key into the SVG component registry. */
  art: string;
  /** Aldric's reaction, shown above the job-aid rule. */
  line: string;
}

/**
 * Design tokens and themed content, read through React context.
 *
 * Two jobs: keep colours and fonts defined once, and keep authored content
 * (Aldric's dead-end scenes, the game's vocabulary) out of scene components.
 * `assets` holds keys into the SVG registry rather than components, so scenes
 * can be built against placeholder art before the real art exists.
 */
export interface ThemeTokens {
  colors: {
    bg: string;
    surface: string;
    ink: string;
    inkMuted: string;
    accent: string;
    /** Hint glow. */
    correct: string;
    wrong: string;
    locked: string;
    cleared: string;
  };

  fonts: {
    display: string;
    body: string;
    /** Door labels are real Cerner button text — keep this plainly legible. */
    ui: string;
  };

  /** The game's vocabulary, defined once so it can drift without a sweep. */
  labels: {
    workflow: string;
    workflowPlural: string;
    dose: string;
    dosePlural: string;
    hint: string;
    hintPlural: string;
    /** Uncountable in normal usage — "3 patience remaining", not "3 patiences". */
    patience: string;
    patiencePlural: string;
    mentor: string;
    overworld: string;
    junction: string;
    complete: string;
  };

  /** Keys into the SVG component registry, not components. */
  assets: {
    mentorPortrait: string;
    doorArt: string;
    overworldArt: string;
    junctionArt: string;
  };

  /** The 5–6 randomized Aldric reactions for dead ends. */
  deadEndScenes: DeadEndScene[];

  /** Aldric's line on the Failed scene, when patience hits zero. */
  outOfPatienceLine: string;

  /** Typewriter reveal speed, ms per character. */
  typewriterMs: number;
}
