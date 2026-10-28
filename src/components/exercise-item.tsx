import { ThemedText } from "@/components/themed-text"
import { ThemedView } from "@/components/themed-view"
import { CloseIcon } from '@/components/ui/icons'
import { MaxContentWidth, Spacing } from "@/constants/theme"
import { useTheme } from "@/hooks/use-theme"
import { ExerciseItem } from "@/types/exercise"
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native"
type Props = {
    exercise: ExerciseItem,
    handleDeleteExercise?: (item: ExerciseItem) => void
}

export function ExerciseItemComponent({
    exercise,
    handleDeleteExercise = () => {},
}: Props) {
    const theme = useTheme()
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
                        {exercise.name}
                    </ThemedText>
                    <View style={styles.tagsRow}>
                        <View
                            style={[
                                styles.typeBadge,
                                {
                                    backgroundColor:
                                        exercise.type === 'Bodyweight'
                                            ? theme.accent
                                            : theme.primaryLight,
                                },
                            ]}>
                            <ThemedText
                                type="code"
                                style={{
                                    color:
                                        exercise.type === 'Bodyweight'
                                            ? '#171717'
                                            : theme.primary,
                                    fontWeight: '700',
                                }}>
                                {exercise.type}
                            </ThemedText>
                        </View>

                        {exercise.trackMetrics.map((metric) => (
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

                {exercise.isCustom && (
                    <TouchableOpacity
                        onPress={() => handleDeleteExercise(exercise)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        style={styles.deleteButton}>
                    <CloseIcon size={16} color={theme.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>

            {exercise.categories.length > 0 && (
                <View style={styles.categoriesRow}>
                    {exercise.categories.map((cat) => (
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

            {exercise.note ? (
                <ThemedText
                    type="small"
                    themeColor="textSecondary"
                    style={styles.noteText}>
                    💬 {exercise.note}
                </ThemedText>
            ) : null}
        </ThemedView>
    )
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