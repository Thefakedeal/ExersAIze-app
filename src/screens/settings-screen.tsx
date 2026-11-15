import Constants from 'expo-constants';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SafeArea } from '@/components/safe-area';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ChevronRightIcon } from '@/components/ui/icons';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useThemePreference } from '@/providers/theme-provider';
import { useDistanceUnit } from '@/providers/distance-unit-provider';
import { useWeightUnit } from '@/providers/weight-unit-provider';

type SegmentedOption<T extends string | number> = {
  label: string;
  value: T;
};

function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  equalWidth = false,
}: {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  equalWidth?: boolean;
}) {
  const theme = useTheme();

  const widestLabel = options.reduce(
    (label, option) => (option.label.length > label.length ? option.label : label),
    '',
  );

  return (
    <View style={[styles.segmentedTrack, { backgroundColor: theme.backgroundSecondary }]}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <TouchableOpacity
            key={String(option.value)}
            onPress={() => onChange(option.value)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={[styles.segment, active && { backgroundColor: theme.backgroundElement }]}>
            {equalWidth ? (
              <>
                <ThemedText type="small" aria-hidden style={styles.segmentSizer}>
                  {widestLabel}
                </ThemedText>
                <View
                  pointerEvents="none"
                  style={[StyleSheet.absoluteFill, styles.segmentLabelOverlay]}>
                  <ThemedText type="small" themeColor={active ? 'text' : 'textSecondary'}>
                    {option.label}
                  </ThemedText>
                </View>
              </>
            ) : (
              <ThemedText type="small" themeColor={active ? 'text' : 'textSecondary'}>
                {option.label}
              </ThemedText>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <ThemedText type="default" style={styles.rowLabel}>
        {label}
      </ThemedText>
      <View style={styles.rowControl}>{children}</View>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={styles.sectionContainer}>
      <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionTitle}>
        {title}
      </ThemedText>
      <ThemedView type="backgroundElement" style={[styles.sectionCard, { borderColor: theme.border }]}>
        {children}
      </ThemedView>
    </View>
  );
}

const THEME_OPTIONS: SegmentedOption<'light' | 'dark' | 'system'>[] = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'System', value: 'system' },
];

const WEIGHT_OPTIONS: SegmentedOption<'kg' | 'lbs'>[] = [
  { label: 'kg', value: 'kg' },
  { label: 'lbs', value: 'lbs' },
];

const DISTANCE_OPTIONS: SegmentedOption<'km' | 'mi'>[] = [
  { label: 'km', value: 'km' },
  { label: 'mi', value: 'mi' },
];

const HEIGHT_OPTIONS: SegmentedOption<'cm' | 'ft'>[] = [
  { label: 'cm', value: 'cm' },
  { label: 'ft', value: 'ft' },
];

const BODY_MEASUREMENT_OPTIONS: SegmentedOption<'cm' | 'in'>[] = [
  { label: 'cm', value: 'cm' },
  { label: 'in', value: 'in' },
];

const REST_TIMER_OPTIONS: SegmentedOption<60 | 90 | 120>[] = [
  { label: '60s', value: 60 },
  { label: '90s', value: 90 },
  { label: '120s', value: 120 },
];

const DURATION_OPTIONS: SegmentedOption<'minutes' | 'hoursMinutes'>[] = [
  { label: 'Minutes', value: 'minutes' },
  { label: 'Hours & Minutes', value: 'hoursMinutes' },
];

export function SettingsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const { preference, setPreference } = useThemePreference();
  const appearance = preference ?? 'system';

  const handleAppearanceChange = (value: 'light' | 'dark' | 'system') => {
    setPreference(value === 'system' ? null : value);
  };

  const { unit: weightUnit, setUnit: setWeightUnit } = useWeightUnit();
  const { unit: distanceUnit, setUnit: setDistanceUnit } = useDistanceUnit();
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
  const [bodyMeasurementsUnit, setBodyMeasurementsUnit] = useState<'cm' | 'in'>('cm');
  const [restTimer, setRestTimer] = useState<60 | 90 | 120>(90);
  const [durationDisplay, setDurationDisplay] = useState<'minutes' | 'hoursMinutes'>('minutes');
  const [showDescriptions, setShowDescriptions] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  const switchProps = {
    trackColor: { false: theme.backgroundSecondary, true: theme.primary },
    thumbColor: theme.backgroundElement,
  };

  return (
    <ThemedView style={styles.container}>
      <SafeArea>
        <ScreenHeader
          style={{ paddingBottom: Spacing.two, paddingHorizontal: Spacing.four }}
          title="Settings"
        />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + Spacing.six },
          ]}
          showsVerticalScrollIndicator={false}>
          <View style={styles.innerContainer}>
            <Section title="Appearance">
              <Row label="Theme">
                <SegmentedControl
                  options={THEME_OPTIONS}
                  value={appearance}
                  onChange={handleAppearanceChange}
                  equalWidth
                />
              </Row>
            </Section>

            <Section title="Units & Measurements">
              <Row label="Weight">
                <SegmentedControl
                  options={WEIGHT_OPTIONS}
                  value={weightUnit}
                  onChange={setWeightUnit}
                />
              </Row>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <Row label="Distance">
                <SegmentedControl
                  options={DISTANCE_OPTIONS}
                  value={distanceUnit}
                  onChange={setDistanceUnit}
                />
              </Row>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <Row label="Height">
                <SegmentedControl
                  options={HEIGHT_OPTIONS}
                  value={heightUnit}
                  onChange={setHeightUnit}
                />
              </Row>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <Row label="Body measurements">
                <SegmentedControl
                  options={BODY_MEASUREMENT_OPTIONS}
                  value={bodyMeasurementsUnit}
                  onChange={setBodyMeasurementsUnit}
                />
              </Row>
            </Section>

            <Section title="Workout Preferences">
              <Row label="Default rest timer">
                <SegmentedControl
                  options={REST_TIMER_OPTIONS}
                  value={restTimer}
                  onChange={setRestTimer}
                />
              </Row>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <Row label="Duration display">
                <SegmentedControl
                  options={DURATION_OPTIONS}
                  value={durationDisplay}
                  onChange={setDurationDisplay}
                />
              </Row>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <Row label="Show exercise descriptions">
                <Switch
                  value={showDescriptions}
                  onValueChange={setShowDescriptions}
                  {...switchProps}
                />
              </Row>
            </Section>

            <Section title="General">
              <Row label="Notifications">
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  {...switchProps}
                />
              </Row>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <Row label="Haptic feedback">
                <Switch value={hapticsEnabled} onValueChange={setHapticsEnabled} {...switchProps} />
              </Row>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <Row label="About ExersAIze">
                <ChevronRightIcon size={20} color={theme.textSecondary} />
              </Row>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <Row label="App version">
                <ThemedText type="small" themeColor="textSecondary">
                  {Constants.expoConfig?.version ?? '1.0.0'}
                </ThemedText>
              </Row>
            </Section>
          </View>
        </ScrollView>
      </SafeArea>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.three,
  },
  innerContainer: {
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
  },
  sectionContainer: {
    marginBottom: Spacing.four,
  },
  sectionTitle: {
    marginBottom: Spacing.two,
    marginLeft: Spacing.three,
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    gap: Spacing.two,
  },
  rowLabel: {
    flex: 1,
  },
  rowControl: {
    alignItems: 'center',
  },
  divider: {
    height: 1,
    marginLeft: Spacing.three,
  },
  segmentedTrack: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: Spacing.half,
  },
  segment: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
    borderRadius: 6,
  },
  segmentSizer: {
    opacity: 0,
  },
  segmentLabelOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
