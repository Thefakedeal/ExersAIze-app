# How Routines and Their Exercises Are Saved

A plain-language explanation of what happens when you create, edit, or delete a routine in the app.

## The short version

- Everything is saved **on the phone**. Nothing is sent to a server.
- A routine and its exercises are saved **together as one record**.
- There is **no separate storage for "routine exercises"** — each exercise lives inside its routine.
- When you save, the app rewrites the **whole list of routines**.

## What a saved routine looks like

One routine is stored as a single object, roughly like this:

```json
{
  "id": "routine_1718000000000_ab12c",
  "name": "Upper Body",
  "description": "Chest, back and shoulders",
  "exercises": [
    {
      "id": "rex_1718000000000_xy9z",
      "exerciseId": "barbell-bench-press",
      "name": "Barbell Bench Press",
      "type": "Strength",
      "categories": ["Chest"],
      "sets": 3,
      "repRange": "8-12"
    }
  ],
  "exerciseCount": 1,
  "isCustom": true,
  "createdAt": 1718000000000
}
```

What the fields mean:

| Field | Meaning |
| --- | --- |
| `id` | A unique name for this routine, created when you save it. |
| `name`, `description` | What you typed in the form. |
| `exercises` | The list of exercises in this routine, **in display order**. |
| `exerciseCount` | A shortcut copy of how many exercises there are. |
| `isCustom` | Marks it as a routine you created (as opposed to a built-in one). |
| `createdAt` | When it was created. |

Inside each exercise:

| Field | Meaning |
| --- | --- |
| `id` | A unique name for **this exercise inside this routine** (used when reordering or replacing). |
| `exerciseId` | Points back to the exercise in the exercise library. |
| `name`, `type`, `categories` | **Copied** from the library when you picked it. |
| `sets`, `repRange` | What you set on the exercise card. |

Because the name and details are **copied**, a saved routine keeps working even if the exercise library entry is renamed or removed later.

## Saving a new routine

1. You fill in the name and description, and tap **Add Exercise** to pick exercises from the library.
2. Each pick is added to a list that is held **in memory only** while the form is open. A new exercise starts with `sets: 3` and `repRange: "8-12"`.
3. Changing sets, rep range, order, or removing/replacing an exercise only changes that in-memory list. Nothing is written yet.
4. Tapping **Save Routine** checks that there is a name and at least one exercise, then hands the data to the routine storage service.
5. The storage service:
   - reads the current list of saved routines,
   - puts the new routine at the **front** of the list,
   - writes the **entire list** back to the phone,
   - tells anyone listening (like the Routines screen) that the data changed.
6. The Routines screen reloads the list, so the new routine appears immediately, and the app navigates back.

## Saving changes to an existing routine

- The edit form starts from the saved routine, and your edits are again kept **in memory** until you save.
- **Update Routine** replaces the matching routine in the list (same `id`) and writes the whole list back.
- **Delete Routine** removes the matching routine from the list and writes the whole list back.
- In all three cases (create, update, delete) the app rewrites the **complete list of routines**, not just one item.

## How the exercises inside a routine are saved

The exercise list is just an array inside the routine record, so:

- **Adding** creates a new exercise entry with its own `id` (`rex_…`) and copies `name`, `type`, and `categories` from the library, plus default `sets` and `repRange`.
- **Replacing** swaps the `exerciseId`, `name`, `type`, and `categories`, but keeps the same entry `id`, its `sets`, `repRange`, and its position in the list.
- **Moving up/down** just changes the order of the array — the order you see is the saved order.
- **Removing** deletes that entry from the array.
- **Editing sets or rep range** updates only that entry.
- Nothing is written to storage until you tap **Update Routine**, which saves the whole routine (including its exercise array) again.

## Built-in routines are separate

The app also ships with ready-made routines defined in code (`src/data/routine.ts`). On first launch, they are copied into their **own** storage area so they can be shown alongside your routines. They are not user-editable and are never mixed into the list you create, even though both appear on the Routines screen.

## Where this lives in the code

| What | File |
| --- | --- |
| Shape of a routine and its exercises | `src/types/routine.ts` |
| Saving, updating, deleting routines | `src/services/routine-storage.ts` |
| Built-in routines and their first-launch sync | `src/services/default-routines.ts`, `src/data/routine.ts` |
| Loading routines and reacting to changes | `src/hooks/use-routines.ts` |
| New routine form and save flow | `src/screens/add-routine-form.tsx`, `src/screens/add-routine-screen.tsx` |
| Edit routine form and save/delete flow | `src/screens/edit-routine-form.tsx`, `src/screens/edit-routine-screen.tsx` |
| Exercise picker (copies details into the routine) | `src/screens/select-exercise-screen.tsx` |

## Three things worth remembering

1. **One routine is one record.** Exercises are not saved on their own; they are part of the routine.
2. **Every save rewrites the whole list.** That is simple and safe for a single user on one phone.
3. **Routine exercises are snapshots.** They copy what the library said at the time you picked them, so later library changes do not alter saved routines.
