# Migrate Persistence from AsyncStorage to SQLite

This is the working spec for replacing `@react-native-async-storage/async-storage` as the
persistence layer for **user data** with `expo-sqlite`. It is written so an agent can execute
it task-by-task without re-deriving the architecture. Read the whole document once before
starting, then follow the tasks in order.

> SDK context: `expo ~58.1.0`, React Native `0.88.1`. Target package version is
> `expo-sqlite@~58.0.18`. `expo-sqlite` works in Expo Go and needs no config plugin for basic
> usage, but the plugin was added to `app.json` because this project uses `expo-dev-client` and
> the native module must be linked in the development build. A **fresh development build** is
> required after installing `expo-sqlite`.

---

## Implementation Status

**Implemented on 2026-11-27 / 2026-11-28.** All tasks 1–8 are complete and the automated verification
(typecheck, lint, `expo-doctor`, grep checks) passes. The manual smoke test is the only remaining
item; it must be run on a device/simulator after a fresh development build.

---

## 1. Goal

Persist user data in SQLite instead of AsyncStorage so that:

1. **Writes become single-row operations** instead of re-serializing an entire array. Today the
   workout screen rewrites the *whole sessions array* on every set edit.
2. **Reads can be indexed** (e.g. scheduled occurrences by date range) instead of loading and
   filtering the full array in JavaScript.

The in-memory reactive layer (`createStore` + `useSyncExternalStore`) and every public
storage function signature **stay identical**, so screens and hooks do not change their shape.

---

## 2. Locked decisions (do not revisit)

These were decided explicitly and are non-negotiable for this work:

| Decision | Resolution |
| --- | --- |
| Default exercises/routines storage | **Remove it.** They are bundled constants (`src/data/exercises.ts`, `src/data/routine.ts`) and must be read directly, not persisted. (Task 7) |
| Scalar preferences (theme, weight unit, distance unit) | **Keep on AsyncStorage.** More preferences will be added later; AsyncStorage stays installed. (Task 8 does NOT remove AsyncStorage.) |
| Web platform | **Out of scope.** The app targets iOS and Android only. Skip all `expo-sqlite` web/wasm Metro config. |
| DB init style | **Module-level singleton.** A `getDb()` function that lazily opens the database once. Do not use `SQLiteProvider`/`useSQLiteContext` yet. |

---

## 3. Current architecture (confirmed facts)

### 3.1 Reactive layer

`src/lib/store.ts` exports `createStore<T>(load, initialValue)` returning:

```
{ getSnapshot, get, subscribe, refresh, ensureLoaded, setValue }
```

- Hooks read it with `useSyncExternalStore(store.subscribe, store.getSnapshot)`.
- `ensureLoaded()` runs the async `load()` once and caches the result in memory.
- `setValue()` replaces the in-memory value and notifies subscribers synchronously.

Each storage service **also** keeps its own `listeners` Set and a `notifyListeners()` helper,
exposed as `subscribeToXxxUpdates()`. Both mechanisms must keep firing after the rewrite.

### 3.2 The data domains

Four user-data domains persist to AsyncStorage, each as a single JSON array under one key:

| Domain | Service file | AsyncStorage key | Uses `createStore`? | Listener export |
| --- | --- | --- | --- | --- |
| Custom exercises | `src/services/exercise-storage.ts` | `@exersaize:custom_exercises_v1` | yes | `subscribeToExerciseUpdates` |
| Custom routines | `src/services/routine-storage.ts` | `@exersaize:custom_routines_v1` | yes | `subscribeToRoutineUpdates` |
| Workout sessions | `src/services/session-storage.ts` | `@exersaize:workout_sessions_v1` | yes | `subscribeToSessionUpdates` |
| Scheduled occurrences | `src/services/schedule-storage.ts` | `@exersaize:scheduled_occurrences_v1` | **no** (direct reads + listener) | `subscribeToScheduleUpdates` |

Two more AsyncStorage keys are **dead weight** (bundled static data copied to storage):

| Domain | Service file | AsyncStorage key |
| --- | --- | --- |
| Default exercises | `src/services/default-exercises.ts` | `@exersaize:default_exercises_v1` |
| Default routines | `src/services/default-routines.ts` | `@exersaize:default_routines_v1` |

> Confirmed: `syncDefaultExercises` / `syncDefaultRoutines` are **never called anywhere** in the
> codebase (only defined). Task 7 removes this entirely.

Three small scalar preferences stay on AsyncStorage (untouched by this work):

| Preference | File | Key |
| --- | --- | --- |
| Theme | `src/providers/theme-provider.tsx` | `@exersaize:theme_preference_v1` |
| Weight unit | `src/providers/weight-unit-provider.tsx` | `@exersaize:weight_unit_preference_v1` |
| Distance unit | `src/providers/distance-unit-provider.tsx` | `@exersaize:distance_unit_preference_v1` |

### 3.3 Type shapes (from `src/types/`)

These exact fields matter for the SQL column ↔ row mapping.

```ts
// src/types/exercise.ts
type ExerciseType = 'Bodyweight' | 'Strength';
type TrackMetric = 'Reps' | 'Time' | 'Distance';
interface ExerciseItem {
  id: string; name: string; type: ExerciseType;
  categories: string[]; trackMetrics: TrackMetric[];
  note?: string; isCustom?: boolean; createdAt?: number;
}

// src/types/routine.ts
interface RoutineExercise {
  id: string; exerciseId: string; name: string;
  type?: ExerciseType; categories?: string[];
  sets: number; repRange: string;
}
interface RoutineItem {
  id: string; name: string; description?: string;
  exercises?: RoutineExercise[]; exerciseCount?: number;
  isCustom?: boolean; createdAt?: number;
}

// src/types/session.ts
type ReferenceMode = 'last' | 'pr';
interface SessionSet {
  id: string; setNumber: number; weight?: number; reps?: number;
  timeInSeconds?: number; distance?: number; completed?: boolean; note?: string;
}
interface SessionExercise {
  id: string; exerciseId: string; name: string;
  type?: ExerciseType; categories?: string[]; trackMetrics?: TrackMetric[];
  sets: SessionSet[]; note?: string;
}
interface WorkoutSession {
  id: string; title: string; description?: string; routineId?: string;
  startTime: number; endTime?: number | null;
  exercises: SessionExercise[]; referenceMode?: ReferenceMode; createdAt: number;
}

// src/types/schedule.ts
type Recurrence = 'none' | 'weekly' | 'monthly';
interface ScheduledOccurrence {
  id: string; scheduledDate: string;          // 'yyyy-MM-dd' local
  status: 'scheduled' | 'completed' | 'skipped' | 'cancelled';
  routineId?: string; title?: string;
  startTime?: string; endTime?: string;        // 'HH:mm'
  allDay?: boolean; recurrence?: Recurrence;
  notes?: string; seriesId?: string; workoutSessionId?: string;
}
```

---

## 4. Target architecture

### 4.1 Singleton database (module-level)

New files under `src/db/`. Services import only `getDb()` from `src/db/database.ts`.

```ts
// src/db/database.ts
import * as SQLite from 'expo-sqlite';
import { migrate } from './migrations';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function open(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync('exersaize.db');
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  await migrate(db);
  return db;
}

/** Lazily opens the database once and runs migrations. Call at the start of every service function. */
export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = open();
  }
  return dbPromise;
}
```

Why a singleton instead of `SQLiteProvider`: the storage services are plain modules (not React
components), so they cannot use `useSQLiteContext()`. A module-level promise matches the existing
architecture with the smallest change.

### 4.2 Schema (exact SQL)

Put this DDL in `src/db/migrations.ts`, executed inside `migrate(db)`.

```sql
CREATE TABLE IF NOT EXISTS exercises (
  id            TEXT PRIMARY KEY NOT NULL,
  name          TEXT NOT NULL,
  type          TEXT NOT NULL,
  categories    TEXT NOT NULL,   -- JSON array of string
  track_metrics TEXT NOT NULL,   -- JSON array of TrackMetric
  note          TEXT,
  is_custom     INTEGER NOT NULL DEFAULT 0,
  created_at    INTEGER
);

CREATE TABLE IF NOT EXISTS routines (
  id             TEXT PRIMARY KEY NOT NULL,
  name           TEXT NOT NULL,
  description    TEXT,
  exercises      TEXT NOT NULL,   -- JSON array of RoutineExercise
  exercise_count INTEGER,
  is_custom      INTEGER NOT NULL DEFAULT 0,
  created_at     INTEGER
);

CREATE TABLE IF NOT EXISTS sessions (
  id             TEXT PRIMARY KEY NOT NULL,
  title          TEXT NOT NULL,
  description    TEXT,
  routine_id     TEXT,
  start_time     INTEGER NOT NULL,
  end_time       INTEGER,
  exercises      TEXT NOT NULL,   -- JSON array of SessionExercise
  reference_mode TEXT,
  created_at     INTEGER
);

CREATE TABLE IF NOT EXISTS occurrences (
  id                 TEXT PRIMARY KEY NOT NULL,
  scheduled_date     TEXT NOT NULL,   -- 'yyyy-MM-dd'
  status             TEXT NOT NULL,
  routine_id         TEXT,
  title              TEXT,
  start_time         TEXT,            -- 'HH:mm'
  end_time           TEXT,            -- 'HH:mm'
  all_day            INTEGER,
  recurrence         TEXT,
  notes              TEXT,
  series_id          TEXT,
  workout_session_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_occurrences_scheduled_date ON occurrences (scheduled_date);
CREATE INDEX IF NOT EXISTS idx_occurrences_series_id     ON occurrences (series_id);
```

Design note (do not over-normalize): nested arrays (`exercises` inside routines, `sets` inside
session exercises) are stored as **JSON TEXT columns**, not separate tables. The app only ever
reads/writes whole entities, so JSON columns keep the migration simple and the behavior identical.

### 4.3 What stays exactly the same

For every service rewrite, preserve verbatim:

- The public function names and signatures (`getCustomExercises`, `saveCustomRoutine`, etc.).
- The `createStore` + `listeners`/`notifyListeners`/`subscribeToXxxUpdates` reactive plumbing.
- The in-memory update pattern: after a successful DB write, still call `store.setValue(newList)`
  and `notifyListeners()`.
- ID generation (`routine_...`, `session_...`, `custom_...`, `occ_...` strings).
- All business logic (especially the recurrence/scope logic in `schedule-storage.ts`).

The **only** things that change are:

- The `load` function: `AsyncStorage.getItem` + `JSON.parse` → `getAllAsync(...)` + row mapper.
- Each write: `AsyncStorage.setItem(KEY, JSON.stringify(wholeList))` → one `INSERT`/`UPDATE`/`DELETE`.

---

## 5. Execution plan (ordered tasks)

Run `npx tsc --noEmit` and `npx expo lint` after every task. Do not claim a check passed unless
it was actually executed.

---

### Task 1 — Install `expo-sqlite` ✅ COMPLETED

**Goal:** Add the dependency.

**Commands:**

```sh
npx expo install expo-sqlite
```

**Instructions:** Use `npx expo install` (per `AGENTS.md`), not a bare package manager. Do not add
a config plugin to `app.json` — basic SQLite needs none.

**Acceptance criteria:** `expo-sqlite` at `~58.0.x` in `package.json`.

**Verification:** `npx expo-doctor` reports no issues; `npx tsc --noEmit` still passes.

---

### Task 2 — Create the DB layer + one-time migration ✅ COMPLETED

**Goal:** `getDb()` exists, creates the schema, and migrates existing AsyncStorage data exactly once.

**Files (new):**

- `src/db/database.ts` — the singleton from §4.1.
- `src/db/migrations.ts` — `migrate(db)` = create tables + run data migration, guarded by
  `PRAGMA user_version`.

**Instructions for `src/db/migrations.ts`:**

1. `migrate(db)` reads `PRAGMA user_version`. If `>= 1`, return immediately.
2. Create all tables and indexes with `db.execAsync(...)` (SQL from §4.2).
3. Run the one-time data migration (below) inside `db.withTransactionAsync(...)`.
4. Set `PRAGMA user_version = 1`.

Keep `@react-native-async-storage/async-storage` imported here only as the migration source — it
stays installed for the preference providers.

**Data migration (exact mapping).** For each of the four keys: `AsyncStorage.getItem(key)` →
`JSON.parse` → if it is an array, `INSERT OR IGNORE` each item into its table. Skip a table when the
key is missing.

```ts
import AsyncStorage from '@react-native-async-storage/async-storage';

type Ctx = { db: SQLite.SQLiteDatabase };

const migrateExercises = async ({ db }: Ctx) => {
  const raw = await AsyncStorage.getItem('@exersaize:custom_exercises_v1');
  if (!raw) return;
  const list = JSON.parse(raw);
  if (!Array.isArray(list)) return;
  for (const e of list) {
    await db.runAsync(
      `INSERT OR IGNORE INTO exercises
        (id, name, type, categories, track_metrics, note, is_custom, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 1, ?)`,
      e.id, e.name, e.type,
      JSON.stringify(e.categories ?? []),
      JSON.stringify(e.trackMetrics ?? []),
      e.note ?? null,
      e.createdAt ?? null
    );
  }
};
```

Apply the same pattern to the other three tables:

| Key | Table | Columns (in order) | Values per item |
| --- | --- | --- | --- |
| `@exersaize:custom_routines_v1` | `routines` | `id, name, description, exercises, exercise_count, is_custom, created_at` | `e.id, e.name, e.description ?? null, JSON.stringify(e.exercises ?? []), e.exerciseCount ?? null, 1, e.createdAt ?? null` |
| `@exersaize:workout_sessions_v1` | `sessions` | `id, title, description, routine_id, start_time, end_time, exercises, reference_mode, created_at` | `e.id, e.title, e.description ?? null, e.routineId ?? null, e.startTime ?? e.createdAt, e.endTime ?? null, JSON.stringify(e.exercises ?? []), e.referenceMode ?? null, e.createdAt` |
| `@exersaize:scheduled_occurrences_v1` | `occurrences` | `id, scheduled_date, status, routine_id, title, start_time, end_time, all_day, recurrence, notes, series_id, workout_session_id` | `e.id, e.scheduledDate, e.status ?? 'scheduled', e.routineId ?? null, e.title ?? null, e.startTime ?? null, e.endTime ?? null, e.allDay ? 1 : 0, e.recurrence ?? 'none', e.notes ?? null, e.seriesId ?? null, e.workoutSessionId ?? null` |

Do **not** migrate `default_exercises_v1` / `default_routines_v1` — that data is bundled and will
be dropped in Task 7.

**Important:** Do not delete the AsyncStorage keys after migrating. Keep them for at least one
release so a rollback is possible.

**Acceptance criteria:** After first launch of the updated build, all prior user data (custom
exercises, routines, sessions, schedule) is present and identical; `PRAGMA user_version` is `1`; a
fresh install (no old keys) migrates without error.

**Verification:** `npx tsc --noEmit`; `npx expo lint`. Manual: run an old build with data, upgrade,
confirm data intact; then a fresh install, confirm no migration errors.

---

### Task 3 — Rewrite `src/services/exercise-storage.ts` ✅ COMPLETED

**Goal:** Same public API, SQLite persistence.

**Changes (keep everything else identical):**

- Replace `import AsyncStorage ...` and the `STORAGE_KEY` constant with `import { getDb } from '@/db/database';`.
- Rewrite `loadCustomExercises` to query the `exercises` table:

```ts
type ExerciseRow = {
  id: string; name: string; type: string;
  categories: string; track_metrics: string; note: string | null;
  is_custom: number; created_at: number | null;
};

async function loadCustomExercises(): Promise<ExerciseItem[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<ExerciseRow>(
    'SELECT * FROM exercises WHERE is_custom = 1 ORDER BY created_at DESC'
  );
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    type: r.type as ExerciseType,
    categories: JSON.parse(r.categories) as string[],
    trackMetrics: JSON.parse(r.track_metrics) as TrackMetric[],
    note: r.note ?? undefined,
    isCustom: true,
    createdAt: r.created_at ?? undefined,
  }));
}
```

- `saveCustomExercise`: after building `newExercise`, run
  `INSERT INTO exercises (id, name, type, categories, track_metrics, note, is_custom, created_at)
   VALUES (?, ?, ?, ?, ?, ?, 1, ?)` with `newExercise.id`, `name`, `type`,
  `JSON.stringify(categories)`, `JSON.stringify(trackMetrics)`, `note ?? null`, `createdAt ?? null`,
  then `customExerciseStore.setValue([newExercise, ...currentList])` and `notifyListeners()`. Return `newExercise`.
- `updateCustomExercise`: run
  `UPDATE exercises SET name = ?, type = ?, categories = ?, track_metrics = ?, note = ? WHERE id = ?`
  (values in that order), then `setValue(updatedList)` and `notifyListeners()`.
- `deleteCustomExercise`: run `DELETE FROM exercises WHERE id = ?`, then `setValue(updatedList)` and `notifyListeners()`.
- Keep `getCustomExercises`, the `createStore`, and the listener plumbing unchanged.

**Acceptance criteria:** Add/edit/delete a custom exercise behaves exactly as before; the Exercise
screen updates reactively.

**Verification:** `npx tsc --noEmit`; `npx expo lint`; manual add/edit/delete in the app.

---

### Task 4 — Rewrite `src/services/routine-storage.ts` ✅ COMPLETED

**Goal:** Same public API, SQLite persistence. (This is the reference implementation — mirror its
shape in Tasks 3 and 5.)

**Full reference** for the load + writes (listener plumbing and `getCustomRoutineById` stay
unchanged):

```ts
import { getDb } from '@/db/database';
import { createStore } from '@/lib/store';
import { RoutineItem, RoutineExercise } from '@/types/routine';

type RoutineRow = {
  id: string; name: string; description: string | null;
  exercises: string; exercise_count: number | null;
  is_custom: number; created_at: number | null;
};

async function loadCustomRoutines(): Promise<RoutineItem[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<RoutineRow>(
    'SELECT * FROM routines WHERE is_custom = 1 ORDER BY created_at DESC'
  );
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description ?? undefined,
    exercises: JSON.parse(r.exercises) as RoutineExercise[],
    exerciseCount: r.exercise_count ?? undefined,
    isCustom: true,
    createdAt: r.created_at ?? undefined,
  }));
}

export const customRoutineStore = createStore<RoutineItem[]>(loadCustomRoutines, []);

// listeners / notifyListeners / subscribeToRoutineUpdates: UNCHANGED

export async function getCustomRoutines(): Promise<RoutineItem[]> {
  await customRoutineStore.ensureLoaded();
  return customRoutineStore.get();
}

export async function getCustomRoutineById(id: string): Promise<RoutineItem | null> {
  const list = await getCustomRoutines();
  return list.find((item) => item.id === id) ?? null;
}

export async function saveCustomRoutine(data: {
  name: string; description?: string; exercises: RoutineExercise[];
}): Promise<RoutineItem> {
  try {
    const currentList = customRoutineStore.get();
    const newRoutine: RoutineItem = {
      id: `routine_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: data.name.trim(),
      description: data.description?.trim() || undefined,
      exercises: data.exercises,
      exerciseCount: data.exercises.length,
      isCustom: true,
      createdAt: Date.now(),
    };

    const db = await getDb();
    await db.runAsync(
      `INSERT INTO routines (id, name, description, exercises, exercise_count, is_custom, created_at)
       VALUES (?, ?, ?, ?, ?, 1, ?)`,
      newRoutine.id,
      newRoutine.name,
      newRoutine.description ?? null,
      JSON.stringify(newRoutine.exercises ?? []),
      newRoutine.exerciseCount ?? null,
      newRoutine.createdAt ?? null
    );

    customRoutineStore.setValue([newRoutine, ...currentList]);
    notifyListeners();
    return newRoutine;
  } catch (error) {
    console.error('Failed to save custom routine:', error);
    throw error;
  }
}

export async function updateCustomRoutine(
  id: string,
  data: { name: string; description?: string; exercises: RoutineExercise[] }
): Promise<void> {
  try {
    const currentList = customRoutineStore.get();
    const updatedList = currentList.map((item) =>
      item.id === id
        ? { ...item, name: data.name.trim(), description: data.description?.trim() || undefined,
            exercises: data.exercises, exerciseCount: data.exercises.length }
        : item
    );

    const db = await getDb();
    await db.runAsync(
      `UPDATE routines SET name = ?, description = ?, exercises = ?, exercise_count = ? WHERE id = ?`,
      data.name.trim(),
      data.description?.trim() || null,
      JSON.stringify(data.exercises),
      data.exercises.length,
      id
    );

    customRoutineStore.setValue(updatedList);
    notifyListeners();
  } catch (error) {
    console.error('Failed to update custom routine:', error);
    throw error;
  }
}

export async function deleteCustomRoutine(id: string): Promise<void> {
  try {
    const currentList = customRoutineStore.get();
    const updatedList = currentList.filter((item) => item.id !== id);

    const db = await getDb();
    await db.runAsync('DELETE FROM routines WHERE id = ?', id);

    customRoutineStore.setValue(updatedList);
    notifyListeners();
  } catch (error) {
    console.error('Failed to delete custom routine:', error);
    throw error;
  }
}
```

**Acceptance criteria:** Add/edit/delete routine behaves as before; Routines screen updates.

**Verification:** `npx tsc --noEmit`; `npx expo lint`; manual add/edit/delete.

---

### Task 5 — Rewrite `src/services/session-storage.ts` ✅ COMPLETED

**Goal:** Same public API, single-row writes. This is the biggest real-world perf win (the workout
screen calls `updateWorkoutSession` on every set edit).

**Changes:**

- `loadWorkoutSessions`: `SELECT * FROM sessions ORDER BY start_time DESC` (this reproduces the
  existing newest-first sort). Map rows:

```ts
type SessionRow = {
  id: string; title: string; description: string | null;
  routine_id: string | null; start_time: number; end_time: number | null;
  exercises: string; reference_mode: string | null; created_at: number;
};

function rowToSession(r: SessionRow): WorkoutSession {
  return {
    id: r.id,
    title: r.title,
    description: r.description ?? undefined,
    routineId: r.routine_id ?? undefined,
    startTime: r.start_time,
    endTime: r.end_time,
    exercises: JSON.parse(r.exercises) as SessionExercise[],
    referenceMode: (r.reference_mode ?? undefined) as ReferenceMode | undefined,
    createdAt: r.created_at,
  };
}
```

- `saveWorkoutSession`: `INSERT INTO sessions (id, title, description, routine_id, start_time,
  end_time, exercises, reference_mode, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, then
  `setValue` + `notifyListeners`.
- `updateWorkoutSession`: after computing `updatedSession`, run
  `UPDATE sessions SET title = ?, description = ?, start_time = ?, end_time = ?, exercises = ?,
  reference_mode = ? WHERE id = ?`, then `setValue(updatedList)` + `notifyListeners`, and return
  `updatedSession`. (Preserve the existing "session not found → throw" behavior.)
- `deleteWorkoutSession`: `DELETE FROM sessions WHERE id = ?`, then `setValue` + `notifyListeners`.

**Acceptance criteria:** Session auto-save, finish, and delete behave as before, but each set edit
now issues a single-row `UPDATE` rather than rewriting the whole sessions array.

**Verification:** `npx tsc --noEmit`; `npx expo lint`; manual: start a session, edit sets, finish,
confirm it persists and appears in history.

---

### Task 6 — Rewrite `src/services/schedule-storage.ts` ✅ COMPLETED

**Goal:** Same public API and listener behavior, SQLite persistence. This file has **no** `createStore`
— it reads/writes directly and notifies via `notifyListeners()`. Keep that structure.

**Changes:**

- `getScheduledOccurrences`: `SELECT * FROM occurrences ORDER BY scheduled_date` and map rows back
  to `ScheduledOccurrence` (reverse of the migration mapping in Task 2; `all_day` is `0|1` →
  boolean, nullable TEXT fields → `?? undefined`).
- `getScheduledOccurrenceById`: keep the current "load all, find by id" approach (simplest), or use
  `SELECT * FROM occurrences WHERE id = ?` via `getFirstAsync`.
- Replace each `AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list))` with SQL:
  - `persistOccurrences(list)` currently writes the whole list; the callers (`updateScheduledOccurrence`,
    `deleteScheduledOccurrence`, `updateScheduledOccurrenceWithScope`, `saveScheduledOccurrence`)
    compute a new list. **Do not rewrite the recurrence/scope logic.** Instead, either (a) compute the
    *diff* and write individual `INSERT`/`UPDATE`/`DELETE` statements, or (b) keep it simple and
    acceptable for now: write the whole list inside a transaction (`DELETE` all rows for the affected
    ids then `INSERT` them). Option (b) is lower-risk and still removes the JSON serialization on
    every call; choose (b) for this task and note the optimization.
- `saveScheduledOccurrence`: `INSERT` each generated occurrence (it returns `occurrences[]`).
- Keep `buildOccurrences`, `applySeriesEditAll`, `applySeriesEditFuture`, and `notifyListeners`
  **verbatim** — they operate on the in-memory array.

**Optional enhancement (clearly separated, do after the core swap is verified):** add a
`getScheduledOccurrencesInRange(startKey: string, endKey: string)` using
`WHERE scheduled_date >= ? AND scheduled_date <= ?`, and use it in `use-scheduled-occurrences.ts`
instead of filtering all occurrences in JS. This is where the indexed read pays off.

**Acceptance criteria:** Schedule create/edit/delete and recurrence scoping behave identically;
calendar renders correctly.

**Verification:** `npx tsc --noEmit`; `npx expo lint`; manual: create one-time, weekly, and monthly
activities; edit "this"/"future"/"all"; delete; confirm calendar and detail screen.

---

### Task 7 — Remove default-data persistence (use bundled static data) ✅ COMPLETED

**Goal:** Default exercises/routines come straight from `@/data/*`, never from storage.

**Files:**

- **New** `src/services/default-data.ts`:

```ts
import { DEFAULT_EXERCISES } from '@/data/exercises';
import { DEFAULT_ROUTINES } from '@/data/routine';
import { ExerciseItem } from '@/types/exercise';
import { RoutineItem } from '@/types/routine';

const defaultExerciseMap = new Map(DEFAULT_EXERCISES.map((e) => [e.id, e]));

export function getDefaultExercises(): ExerciseItem[] {
  return DEFAULT_EXERCISES;
}

export function getDefaultRoutines(): RoutineItem[] {
  return DEFAULT_ROUTINES;
}

export function getDefaultExerciseById(id: string): ExerciseItem | undefined {
  return defaultExerciseMap.get(id);
}

export function findDefaultExerciseByName(name: string): ExerciseItem | undefined {
  return DEFAULT_EXERCISES.find((e) => e.name === name);
}
```

  > `DEFAULT_ROUTINES` is typed with a local `Routine` interface in `src/data/routine.ts`. It is
  > structurally identical to `RoutineItem`, so returning it as `RoutineItem[]` type-checks. If the
  > compiler complains, use `return DEFAULT_ROUTINES as RoutineItem[];`.

- **Delete** `src/services/default-exercises.ts` and `src/services/default-routines.ts`.

- **`src/hooks/use-exercises.ts`**:
  - Remove the `defaultExerciseStore` / `syncDefaultExercises` imports and the second `useSyncExternalStore`.
  - Set `const defaultExercises = getDefaultExercises();`.
  - In the mount effect, wait only on `customExerciseStore.ensureLoaded()`.
  - Remove the `syncDefault` callback and its return entry (grep confirms `syncDefault` has no callers).

- **`src/hooks/use-routines.ts`**: mirror the above with `getDefaultRoutines()`, waiting only on
  `customRoutineStore.ensureLoaded()`, and remove `syncDefault`.

- **`src/screens/exercise-session-screen.tsx`**:
  - Replace `import { getDefaultRoutines } from '@/services/default-routines';` and
    `import { findDefaultExerciseByName, getDefaultExerciseById } from '@/services/default-exercises';`
    with a single `import { findDefaultExerciseByName, getDefaultExerciseById, getDefaultRoutines } from '@/services/default-data';`.
  - Replace the routine resolution block:

    ```ts
    const [customRoutines, defaultRoutines] = await Promise.all([
      getCustomRoutines(),
      getDefaultRoutines(),
    ]);
    const routine =
      customRoutines.find((r) => r.id === routineId) ??
      defaultRoutines.data.find((r) => r.id === routineId);
    ```

    with:

    ```ts
    const customRoutines = await getCustomRoutines();
    const routine =
      customRoutines.find((r) => r.id === routineId) ??
      getDefaultRoutines().find((r) => r.id === routineId);
    ```

  - Remove the now-unneeded `await` on `getDefaultExerciseById(...)` and `findDefaultExerciseByName(...)`
    (both are now synchronous).

**Acceptance criteria:** Exercise Library and Routine Library render the bundled data with zero
persistence involvement; starting a workout from a built-in routine still resolves its exercises.

**Verification:** `npx tsc --noEmit`; `npx expo lint`; grep confirms no remaining imports of
`default-exercises` / `default-routines`; manual: open Exercises and Routines lists, start a built-in
routine workout.

---

### Task 8 — Keep AsyncStorage for preferences (do NOT remove it) ✅ COMPLETED

**Goal:** Confirm AsyncStorage stays installed and used by the three preference providers, and that
the migration left their keys untouched.

**Instructions:** No code change. Do **not** uninstall `@react-native-async-storage/async-storage`
and do **not** rewrite `theme-provider.tsx`, `weight-unit-provider.tsx`, or
`distance-unit-provider.tsx`. The migration in Task 2 must not read or write the three preference keys.

**Acceptance criteria:** Theme and unit preferences persist across restarts exactly as before.

**Verification:** Toggle dark mode, switch weight/distance units, force-quit and relaunch, confirm
values persist.

---

## 6. Data-migration safety (highest-risk area)

1. Migration runs **once**, guarded by `PRAGMA user_version`.
2. Wrap all `INSERT`s in `db.withTransactionAsync(...)` so a mid-way failure rolls back.
3. Use `INSERT OR IGNORE` (by primary key) so re-running is safe.
4. Do **not** delete the old AsyncStorage keys after migration. Keep them for at least one release.
5. Do not migrate `default_exercises_v1` / `default_routines_v1`, and do not touch the three
   preference keys.
6. `expo-sqlite` `runAsync` bind values cannot be `undefined`; always pass `null` for nullable
   columns (the snippets above use `?? null` everywhere).

## 7. Edge cases and risks

- **Data loss on migration** — highest risk. Mitigated by transaction + `user_version` gate + keeping
  old keys.
- **JSON columns vs. normalization** — storing nested arrays as JSON means no SQL-level queries
  inside routines/sets. The app never needs that; keep JSON columns.
- **Singleton vs. `SQLiteProvider`** — singleton is chosen now; if the app later needs Suspense-style
  init or context access in components, revisit, but do not mix both patterns in one PR.
- **`syncDefault*` is dead code** — confirmed never called; Task 7 removes it. If any future grep
  finds a caller, stop and reassess before deleting.
- **Type bridge for `DEFAULT_ROUTINES`** — the local `Routine` type in `src/data/routine.ts` is
  structurally assignable to `RoutineItem`, but keep the cast handy if the compiler disagrees.
- **Do not change business logic** — especially `schedule-storage.ts` recurrence/scope functions and
  the `RoutineItem`/`WorkoutSession` field semantics.

## 8. Final verification checklist

Run these once at the end, after all tasks:

- [x] `npx tsc --noEmit` passes.
- [x] `npx expo lint` passes.
- [x] `npx expo-doctor` reports no issues.
- [x] `grep -RniE 'AsyncStorage' src/services` returns no matches; no service file imports AsyncStorage
      directly. The only remaining AsyncStorage usage in user-data code is in `src/db/migrations.ts`
      as the migration source.
- [x] `grep -RniE "default-exercises|default-routines" src` returns no matches (files deleted).
- [ ] Manual smoke test: add/edit/delete exercise, routine, session, and schedule item; start a
      built-in routine; toggle theme/units and relaunch. (Run after installing a fresh development
      build.)

## 9. Definition of done

- [x] `expo-sqlite` installed; singleton `getDb()` + schema + guarded migration exist under `src/db/`.
- [x] All four user-data services persist to SQLite with unchanged public APIs and reactive behavior.
- [x] Session set edits issue single-row `UPDATE`s (no whole-array rewrite).
- [x] Default exercises/routines load from bundled data; `default-exercises.ts`/`default-routines.ts`
      are deleted.
- [x] AsyncStorage remains only for the three preference providers (and as the migration source).
- [x] Migration is one-time, transactional, and leaves old keys intact for rollback.
- [x] Typecheck, lint, and `expo-doctor` all pass.
- [ ] Manual smoke test passes (run after fresh development build).

## 10. Recommended order and handoff

Execute **1 → 2 → 3 → 4 → 5 → 6 → 7 → 8**. Tasks 1–2 are prerequisites for everything. Tasks 3–5
are the core and can be done in one change set as a proof (Task 4 is the reference implementation).
Task 6 is independent but reuses the same patterns; do its optional range-query only after the core
swap is verified. Task 7 is a pure simplification and can land last. Task 8 is a no-op guardrail.

First deliverable should be Tasks 1–5 (install + DB layer + the three CRUD services) so one domain is
proven end-to-end before touching schedule and default-data.

---

## 11. Implementation Notes

- `expo-sqlite` was installed with `npx expo install expo-sqlite`.
- During installation, Expo auto-added `"expo-sqlite"` to the `plugins` array in `app.json`. It was
  initially removed to match the original plan's "no config plugin" instruction, but a
  "couldn't find native module ExpoSQLite" error in the development build required adding it back.
  With `expo-dev-client` in use, a fresh development build is required after adding the module.
- The optional `getScheduledOccurrencesInRange(startKey, endKey)` was implemented and integrated
  into `use-scheduled-occurrences.ts` so calendar reads use the indexed date range.
- All public storage function signatures, reactive store plumbing, listener behavior, ID generation,
  and business logic (including schedule recurrence/scope logic) were preserved.
- Legacy AsyncStorage user-data keys were intentionally **not** deleted so a rollback is possible for
  at least one release.
