# Routine Start Performance — Review & Implementation Plan

## 1. Summary of findings

Starting a routine is slow **not because of the Start button**, but because
the workout session screen that gets pushed re-loads routines, exercises, and
sessions from AsyncStorage on every mount, and it keeps its spinner visible
until the routine data finishes loading.

Confirmed by code inspection:

- `src/app/(home)/routine/index.tsx` — the Start button only calls
  `router.push('/session/exercise-session?routineId=…')` (no async work).
- `src/screens/exercise-session-screen.tsx` — on mount it runs an `init()`
  effect that loads sessions + routines + exercises and reveals the form
  (`setIsInitialized(true)`) only after routines resolve.
- The loader is gated on the `routinesLoading` flag via
  `if (routineId && routinesLoading) return;`, and `routinesLoading` is in the
  effect's dependency array, so the whole effect re-runs when it flips.

Root causes:

1. **No shared cache.** `useRoutines` / `useExercises` / `useWorkoutSessions`
   keep data in per-component state. Every screen that mounts one of these
   hooks re-reads and re-parses AsyncStorage, even though another screen just
   loaded the same data.
2. **Loader gated on full routine load.** The session form is not revealed
   until both custom and default routines have resolved
   (`loading = loading || loadingDefault`).
3. **Redundant reads.** `getWorkoutSessions()` is called up to three times per
   start (early-return pass, second pass, and inside `saveWorkoutSession`),
   and `saveWorkoutSession` rewrites the entire session array.
4. **Large default-exercise JSON** is parsed on every session-screen mount
   (the `note` fields make `src/data/exercises.ts` ~40KB), competing with the
   loader on the JS thread.

## 2. Goal

Make starting a routine feel instant by sharing a single in-memory copy of
routines, exercises, and sessions across screens, and by removing the
redundant reads and the `routinesLoading` loader gate in the session screen.

Non-goals (out of scope for this change):

- Changing the routine-start navigation or session-creation logic.
- Adding a backend or database.
- Redesigning any UI.

## 3. Existing implementation (confirmed)

| File                                      | Responsibility                                                                                                       |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `src/services/routine-storage.ts`         | Custom routine CRUD over AsyncStorage (`@exersaize:custom_routines_v1`), listener-based `subscribeToRoutineUpdates`. |
| `src/services/default-routines.ts`        | Default routine storage + `syncDefaultRoutines` (never auto-invoked).                                                |
| `src/services/exercise-storage.ts`        | Custom exercise CRUD (`@exersaize:custom_exercises_v1`) + `subscribeToExerciseUpdates`.                              |
| `src/services/default-exercises.ts`       | Default exercise storage + `syncDefaultExercises` (never auto-invoked).                                              |
| `src/services/session-storage.ts`         | Session CRUD (`@exersaize:workout_sessions_v1`); `saveWorkoutSession` re-reads the full list before writing.         |
| `src/hooks/use-routines.ts`               | Local-state hook; two reads (custom + default); returns `loading`.                                                   |
| `src/hooks/use-exercises.ts`              | Local-state hook; two reads; returns `loading`.                                                                      |
| `src/hooks/use-workout-sessions.ts`       | Local-state hook; one read; returns `loading`.                                                                       |
| `src/screens/exercise-session-screen.tsx` | `init()` effect loads everything and gates on `routinesLoading`.                                                     |

## 4. Chosen approach

Introduce **module-level in-memory stores** (singleton cache + subscription)
in the storage service layer, and have the existing hooks subscribe to them.

Rationale:

- Zero changes to the ~15 hook call sites (same return shapes).
- The services already expose `subscribeTo*Updates` listeners, so the store
  boundary already exists; we're only adding the cache.
- No provider-tree restructure needed in `src/app/_layout.tsx`.
- `useSyncExternalStore` is already available (used in
  `src/hooks/use-color-scheme.web.ts`).

Alternative considered: React Context providers (matching
`theme/weight-unit/distance-unit` providers). Rejected for this change because
it is more invasive (wrap `_layout.tsx`, rewrite consumers to a context API)
for the same result. It remains a reasonable follow-up if shared data grows.

## 5. Tasks

### Task 1 — Add a small shared store helper

- **Files:** `src/lib/store.ts` (new; or `src/utils/create-store.ts`).
- **Instructions:** Add a generic `createStore<T>(load: () => Promise<T>)`
  helper that:
  - lazily runs `load()` once and caches the result,
  - exposes `getSnapshot()`, `subscribe(listener)`, `get()`, and `refresh()`,
  - calls subscribers when the value changes,
  - keeps the value reference stable between changes (required for
    `useSyncExternalStore`).
- **Acceptance:** A store returns cached data synchronously after first load
  and notifies subscribers on change.
- **Verification:** A focused unit-style check (or a manual `console.log`
  count) confirming `load()` runs exactly once for two sequential `get()`
  calls.

### Task 2 — Cache routines

- **Files:** `src/services/routine-storage.ts`,
  `src/services/default-routines.ts`, `src/hooks/use-routines.ts`.
- **Instructions:**
  - In `routine-storage.ts`, add a module-level store for custom routines
    backed by `getCustomRoutines`. Make `getCustomRoutines()` return the cache
    once loaded, and make `save/update/deleteCustomRoutine` update the cache
    then persist and `notifyListeners()`.
  - In `default-routines.ts`, add a store for `RoutineStorage`
    (`getDefaultRoutines`). Update `syncDefaultRoutines` to write through the
    store.
  - Update `useRoutines` to read both stores via `useSyncExternalStore` and set
    `loading` only until the first load completes. Keep the return shape
    `{ customRoutines, defaultRoutines, loading, refresh, removeRoutine, syncDefault }`.
- **Acceptance:** Navigating between screens that call `useRoutines` no longer
  re-reads AsyncStorage; custom routines added via `saveCustomRoutine` appear
  immediately without a manual refresh.
- **Verification:** Confirm `getCustomRoutines`/`getDefaultRoutines` fire once
  per app session (log/temp counter), and that the routine list, routine
  picker, and edit screens still work.

### Task 3 — Cache exercises

- **Files:** `src/services/exercise-storage.ts`,
  `src/services/default-exercises.ts`, `src/hooks/use-exercises.ts`.
- **Instructions:** Mirror Task 2 for custom exercises (`@exersaize:custom_exercises_v1`)
  and default exercises (`@exersaize:default_exercises_v1`). Write-through
  cache on `save/update/deleteCustomExercise` and `syncDefaultExercises`.
- **Acceptance:** The large default exercise library is parsed once per app
  session, not once per mount.
- **Verification:** Exercise selector and session screen load with correct
  exercise metadata after a single cold load.

### Task 4 — Cache sessions and remove write-time re-reads

- **Files:** `src/services/session-storage.ts`,
  `src/hooks/use-workout-sessions.ts`.
- **Instructions:**
  - Add a module-level store for the session list.
  - Make `getWorkoutSessions()` return the cached list once loaded.
  - Change `saveWorkoutSession`, `updateWorkoutSession`, and
    `deleteWorkoutSession` to mutate the cached list (with the same sort
    ordering) and persist, instead of calling `getWorkoutSessions()` again.
  - Update `useWorkoutSessions` to subscribe to the store.
- **Acceptance:** Starting a routine performs one session read total (not
  three); saving still persists correctly.
- **Verification:** Session list and history stay correct after create/update/
  delete; `saveWorkoutSession` no longer calls `getWorkoutSessions`.

### Task 5 — Refactor the session-screen init

- **Files:** `src/screens/exercise-session-screen.tsx`.
- **Instructions:**
  - Remove `if (routineId && routinesLoading) return;` and drop `routinesLoading`
    from the effect dependencies.
  - Resolve the routine directly from the cached getters
    (`getCustomRoutines()` / `getDefaultRoutines()`, or the store) inside
    `init()` and await them, instead of reading the render-time `loading` flag.
  - Reuse the single `sessionsPromise` (already started) rather than calling
    `getWorkoutSessions()` a second time.
  - Keep all `isMounted` guards. Keep the effect deps to
    `[sessionId, routineId, scheduledOccurrenceId]`.
- **Acceptance:** The form appears as soon as the cached routine data is
  available; on a warm start this is effectively immediate. No double effect
  run.
- **Verification:** `npx tsc --noEmit` + `npx expo lint`; manually start a
  routine twice and confirm the second start shows the form immediately and no
  duplicate sessions are created.

### Task 6 (optional, Phase 2) — Reduce default-exercise parse cost

- **Files:** `src/services/default-exercises.ts`,
  `src/screens/exercise-session-screen.tsx`.
- **Instructions:** Only the exercises referenced by the routine being started
  need to be looked up. Consider resolving references against a lazily loaded
  exercise map rather than the full library on mount. Only pursue if profiling
  shows the parse remains a bottleneck after Tasks 2–4.
- **Acceptance:** First session mount does not parse the entire default
  exercise library on the main path.
- **Verification:** Profile cold start before/after.

## 6. Dependencies / order

1. Task 1 (store helper) — prerequisite for 2–4.
2. Tasks 2, 3, 4 — independent of each other; do routines first (unblocks the
   hot path), then exercises, then sessions.
3. Task 5 — after Tasks 2–4 (depends on cached getters + sessions store).
4. Task 6 — optional, only after 2–4 and if still needed.

## 7. Edge cases & risks

- **Cold launch still pays one load.** The first screen mount after app start
  still reads/parses AsyncStorage. This is expected and unavoidable with
  on-disk persistence; the win is eliminating _repeated_ loads.
- **Cache is the source of truth.** Writes must always update the in-memory
  store and persist, or subsequent reads could serve stale data. All writes
  already route through the service layer, so this is contained.
- **`loading` semantics change.** After the first load, `loading` stays false
  app-wide. Screens that show a spinner on `loading` (e.g.
  `select-routine-screen`) still behave correctly.
- **Default data is never seeded automatically.** `syncDefaultRoutines` /
  `syncDefaultExercises` are defined but never invoked at startup (only
  exposed via the hooks' `syncDefault`/`refresh` returns). A fresh install may
  show an empty default library. This is a pre-existing bug, separate from
  this perf work — flagged, not fixed here.
- **Snapshot stability.** `useSyncExternalStore` requires the snapshot
  reference to be stable between changes; ensure the store only replaces the
  array on actual writes/refresh.

## 9. Handoff to developer

Execute in order: **Task 1 → Task 2 → Task 3 → Task 4 → Task 5**.
Run `npx tsc --noEmit` and `npx expo lint` after Tasks 2–5. Verify manually
that starting a routine twice shows the form immediately the second time and
creates no duplicate sessions. Treat Task 6 as optional, gated on profiling.
