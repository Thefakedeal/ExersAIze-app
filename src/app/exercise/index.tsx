import { useState, useMemo } from 'react';
import {
  FlatList,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useExercises } from '@/hooks/use-exercises';
import { PlusIcon, SearchIcon, CloseIcon } from '@/components/ui/icons';
import { ExerciseItem } from '@/types/exercise';
import { deleteCustomExercise } from '@/services/exercise-storage';

export default function ExerciseScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { customExercises, defaultExerciseNames } = useExercises();
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
    if (!searchQuery.trim()) return defaultExerciseNames;
    const q = searchQuery.toLowerCase();
    return defaultExerciseNames.filter((name) => name.toLowerCase().includes(q));
  }, [defaultExerciseNames, searchQuery]);

  type CombinedItem =
    | { kind: 'header' }
    | { kind: 'search' }
    | { kind: 'custom_section_header'; count: number }
    | { kind: 'custom'; item: ExerciseItem }
    | { kind: 'default_section_header'; count: number }
    | { kind: 'default'; name: string };

  const data: CombinedItem[] = useMemo(() => {
    const list: CombinedItem[] = [{ kind: 'header' }, { kind: 'search' }];

    if (filteredCustom.length > 0) {
      list.push({
        kind: 'custom_section_header',
        count: filteredCustom.length,
      });
      filteredCustom.forEach((item) => {
        list.push({ kind: 'custom', item });
      });
    }

    list.push({
      kind: 'default_section_header',
      count: filteredDefaults.length,
    });
    filteredDefaults.forEach((name) => {
      list.push({ kind: 'default', name });
    });

    return list;
  }, [filteredCustom, filteredDefaults]);

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item, index) => {
          if (item.kind === 'header') return 'header';
          if (item.kind === 'search') return 'search';
          if (item.kind === 'custom_section_header') return 'custom_header';
          if (item.kind === 'custom') return item.item.id;
          if (item.kind === 'default_section_header') return 'default_header';
          return `default_${item.name}_${index}`;
        }}
        contentInset={insets}
        contentContainerStyle={[styles.content, contentPlatformStyle]}
        renderItem={({ item }) => {
          if (item.kind === 'header') {
            return (
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
            );
          }

          if (item.kind === 'search') {
            return (
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
            );
          }

          if (item.kind === 'custom_section_header') {
            return (
              <View style={styles.sectionHeaderRow}>
                <ThemedText type="smallBold" themeColor="primary">
                  My Exercises
                </ThemedText>
                <ThemedText type="code" themeColor="textSecondary">
                  {item.count} saved
                </ThemedText>
              </View>
            );
          }

          if (item.kind === 'default_section_header') {
            return (
              <View style={styles.sectionHeaderRow}>
                <ThemedText type="smallBold" themeColor="textSecondary">
                  Exercise Library
                </ThemedText>
                <ThemedText type="code" themeColor="textSecondary">
                  {item.count}
                </ThemedText>
              </View>
            );
          }

          if (item.kind === 'custom') {
            const ex = item.item;
            return (
              <ThemedView
                type="backgroundElement"
                style={[
                  styles.customRow,
                  { borderColor: theme.border },
                ]}>
                <View style={styles.customRowTop}>
                  <View style={{ flex: 1 }}>
                    <ThemedText type="smallBold" style={styles.exerciseTitle}>
                      {ex.name}
                    </ThemedText>
                    <View style={styles.tagsRow}>
                      <View
                        style={[
                          styles.typeBadge,
                          {
                            backgroundColor:
                              ex.type === 'BodyWeight'
                                ? theme.accent
                                : theme.primaryLight,
                          },
                        ]}>
                        <ThemedText
                          type="code"
                          style={{
                            color:
                              ex.type === 'BodyWeight'
                                ? '#171717'
                                : theme.primary,
                            fontWeight: '700',
                          }}>
                          {ex.type}
                        </ThemedText>
                      </View>

                      {ex.trackMetrics.map((metric) => (
                        <View
                          key={metric}
                          style={[
                            styles.metricBadge,
                            { backgroundColor: theme.backgroundSelected },
                          ]}>
                          <ThemedText type="code" themeColor="text">
                            {metric}
                          </ThemedText>
                        </View>
                      ))}
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleDeleteExercise(ex)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={styles.deleteButton}>
                    <CloseIcon size={16} color={theme.textSecondary} />
                  </TouchableOpacity>
                </View>

                {ex.categories.length > 0 && (
                  <View style={styles.categoriesRow}>
                    {ex.categories.map((cat) => (
                      <View
                        key={cat}
                        style={[
                          styles.catBadge,
                          {
                            borderColor: theme.border,
                            backgroundColor: theme.background,
                          },
                        ]}>
                        <ThemedText
                          type="code"
                          themeColor="textSecondary">
                          {cat}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                )}

                {ex.note ? (
                  <ThemedText
                    type="small"
                    themeColor="textSecondary"
                    style={styles.noteText}>
                    💬 {ex.note}
                  </ThemedText>
                ) : null}
              </ThemedView>
            );
          }

          // Default exercise row
          return (
            <ThemedView type="backgroundElement" style={styles.row}>
              <ThemedText>{item.name}</ThemedText>
            </ThemedView>
          );
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
