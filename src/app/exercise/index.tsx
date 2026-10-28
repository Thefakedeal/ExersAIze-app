import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  SectionList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExerciseItemComponent } from '@/components/exercise-item';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CloseIcon, PlusIcon, SearchIcon } from '@/components/ui/icons';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useExercises } from '@/hooks/use-exercises';
import { useTheme } from '@/hooks/use-theme';
import { deleteCustomExercise } from '@/services/exercise-storage';
import { ExerciseItem } from '@/types/exercise';

export default function ExerciseScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { customExercises, defaultExercises } = useExercises();
  const [searchQuery, setSearchQuery] = useState('');

  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: insets.bottom,
    },
    web: {
      paddingTop: Spacing.six,
      paddingBottom: Spacing.four,
    },
  });

  const handleDeleteExercise = (item: ExerciseItem) => {
    Alert.alert(
      'Delete Exercise',
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCustomExercise(item.id);
            } catch (e) {
              console.error(e);
            }
          },
        },
      ]
    );
  };

  // Filtered lists
  const filteredCustom = useMemo(() => {
    if (!searchQuery.trim()) return customExercises;
    const q = searchQuery.toLowerCase();
    return customExercises.filter(
      (ex) =>
        ex.name.toLowerCase().includes(q) ||
        ex.type.toLowerCase().includes(q) ||
        ex.categories.some((c) => c.toLowerCase().includes(q))
    );
  }, [customExercises, searchQuery]);

  const filteredDefaults = useMemo(() => {
    if (!searchQuery.trim()) return defaultExercises;
    const q = searchQuery.toLowerCase();
    return defaultExercises.filter(
      (ex) =>
        ex.name.toLowerCase().includes(q) ||
        ex.type.toLowerCase().includes(q) ||
        ex.categories.some((c) => c.toLowerCase().includes(q))
    );
  }, [defaultExercises, searchQuery]);


  const sections = useMemo(
    () => [
      { key: 'custom', title: 'Saved Exercises', count: filteredCustom.length, data: filteredCustom, isPrimary: true },
      { key: 'defaults', title: 'Exercise Library', count: filteredDefaults.length, data: filteredDefaults, isPrimary: false },
    ],
    [filteredCustom, filteredDefaults]
  );

  return (
    <ThemedView style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentInset={insets}
        contentContainerStyle={[styles.content, contentPlatformStyle]}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          <>
            <View style={styles.headerRow}>
              <ThemedText type="subtitle">Exercises</ThemedText>
              <TouchableOpacity
                onPress={() => router.push('/exercise/add-exercise')}
                activeOpacity={0.7}
                style={[
                  styles.addExerciseButton,
                  { backgroundColor: theme.primary },
                ]}>
                <PlusIcon size={18} color={theme.textOnPrimary} />
                <ThemedText
                  type="smallBold"
                  style={{ color: theme.textOnPrimary, marginLeft: 6 }}>
                  Add Exercise
                </ThemedText>
              </TouchableOpacity>
            </View>
            <View
              style={[
                styles.searchContainer,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.border,
                },
              ]}>
              <SearchIcon size={18} color={theme.textSecondary} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search exercises or categories..."
                placeholderTextColor={theme.textSecondary}
                style={[styles.searchInput, { color: theme.text }]}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <CloseIcon size={16} color={theme.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          </>
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeaderRow}>
            <ThemedText
              type="smallBold"
              themeColor={section.isPrimary ? 'primary' : 'textSecondary'}>
              {section.title}
            </ThemedText>
            <ThemedText type="code" themeColor="textSecondary">
              {section.count}
            </ThemedText>
          </View>
        )}
        renderItem={({ item }) => (
          <ExerciseItemComponent
            exercise={item}
            handleDeleteExercise={handleDeleteExercise}
          />
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Spacing.four,
    paddingLeft: Spacing.two,
    paddingRight: Spacing.two,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    borderRadius: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Platform.select({ ios: 10, default: 8 }),
    marginBottom: Spacing.two,
    gap: Spacing.two,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.two,
    paddingBottom: Spacing.one,
  },
  row: {
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 4,
  },
  customRow: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    borderWidth: 1,
  },
  customRowTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  exerciseTitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
    marginTop: Spacing.one,
    alignItems: 'center',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  metricBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: Spacing.two,
  },
  catBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  noteText: {
    marginTop: Spacing.two,
    fontSize: 13,
    fontStyle: 'italic',
  },
  deleteButton: {
    padding: 4,
    marginLeft: Spacing.two,
  },
});
