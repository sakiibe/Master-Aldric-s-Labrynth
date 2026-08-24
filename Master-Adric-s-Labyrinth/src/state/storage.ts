/**
 * The only module that touches `localStorage`. Load is tolerant of missing
 * or corrupt data — a blank slate, never a crash — because this is a
 * training tool, not a system of record.
 */

import type { PersistedProgress, RunState, WorkflowId } from '../game/types';

const STORAGE_KEY = 'pharmacy-cutover-maze/progress';
const CURRENT_VERSION = 1;

function empty(): PersistedProgress {
  return { version: CURRENT_VERSION, completed: [], runs: {} };
}

function isPersistedProgress(value: unknown): value is PersistedProgress {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    v.version === CURRENT_VERSION &&
    Array.isArray(v.completed) &&
    typeof v.runs === 'object' &&
    v.runs !== null
  );
}

/** Reads progress from localStorage. Any failure — missing key, bad JSON,
 * unrecognized shape — falls back to a fresh, empty PersistedProgress. */
export function loadProgress(): PersistedProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty();
    const parsed: unknown = JSON.parse(raw);
    return isPersistedProgress(parsed) ? parsed : empty();
  } catch {
    return empty();
  }
}

/** Writes progress to localStorage. Swallows failures (quota, private
 * browsing) — losing persistence is not worth crashing the game over. */
export function saveProgress(progress: PersistedProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // localStorage unavailable — progress simply won't survive a reload.
  }
}

/** The completed-workflow list, for gating the Overworld with `isUnlocked()`. */
export function getCompleted(): WorkflowId[] {
  return loadProgress().completed;
}

/** Persists a single workflow's run, keeping the rest of `progress` intact. */
export function saveRun(
  workflowId: WorkflowId,
  run: RunState,
): void {
  const progress = loadProgress();
  progress.runs[workflowId] = run;
  saveProgress(progress);
}

/** Removes a single workflow's in-flight run — used when a run fails, since
 * a failed run does not persist (closing the tab mid-death and returning
 * starts the workflow fresh rather than resuming into the failed scene). */
export function clearRun(workflowId: WorkflowId): void {
  const progress = loadProgress();
  delete progress.runs[workflowId];
  saveProgress(progress);
}

/** Marks a workflow complete and drops its in-flight run — it is no longer
 * one. */
export function markCompleted(workflowId: WorkflowId): void {
  const progress = loadProgress();
  delete progress.runs[workflowId];
  if (!progress.completed.includes(workflowId)) {
    progress.completed.push(workflowId);
  }
  saveProgress(progress);
}
