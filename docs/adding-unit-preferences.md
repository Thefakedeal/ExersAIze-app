# Adding Unit Preferences (Weight Reference Implementation)

This guide describes the weight-unit implementation and how to extend the same pattern to another metric without changing the units stored in workout sessions.

## Purpose and core principles

- **Store one canonical unit.** Session weight values are kept in kilograms; the preference only changes what users see and enter.
- **Convert at UI boundaries.** Convert canonical values for input/display, and convert edited display values back before updating session state. Changing a preference must not rewrite session data.
- **Keep session records unit-neutral.** Do not add a unit field to session records, change their schema, or migrate existing records for a display preference.
- **Centralize conversion and rounding.** The metric utility owns the canonical/display conversion and display rounding policy.
- **Centralize persistence.** A metric-specific provider owns its persisted preference and exposes it through React context.
- **Follow the existing AsyncStorage + context pattern.** Preferences restore on mount and are persisted by their setter, not by a save-on-change effect.

## Reference implementation file map

| File | Responsibility | Surface |
| --- | --- | --- |
| `src/utils/weight.ts` | `WeightUnit`, default unit, `toDisplayWeight`, and `toStoredWeight`; conversion and rounding policy. | Shared conversion boundary |
| `src/providers/weight-unit-provider.tsx` | AsyncStorage restore/persist, validation, context, and `useWeightUnit`. | Preference state |
| `src/app/_layout.tsx` | Mounts `WeightUnitProvider` around the app tabs. | App-wide availability |
| `src/screens/settings-screen.tsx` | Reads the context and wires `WEIGHT_OPTIONS` to the segmented control. | Preference entry |
| `src/components/session/session-set-row.tsx` | Converts session weight and reference placeholder to display units; converts input back before `onUpdateSet`. | Workout entry |
| `src/utils/exercise-history.ts` | `describeReferenceSet` formats reference values using the selected weight unit. | Formatted reference label |
| `src/components/session/session-exercise-card.tsx` | Shows the PR/reference label and the weight column header (`KG`/`LBS`). | Workout display and labels |
| `src/screens/view-session-screen.tsx` | Formats stored session weight for the read-only session history screen. | History display |

The entry/display split is important: Settings changes a preference, `SessionSetRow` is the weight-entry boundary, and `ViewSessionScreen`, `describeReferenceSet`, and the session card render formatted values. Session state and session storage remain canonical throughout.

## Step-by-step replication guide

### 1. Inventory every unit-sensitive site

Before implementing, search for the unit literals and the data field. Include entry, display, placeholders/reference values, labels, sorting, and comparisons—not only the obvious input.

```sh
grep -RniE '<unit-a>|<unit-b>|<field-name>' src

# For the weight implementation:
grep -RniE 'kg|lbs|weight' src
```

For weight, inspect uses of `weight` and `set.weight` as well as visible `kg`/`lbs` text. The search should include input components, history screens, formatted reference labels, column headers, and PR selection/comparison logic.

**Check:** Every occurrence is classified as conversion logic, canonical business logic, or a user-facing unit string. Do not blindly convert all matches.

### 2. Define the canonical/display unit and conversion utility

Give the utility a metric-specific type and default, and keep conversion/rounding in one module. The weight implementation exports this API:

```ts
export type WeightUnit = 'kg' | 'lbs';
export const DEFAULT_WEIGHT_UNIT: WeightUnit = 'kg';
export function toDisplayWeight(kg: number, unit: WeightUnit): number;
export function toStoredWeight(display: number, unit: WeightUnit): number;
```

`src/utils/weight.ts` uses `KG_PER_LB = 0.45359237`. `toDisplayWeight` converts from stored kg and rounds for UI with `Number(display.toFixed(1))`; `toStoredWeight` converts an input back to kg without rounding. Keep stored values unrounded and use the utility's display rounding consistently.

Generalized shape:

```ts
export type MetricUnit = 'canonical' | 'alternate';
export const DEFAULT_METRIC_UNIT: MetricUnit = 'canonical';

export function toDisplayMetric(canonical: number, unit: MetricUnit): number {
  // Convert and apply the documented display-only rounding policy.
}

export function toStoredMetric(display: number, unit: MetricUnit): number {
  // Convert back to canonical units without display rounding.
}
```

**Check:** Utility direction is unambiguous, conversion constants are documented, and rounding happens only on the display path.

### 3. Create a persisted preference provider

Use a metric-specific key following `@exersaize:<name>_unit_preference_v1`; for weight the key is `@exersaize:weight_unit_preference_v1`. Initialize with the utility default, restore on mount, validate the stored string against supported values, and use the default for missing, invalid, or unreadable values. Persist only from the public setter. Do not add an effect that saves every state change: the initial default could otherwise overwrite the saved preference before restore completes.

The current provider sets an `isActive` flag in its mount effect and clears it on cleanup. The async restore checks that flag before setting state, preventing a late storage result from updating a provider that has already unmounted.

```tsx
const PREFERENCE_KEY = '@exersaize:<name>_unit_preference_v1';

export function MetricUnitProvider({ children }: { children: ReactNode }) {
  const [unit, setUnitState] = useState<MetricUnit>(DEFAULT_METRIC_UNIT);

  useEffect(() => {
    let isActive = true;
    restoreAndValidate(PREFERENCE_KEY, DEFAULT_METRIC_UNIT).then((stored) => {
      if (isActive) setUnitState(stored);
    });
    return () => { isActive = false; };
  }, []);

  const setUnit = (next: MetricUnit) => {
    setUnitState(next);
    void persist(PREFERENCE_KEY, next);
  };

  // Expose unit and setUnit through a metric-specific context.
}
```

**Check:** Restore validates values, failure falls back safely, the setter is the only persistence path, and cleanup guards the async result.

### 4. Mount the provider at the app root

Add the new provider in `src/app/_layout.tsx`, alongside the existing `WeightUnitProvider` and `ThemeProvider`. Keep providers separate by concern rather than combining unrelated preferences into one provider; this limits which consumers subscribe to each context and avoids making unrelated settings part of one update domain.

```tsx
<ThemeProvider>
  <WeightUnitProvider>
    <MetricUnitProvider>
      <AppTabs />
    </MetricUnitProvider>
  </WeightUnitProvider>
</ThemeProvider>
```

Choose nesting based on actual dependencies. A provider must wrap every consumer, but a metric preference does not need to own unrelated theme/session state.

**Check:** All routes that use the preference are under the provider, and the corresponding hook is never called outside it.

### 5. Connect Settings without changing unrelated controls

In `src/screens/settings-screen.tsx`, replace the local `useState` for the preference with the metric provider hook and wire its value/setter into the existing segmented control. Keep option arrays such as `THEME_OPTIONS` and `DISTANCE_OPTIONS` unchanged. Other unit settings (distance, height, body measurements) and the other local Settings values remain local until their own persistence/display features are implemented.

```tsx
const { unit, setUnit } = useMetricUnit();

<SegmentedControl options={METRIC_OPTIONS} value={unit} onChange={setUnit} />
```

**Check:** Settings changes the context-backed preference, not an independent local copy, and changing this preference does not alter other Settings controls.

### 6. Convert at the input boundary

`SessionSetRow` receives canonical session values. For weight, it computes `displayWeight` and `displayReference` with `toDisplayWeight`, passes those to the shared `MetricInput` (the reference value is its placeholder), and converts the callback value with `toStoredWeight` before calling `onUpdateSet`.

```tsx
const displayValue = canonicalValue == null
  ? undefined
  : toDisplayMetric(canonicalValue, unit);
const displayPlaceholder = canonicalReference == null
  ? undefined
  : toDisplayMetric(canonicalReference, unit);

<MetricInput
  value={displayValue}
  unit={unit}
  referenceValue={displayPlaceholder}
  onChange={(value) => onUpdateSet({ metric: value == null
    ? undefined
    : toStoredMetric(value, unit) })}
/>
```

**Check:** The input value and reference placeholder use the selected unit, while `onUpdateSet` receives the canonical value. Do not convert values inside the shared `MetricInput`; that component handles numeric text, not metric semantics.

### 7. Convert read-only displays and formatted labels

Follow the weight display sites:

- `src/screens/view-session-screen.tsx` converts stored set weight for the history view.
- `src/utils/exercise-history.ts` uses `describeReferenceSet(set, weightUnit)` to format reference values.
- `src/components/session/session-exercise-card.tsx` passes the unit to the reference label and chooses the `KG`/`LBS` column header.

For another metric, review every history summary, reference string, placeholder, and unit label. A display conversion should take a canonical value and the current preference; it should not mutate the source record.

**Check:** Every value is paired with the matching unit label, and formatted text uses the same utility/policy as numeric displays.

### 8. Preserve canonical business logic

Comparisons and sorting must continue to use canonical values. In the reference implementation, `findExerciseReference` selects the PR by comparing `set.weight` directly before any formatting. The selected set is then converted only when `describeReferenceSet` renders it.

```ts
// Business logic: compare canonical values.
if (candidate.metric > best.metric) best = candidate;

// Presentation: convert only when rendering.
const label = `${toDisplayMetric(best.metric, unit)} ${unit}`;
```

**Check:** Changing units cannot change which record qualifies as a PR, how values sort, or any threshold calculation.

### 9. Preserve existing records and handle invalid preferences

Existing workout records are canonical and remain so. The preference is stored separately; there is no session schema change, migration, or unit metadata in session records. An invalid stored preference falls back to the metric default. Toggling the setting writes the preference only and must not save or rewrite session data.

**Check:** Review session persistence paths and confirm a preference change does not call `saveWorkoutSession`/`updateWorkoutSession` or transform stored sets.

### 10. Verify

- Run `npx tsc --noEmit`.
- Run targeted ESLint on the touched utility, provider, Settings, input, display, and label files, for example:

  ```sh
  npx eslint src/utils/weight.ts src/providers/weight-unit-provider.tsx src/app/_layout.tsx src/screens/settings-screen.tsx src/components/session/session-set-row.tsx src/utils/exercise-history.ts src/components/session/session-exercise-card.tsx src/screens/view-session-screen.tsx
  ```

- Grep again for the old/new unit literals and metric field to catch missed UI surfaces.
- Manually test: default preference; switching units while a session is open; entering a decimal; reference placeholder and PR label; read-only history; app restart/restore; invalid or absent preference; and confirmation that stored session values do not change when toggling.

## Weight data flow

```text
Settings segmented control
          │ setUnit
          ▼
WeightUnitProvider ───────────────► AsyncStorage
          │                          @exersaize:weight_unit_preference_v1
          │ unit
          ├──► SessionSetRow input/display boundary
          ├──► reference labels and column header
          └──► ViewSessionScreen display

SessionSet.weight ── canonical kg ──► workout state / session storage
       ▲                                      │
       └──── input converted back to kg ──────┘
```

The provider stores the display preference separately. Session set values remain kg whether the user selects kg or lbs.

## Applying the pattern to other metrics

The extension below is a plan for future preference-backed conversion, not a claim that distance, height, or body-measurement conversion is already implemented.

### Distance

- Use canonical `km` for `SessionSet.distance`; the current session row input, history display, and `describeReferenceSet` currently treat it as km.
- Convert entry in `src/components/session/session-set-row.tsx`; convert history in `src/screens/view-session-screen.tsx`; format the reference in `src/utils/exercise-history.ts`; update the currently generic `DIST` column header in `src/components/session/session-exercise-card.tsx` to reflect the selected display unit if desired.
- Use `km`/`mi`, with `1 km = 0.621371 mi` (or a documented exact conversion constant), a `DistanceUnitProvider`, and key `@exersaize:distance_unit_preference_v1`.
- Keep the existing `DISTANCE_OPTIONS` in `src/screens/settings-screen.tsx` and replace only its local state when adding persistence.
- Health/steps distance is a separate read-only domain: the steps screens use distance values such as `distanceKm` and metric data from hooks/services. Decide explicitly whether a workout-distance preference should apply there; do not silently convert health-derived values.

**Checklist:** utility; provider; root mount; Settings wiring; input conversion; display conversion; reference/unit labels and column header; canonical comparisons; verification.

### Height

- Use canonical `cm`; a display preference could be `cm`/`ft` or `cm`/`ft+in`.
- Feet-and-inches is not a simple scalar display of centimeters: define a formatter and parser (for example, `5 ft 10 in`) and be explicit about fractional/integer input and rounding.
- `src/screens/settings-screen.tsx` currently has `HEIGHT_OPTIONS` and a local `heightUnit` state, but the app currently has no stored height UI. Identify the actual data model and entry/display screens before copying the weight pattern.

**Checklist:** utility/formatter/parser; provider; root mount; Settings wiring; input conversion; display conversion; labels; canonical comparisons; verification.

### Body measurements

- Use canonical `cm` and display `cm`/`in`, with `1 in = 2.54 cm`.
- Use a `BodyMeasurementUnitProvider` with key `@exersaize:body_measurement_unit_preference_v1`.
- Keep the existing `BODY_MEASUREMENT_OPTIONS` in `src/screens/settings-screen.tsx`.
- No current body-measurement storage/display sites exist. When adding the feature, identify and convert each data-model field, entry form, edit form, history/detail display, formatted label, placeholder, and comparison/sorting site.

**Checklist:** utility; provider; root mount; Settings wiring; input conversion; display conversion; labels; canonical comparisons; verification.

## Pitfalls and review checklist

- [ ] Search for hardcoded old unit strings left in user-facing UI.
- [ ] Do not convert stored values or add unit fields to session records.
- [ ] Do not round before storage.
- [ ] Keep rounding in one place and use consistent decimal precision.
- [ ] Do not convert values used for comparisons, sorting, thresholds, or PR selection.
- [ ] Convert placeholders/reference values as well as the primary input value.
- [ ] Update column headers, reference labels, and PR labels.
- [ ] Remember that Settings currently has other local-only unit states; do not mistake a displayed option for a persisted/implemented preference.
- [ ] Account for the provider's default-before-hydration render; test that restore does not overwrite or persist the default.
- [ ] Do not stop at typecheck: grep for remaining unit literals and perform the manual preference/input/history test matrix.

## Definition of done

- [ ] Canonical storage is unchanged and the preference is separately persisted and validated.
- [ ] Every entry and display boundary converts through the metric utility; labels and placeholders match.
- [ ] Comparisons remain canonical, with no schema change, migration, or toggle-triggered session rewrite.
- [ ] Provider is mounted, Settings uses it, and typecheck, targeted ESLint, grep review, and manual test matrix are complete.

## Verification record

The implementation was reported as verified with `npx tsc --noEmit` and targeted ESLint. No manual runtime testing was performed.
