# Add Activity screen

The Add Activity screen creates a scheduled activity for a selected date. You can link a routine or enter a title without one. The checkmark in the header saves the activity and returns to the previous screen.

## Fields

- **Title:** Optional if a routine is selected. The title starts as the routine name, but you can edit it.
- **Routine:** Optional. Opens a searchable picker of routines.
- **Date:** The day the activity starts.
- **All day:** Hides the start and end time rows. When enabled, no times are saved.
- **Starts / Ends:** Available when All day is off. The end time cannot be earlier than the start time.
- **Repeat:** Does not repeat, Weekly, or Monthly.
- **Notes:** Optional multiline text.

## How to use it

1. Enter a title, or choose a routine. Choosing a routine fills the title with its name; you can still change the title.
2. Choose the date and, unless it is an all-day activity, its start and end times.
3. Choose a repeat option and add notes if needed.
4. Tap the checkmark to save.

## Notes / limits

- A one-time activity saves one occurrence. Weekly and monthly activities save 12 occurrences, starting on the selected date. All occurrences in a repeating set share a `seriesId`.
- New occurrence fields are optional, so older stored occurrences without them can still load.
- The title is limited to 120 characters and notes to 500.

## Files involved

- `src/screens/add-schedule-activity-screen.tsx` — form, pickers, validation, and save action.
- `src/screens/select-routine-screen.tsx` — searchable routine picker modal.
- `src/services/schedule-storage.ts` — saves one-time and repeating occurrences.
- `src/types/schedule.ts` — occurrence fields and repeat options.
- `src/components/ui/icons.tsx` — includes the repeat icon used by the screen.

## Related

- [add-activity-screen-ui-review.md](./add-activity-screen-ui-review.md) — UI review improvements that have been applied.
