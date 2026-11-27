# Add Activity screen — UI review improvements

The Add Activity screen is implemented and working. For how it behaves today, see
[add-activity-screen.md](./add-activity-screen.md).

This document records a UI review of that screen: 17 concrete improvements. The changes have
been **applied** to the source files. The "Why" column records the problem each item was fixing.

## Status

- **Applied.** These improvements were implemented in `src/screens/add-schedule-activity-screen.tsx` and `src/screens/select-routine-screen.tsx`.
- Items were checked against the current source when this document was written (22 Nov 2026).
  If the code changes later, re-check before trusting this list.

## Suggested improvements

### Bugs

| # | Suggestion | Why |
| - | ---------- | --- |
| 1 | Render the routine list with `FlatList` instead of a mapped `View`. | The picker list does not scroll today, so long routine lists overflow and cannot be reached. |
| 2 | Make the picker header X dismiss only, and show an explicit **Clear** action only when a routine is selected. | Today the X calls `onSelect(null)`, so closing the picker also wipes the selection. |
| 3 | Tapping an already-selected routine should keep it selected. | Today `handleRoutinePress` calls `onSelect(null)` for the selected id, which silently deselects it. |
| 4 | On iOS, keep a draft value in the date/time picker and commit it on **Done**. | The spinner calls `onValueChange`, which saves and closes on the first scroll tick, so the user cannot finish picking. |
| 8 | Time rows: clock icon on **Starts** only, placeholder text on **Ends**, auto-set end to start + 1 hour, and show an inline error when the end is before the start. | The two rows look identical, the end time does not follow the start time, and the problem only surfaces as an alert at save time. |
| 14 | Include time validity in the save-enabled condition. | The header checkmark stays enabled for invalid times and only fails on tap; disabling it matches the validation. |
| 15 | Add a **Clear search** action to the empty search state. | When a search returns nothing, the user has no obvious way back to the full list. |

### Visual / UX

| # | Suggestion | Why |
| - | ---------- | --- |
| 5 | Align the title input to the card edge and tighten the title-to-card spacing. | The title is inset differently from the card (`Spacing.one` vs. the card's `Spacing.three`), so its left edge does not line up with the form. |
| 6 | Use short repeat values ("Never" / "Weekly" / "Monthly") and a flexible row layout. | The full label "Does not repeat" is truncated by `numberOfLines={1}` on narrow screens. |
| 7 | Repeat modal: remove the redundant **Done** button and use safe-area padding. | Choosing an option already closes the sheet, and the sheet can sit under the home indicator. |
| 9 | Notes card: drop the bold "Notes" header, add a selection color, dismiss the keyboard on drag, and use `minHeight` instead of `numberOfLines`. | The header adds visual weight the card does not need, and the input is hard to dismiss while typing. |
| 11 | Save button: use a bare check icon (primary when enabled, `textTertiary` when disabled) instead of a filled circle, and expose the disabled state to accessibility. | A filled circle reads as a primary button, not a header action; assistive tech cannot tell when saving is blocked. |

### Accessibility

| # | Suggestion | Why |
| - | ---------- | --- |
| 12 | Give form rows and option rows a minimum touch target of 52dp. | Current vertical padding produces targets below the recommended minimum. |
| 13 | Put `accessibilityRole` / `accessibilityState` on the All day `Switch` and remove the dead label on the row wrapper. | The label is attached to a non-interactive wrapper, so screen readers do not announce the switch state. |

### Theme

| # | Suggestion | Why |
| - | ---------- | --- |
| 10 | Use `textSecondary` for the Date, Time, and Repeat icons; keep `primary` for Routine. | Every icon uses the accent color, so the routine link does not stand out. |
| 16 | Omit `thumbColor` on the `Switch` and keep the track colors. | A fixed thumb color looks wrong in dark mode; the platform default adapts. |
| 17 | Inset row dividers by `marginLeft: Spacing.three`, matching the Settings screen. | Full-width dividers break the visual consistency with `settings-screen.tsx`. |

## Files changed

Only these two files were affected:

- `src/screens/add-schedule-activity-screen.tsx` — items 4–14, 16, 17: title spacing, time rows,
  repeat modal, notes card, save button, touch targets, All day switch, and dividers.
- `src/screens/select-routine-screen.tsx` — items 1–3 and 15: scrollable list, header X vs. Clear,
  selected-routine tap handling, and the empty search action.

No storage, type, or service files changed; the saved data shape stays the same.

## Verification

After the changes were applied, the following passed from the project root:

```bash
npx tsc --noEmit
npx eslint src/screens/add-schedule-activity-screen.tsx src/screens/select-routine-screen.tsx
```

`npm run lint` (which runs `expo lint`) is also available for a full-project check.

Also check by hand on both platforms, since several items are platform-specific:

- iOS: open a date and a time picker, scroll, then confirm the value only changes on **Done**.
- Android: confirm the date/time dialogs still open and dismiss correctly.
- Light and dark mode: check the All day switch and the save icon colors.
- A long routine list and a search with no matches: confirm scrolling and the Clear actions work.
