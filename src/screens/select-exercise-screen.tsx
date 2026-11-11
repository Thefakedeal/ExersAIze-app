import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Header } from '@/components/header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CheckIcon, CloseIcon, SearchIcon } from '@/components/ui/icons';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useExercises } from '@/hooks/use-exercises';
import { useTheme } from '@/hooks/use-theme';
import { ExerciseItem, ExerciseType } from '@/types/exercise';

type Props = {
  visible?: boolean;
  onClose: () => void;
  onSelect: (exercise: ExerciseItem) => void;
  title?: string;
  selectedExerciseId?: string;
};

export function SelectExerciseScreen({
  visible = true,
  onClose,
  onSelect,
  title = 'Select Exercise',
  selectedExerciseId,
}: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { customExercises, defaultExercises } = useExercises();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ExerciseType | 'All'>('All');

  const allExercises = useMemo(() => {
    // Custom exercises first, then defaults
    return [...customExercises, ...defaultExercises];
  }, [customExercises, defaultExercises]);

  const filteredExercises = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allExercises.filter((ex) => {
      if (selectedType !== 'All' && ex.type !== selectedType) {
        return false;
      }
      if (!q) return true;
      return (
        ex.name.toLowerCase().includes(q) ||
        ex.type.toLowerCase().includes(q) ||
        ex.categories.some((c) => c.toLowerCase().includes(q))
      );
    });
  }, [allExercises, searchQuery, selectedType]);

  const content = (
    <ThemedView style={styles.container}>
      <Header onBackPress={onClose} title={title} />

      <View style={styles.innerContainer}>
        {/* Search Input */}
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
            placeholder="Search exercises or muscles..."
            placeholderTextColor={theme.textSecondary}
            style={[styles.searchInput, { color: theme.text }]}
            autoCorrect={false}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <CloseIcon size={16} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Pills */}
        <View style={styles.typeFilterRow}>
          {(['All', 'Strength', 'Bodyweight'] as const).map((filterType) => {
            const isSelected = selectedType === filterType;
            return (
              <TouchableOpacity
                key={filterType}
                onPress={() => setSelectedType(filterType)}
                activeOpacity={0.7}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: isSelected
                      ? theme.backgroundSelected
                      : theme.backgroundElement,
                    borderColor: isSelected ? theme.primary : theme.border,
                  },
                ]}>
                <ThemedText
                  type="small"
                  style={{
                    color: isSelected ? theme.primary : theme.textSecondary,
                    fontWeight: isSelected ? '700' : '500',
                  }}>
                  {filterType}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
          <View style={styles.countContainer}>
            <ThemedText type="code" themeColor="textSecondary">
              {filteredExercises.length} found
            </ThemedText>
          </View>
        </View>

        {/* Exercise List */}
        <FlatList
          data={filteredExercises}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + Spacing.six },
          ]}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <ThemedText type="default" themeColor="textSecondary">
                No exercises found matching your search.
              </ThemedText>
            </View>
          }
          renderItem={({ item }) => {
            const isCurrent = item.id === selectedExerciseId;
            return (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
                style={styles.itemTouchable}>
                <ThemedView
                  type="backgroundElement"
                  style={[
                    styles.itemCard,
                    {
                      borderColor: isCurrent ? theme.primary : theme.border,
                      borderWidth: isCurrent ? 1.5 : 1,
                    },
                  ]}>
                  <View style={styles.itemHeader}>
                    <View style={styles.titleCol}>
                      <ThemedText type="smallBold" style={styles.itemName}>
                        {item.name}
                      </ThemedText>
                      <View style={styles.metaRow}>
                        <View
                          style={[
                            styles.typeBadge,
                            {
                              backgroundColor:
                                item.type === 'Bodyweight'
                                  ? theme.secondaryLight
                                  : theme.primaryLight,
                            },
                          ]}>
                          <ThemedText
                            type="code"
                            style={{
                              color:
                                item.type === 'Bodyweight'
                                  ? theme.secondary
                                  : theme.primary,
                              fontWeight: '700',
                            }}>
                            {item.type}
                          </ThemedText>
                        </View>
                        {item.isCustom && (
                          <View
                            style={[
                              styles.customBadge,
                              { backgroundColor: theme.backgroundSelected },
                            ]}>
                            <ThemedText type="code" themeColor="primary">
                              Custom
                            </ThemedText>
                          </View>
                        )}
                      </View>
                    </View>

                    {isCurrent && (
                      <View
                        style={[
                          styles.checkBadge,
                          { backgroundColor: theme.primary },
                        ]}>
                        <CheckIcon size={14} color={theme.textOnPrimary} />
                      </View>
                    )}
                  </View>

                  {item.categories.length > 0 && (
                    <View style={styles.categoriesRow}>
                      {item.categories.slice(0, 4).map((cat) => (
                        <View
                          key={cat}
                          style={[
                            styles.catBadge,
                            {
                              borderColor: theme.border,
                              backgroundColor: theme.background,
                            },
                          ]}>
                          <ThemedText type="code" themeColor="textSecondary">
                            {cat}
                          </ThemedText>
                        </View>
                      ))}
                      {item.categories.length > 4 && (
                        <ThemedText
                          type="code"
                          themeColor="textSecondary"
                          style={{ alignSelf: 'center' }}>
                          +{item.categories.length - 4}
                        </ThemedText>
                      )}
                    </View>
                  )}
                </ThemedView>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </ThemedView>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
      onRequestClose={onClose}>
      {content}
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Platform.select({ ios: 10, default: 8 }),
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  typeFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  filterPill: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  countContainer: {
    marginLeft: 'auto',
  },
  listContent: {
    gap: Spacing.two,
  },
  itemTouchable: {
    borderRadius: Spacing.three,
  },
  itemCard: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleCol: {
    flex: 1,
    paddingRight: Spacing.two,
  },
  itemName: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  typeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  customBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  catBadge: {
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  emptyContainer: {
    paddingVertical: Spacing.six,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
