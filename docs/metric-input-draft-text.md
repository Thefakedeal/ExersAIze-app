# MetricInput Draft Text

`MetricInput` in `src/components/session/session-set-row.tsx` has a local text draft so controlled numeric input can preserve intermediate text while session state continues to receive valid numbers. This is a supporting numeric-input fix, not part of the standard unit-preference architecture.

## Problem

Previously, `MetricInput` rendered `String(value ?? '')` directly and committed every keystroke. A parent session update creates new objects and re-renders the controlled input; the prop then became the parsed number, dropping a trailing decimal point (`72.` became `72`). That prevented decimal weight/distance entry because the user could not continue typing after the decimal point.

## Solution in the current implementation

The component keeps its editable text separately from the parsed value, tracks the last value received from props, conditionally resynchronizes during render when the prop changes externally, parses valid numeric text, and normalizes on blur. The current implementation in `src/components/session/session-set-row.tsx` is:

```tsx
function parseMetricValue(text: string, decimal: boolean): number | undefined {
  if (text === '') return undefined;
  const parsed = decimal ? Number(text) : parseInt(text, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function MetricInput({
  value,
  unit,
  decimal = false,
  referenceValue,
  onChange,
}: MetricInputProps) {
  const theme = useTheme();
  const [text, setText] = useState(() => (value != null ? String(value) : ''));
  const [trackedValue, setTrackedValue] = useState(value);

  // Resync when the value changes externally (e.g. a unit switch) without
  // clobbering in-progress text such as "72.".
  if (value !== trackedValue) {
    setTrackedValue(value);
    if (value == null) {
      setText('');
    } else if (parseMetricValue(text, decimal) !== value) {
      setText(String(value));
    }
  }

  const handleChange = (next: string) => {
    const cleaned = next.replace(decimal ? /[^0-9.]/g : /[^0-9]/g, '');
    setText(cleaned);

    if (cleaned === '') {
      onChange(undefined);
      return;
    }

    const parsed = parseMetricValue(cleaned, decimal);
    if (parsed !== undefined) {
      onChange(parsed);
    }
  };

  const handleBlur = () => {
    setText(value != null ? String(value) : '');
  };

  return (
    <TextInput
      value={text}
      onChangeText={handleChange}
      onBlur={handleBlur}
      keyboardType={decimal ? 'decimal-pad' : 'number-pad'}
      placeholder={referenceValue != null ? String(referenceValue) : '-'}
    />
  );
}
```

The snippet omits the component's existing styles and surrounding input wrapper; the quoted state and event logic matches the implementation.

## Why resynchronize during render instead of using `useEffect`

This follows React's “adjust state when a prop changes” pattern: compare the incoming prop with the tracked prop value and adjust local state only when that external value has changed. It avoids an extra effect-driven render and preserves a draft when the parent re-renders with the same parsed value. The project uses the Expo ESLint flat config, whose React Hooks lint rules flag synchronous state updates in effects. Do not suppress those lint rules to implement this synchronization.

## Behavior

- A trailing decimal point survives while editing, so `72.` can continue to `72.5`.
- Decimal values are passed to the parent when they parse successfully.
- An external value change, including a unit switch that changes the displayed prop, resynchronizes the draft text.
- Invalid intermediate text such as `2..5` remains visible while editing but does not replace the last valid stored value.
- On blur, the text normalizes to the current prop value; an empty value remains empty.
- Clearing the input sends `undefined` to the parent.

## Relationship to unit preferences

This is a generic numeric-input concern, not a kg/lbs-specific part of unit preference persistence or conversion. Other screens that use the same controlled numeric-input pattern can reuse draft-text handling, but it can be left out of the unit-feature checklist. Unit conversion still belongs at the metric input boundary, outside `MetricInput`'s text parser.

## Tests to run when changing `MetricInput`

- Enter a decimal value.
- Backspace to a trailing decimal point and continue typing.
- Switch units while a value is being edited.
- Clear the input.
- Blur after valid and invalid intermediate input.
- Check integer fields such as reps/time.
- Enter invalid input and verify the stored value remains the last valid value.

## Limitations

Weight display rounding is still limited to one decimal place by the policy in `src/utils/weight.ts`. Draft text handling fixes editing behavior; it does not change conversion precision or the display-rounding policy.

## Verification record

The implementation was reported as verified with `npx tsc --noEmit` and targeted ESLint. No manual runtime testing was performed.
