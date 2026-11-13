import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { SectionList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExerciseItemComponent } from '@/components/exercise-item';
import { Header } from '@/components/header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PlusIcon } from '@/components/ui/icons';
import { SearchField } from '@/components/ui/search-field';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useExercises } from '@/hooks/use-exercises';
import { useTheme } from '@/hooks/use-theme';
import { matchesExerciseQuery } from '@/utils/exercise-filter';

export default function ExerciseScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { customExercises, defaultExercises } = useExercises();
  const [searchQuery, setSearchQuery] = useState('');

  const sections = useMemo(() => {
    const saved = customExercises.filter((ex) => matchesExerciseQuery(ex, searchQuery));
    const library = defaultExercises.filter((ex) => matchesExerciseQuery(ex, searchQuery));

    return [
      { title: 'Saved Exercises', data: saved, isPrimary: true },
      { title: 'Exercise Library', data: library, isPrimary: false },
    ].filter((section) => section.data.length > 0);
  }, [customExercises, defaultExercises, searchQuery]);

  return (
    <ThemedView style={styles.container}>
      <Header
        title="Exercises"
        onBackPress={() => router.push('/')}
        rightAction={
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.addButton, { backgroundColor: theme.primary }]}
            onPress={() => router.push('/exercise/add-exercise')}>
            <PlusIcon size={18} color={theme.textOnPrimary} />
          </TouchableOpacity>
        }
      />
      <View style={styles.content}>
        <SearchField
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search exercises or categories..."
          style={styles.searchField}
        />
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + BottomTabInset + Spacing.three },
          ]}
          stickySectionHeadersEnabled={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <ThemedText type="default" themeColor="textSecondary">
                No exercises found matching your search.
              </ThemedText>
            </View>
          }
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeaderRow}>
              <ThemedText
                type="smallBold"
                themeColor={section.isPrimary ? 'primary' : 'textSecondary'}>
                {section.title}
              </ThemedText>
              <ThemedText type="code" themeColor="textSecondary">
                {section.data.length}
              </ThemedText>
            </View>
          )}
          renderItem={({ item }) => <ExerciseItemComponent exercise={item} />}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
  },
  searchField: {
    marginTop: Spacing.two,
    marginBottom: Spacing.two,
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: Spacing.two,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.two,
    paddingBottom: Spacing.one,
  },
  emptyContainer: {
    paddingVertical: Spacing.six,
    alignItems: 'center',
  },
  addButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
});
