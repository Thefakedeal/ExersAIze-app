import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Header } from '@/components/header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CheckIcon } from '@/components/ui/icons';
import { SearchField } from '@/components/ui/search-field';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useRoutines } from '@/hooks/use-routines';
import { useTheme } from '@/hooks/use-theme';
import { RoutineItem } from '@/types/routine';

type Props = {
  visible?: boolean;
  onClose: () => void;
  onSelect: (routine: RoutineItem | null) => void;
  title?: string;
  selectedRoutineId?: string | null;
};

export function SelectRoutineScreen({
  visible = true,
  onClose,
  onSelect,
  title = 'Select Routine',
  selectedRoutineId,
}: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { customRoutines, defaultRoutines, loading } = useRoutines();

  const [searchQuery, setSearchQuery] = useState('');

  const allRoutines = useMemo(
    () => [...customRoutines, ...defaultRoutines],
    [customRoutines, defaultRoutines]
  );

  const filteredRoutines = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return allRoutines;
    }
    return allRoutines.filter((routine) =>
      routine.name.toLowerCase().includes(query)
    );
  }, [allRoutines, searchQuery]);

  const content = (
    <ThemedView style={styles.container}>
      <Header
        onBackPress={onClose}
        title={title}
        rightAction={
          selectedRoutineId ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => onSelect(null)}
              accessibilityRole="button"
              accessibilityLabel="Clear routine"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.clearButton}>
              <ThemedText type="smallBold" themeColor="primary">
                Clear
              </ThemedText>
            </TouchableOpacity>
          ) : undefined
        }
      />

      <View style={styles.innerContainer}>
        <SearchField
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search routines..."
          style={styles.searchField}
        />

        <FlatList
          data={filteredRoutines}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          style={styles.list}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + Spacing.six },
          ]}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              {loading ? (
                <ActivityIndicator color={theme.primary} />
              ) : (
                <>
                  <ThemedText type="default" themeColor="textSecondary">
                    {searchQuery
                      ? 'No routines match your search.'
                      : 'No routines available.'}
                  </ThemedText>
                  {searchQuery.length > 0 && (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setSearchQuery('')}
                      accessibilityRole="button"
                      accessibilityLabel="Clear search">
                      <ThemedText type="smallBold" themeColor="primary">
                        Clear search
                      </ThemedText>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          }
          renderItem={({ item }) => {
            const isSelected = item.id === selectedRoutineId;

            return (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => onSelect(item)}
                style={styles.itemTouchable}>
                <ThemedView
                  type="backgroundElement"
                  style={[
                    styles.itemCard,
                    {
                      borderColor: isSelected ? theme.primary : theme.border,
                      borderWidth: isSelected ? 1.5 : 1,
                    },
                  ]}>
                  <View style={styles.itemRow}>
                    <View style={styles.itemInfo}>
                      <ThemedText type="smallBold" style={styles.itemName}>
                        {item.name}
                      </ThemedText>
                      {item.description ? (
                        <ThemedText
                          type="small"
                          themeColor="textSecondary"
                          numberOfLines={1}>
                          {item.description}
                        </ThemedText>
                      ) : null}
                    </View>

                    {isSelected && (
                      <View
                        style={[
                          styles.checkBadge,
                          { backgroundColor: theme.primary },
                        ]}>
                        <CheckIcon size={14} color={theme.textOnPrimary} />
                      </View>
                    )}
                  </View>
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
  clearButton: {
    padding: Spacing.one,
    marginRight: -Spacing.one,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchField: {
    marginBottom: Spacing.three,
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: Spacing.two,
  },
  emptyContainer: {
    paddingVertical: Spacing.six,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  itemTouchable: {
    borderRadius: Spacing.three,
  },
  itemCard: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  itemInfo: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    fontSize: 15,
    lineHeight: 20,
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
