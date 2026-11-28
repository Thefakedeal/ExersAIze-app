import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS exercises (
  id            TEXT PRIMARY KEY NOT NULL,
  name          TEXT NOT NULL,
  type          TEXT NOT NULL,
  categories    TEXT NOT NULL,
  track_metrics TEXT NOT NULL,
  note          TEXT,
  is_custom     INTEGER NOT NULL DEFAULT 0,
  created_at    INTEGER
);

CREATE TABLE IF NOT EXISTS routines (
  id             TEXT PRIMARY KEY NOT NULL,
  name           TEXT NOT NULL,
  description    TEXT,
  exercises      TEXT NOT NULL,
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
  exercises      TEXT NOT NULL,
  reference_mode TEXT,
  created_at     INTEGER
);

CREATE TABLE IF NOT EXISTS occurrences (
  id                 TEXT PRIMARY KEY NOT NULL,
  scheduled_date     TEXT NOT NULL,
  status             TEXT NOT NULL,
  routine_id         TEXT,
  title              TEXT,
  start_time         TEXT,
  end_time           TEXT,
  all_day            INTEGER,
  recurrence         TEXT,
  notes              TEXT,
  series_id          TEXT,
  workout_session_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_occurrences_scheduled_date ON occurrences (scheduled_date);
CREATE INDEX IF NOT EXISTS idx_occurrences_series_id     ON occurrences (series_id);
`;

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
      e.id,
      e.name,
      e.type,
      JSON.stringify(e.categories ?? []),
      JSON.stringify(e.trackMetrics ?? []),
      e.note ?? null,
      e.createdAt ?? null
    );
  }
};

const migrateRoutines = async ({ db }: Ctx) => {
  const raw = await AsyncStorage.getItem('@exersaize:custom_routines_v1');
  if (!raw) return;
  const list = JSON.parse(raw);
  if (!Array.isArray(list)) return;
  for (const e of list) {
    await db.runAsync(
      `INSERT OR IGNORE INTO routines
        (id, name, description, exercises, exercise_count, is_custom, created_at)
       VALUES (?, ?, ?, ?, ?, 1, ?)`,
      e.id,
      e.name,
      e.description ?? null,
      JSON.stringify(e.exercises ?? []),
      e.exerciseCount ?? null,
      e.createdAt ?? null
    );
  }
};

const migrateSessions = async ({ db }: Ctx) => {
  const raw = await AsyncStorage.getItem('@exersaize:workout_sessions_v1');
  if (!raw) return;
  const list = JSON.parse(raw);
  if (!Array.isArray(list)) return;
  for (const e of list) {
    await db.runAsync(
      `INSERT OR IGNORE INTO sessions
        (id, title, description, routine_id, start_time, end_time, exercises, reference_mode, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      e.id,
      e.title,
      e.description ?? null,
      e.routineId ?? null,
      e.startTime ?? e.createdAt,
      e.endTime ?? null,
      JSON.stringify(e.exercises ?? []),
      e.referenceMode ?? null,
      e.createdAt
    );
  }
};

const migrateOccurrences = async ({ db }: Ctx) => {
  const raw = await AsyncStorage.getItem('@exersaize:scheduled_occurrences_v1');
  if (!raw) return;
  const list = JSON.parse(raw);
  if (!Array.isArray(list)) return;
  for (const e of list) {
    await db.runAsync(
      `INSERT OR IGNORE INTO occurrences
        (id, scheduled_date, status, routine_id, title, start_time, end_time, all_day, recurrence, notes, series_id, workout_session_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      e.id,
      e.scheduledDate,
      e.status ?? 'scheduled',
      e.routineId ?? null,
      e.title ?? null,
      e.startTime ?? null,
      e.endTime ?? null,
      e.allDay ? 1 : 0,
      e.recurrence ?? 'none',
      e.notes ?? null,
      e.seriesId ?? null,
      e.workoutSessionId ?? null
    );
  }
};

export async function migrate(db: SQLite.SQLiteDatabase): Promise<void> {
  const versionResult = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = versionResult?.user_version ?? 0;
  if (currentVersion >= 1) {
    return;
  }

  await db.execAsync(SCHEMA_SQL);

  await db.withTransactionAsync(async () => {
    await migrateExercises({ db });
    await migrateRoutines({ db });
    await migrateSessions({ db });
    await migrateOccurrences({ db });
  });

  await db.execAsync('PRAGMA user_version = 1');
}
