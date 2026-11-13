import { ThemedText } from "@/components/themed-text"
import { ThemedView } from "@/components/themed-view"
import { ChevronRightIcon } from '@/components/ui/icons'
import { Spacing } from "@/constants/theme"
import { useTheme } from "@/hooks/use-theme"
import { ExerciseItem } from "@/types/exercise"
import { useRouter } from "expo-router"
import { StyleSheet, TouchableOpacity, View } from "react-native"

type Props = {
    exercise: ExerciseItem,
}

export function ExerciseItemComponent({ exercise }: Props) {
    const theme = useTheme()
    const router = useRouter()

    const content = (
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
                                            ? theme.secondaryLight
                                            : theme.primaryLight,
                                },
                            ]}>
                            <ThemedText
                                type="code"
                                style={{
                                    color:
                                        exercise.type === 'Bodyweight'
                                            ? theme.secondary
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
                    <ChevronRightIcon size={18} color={theme.textSecondary} />
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

    if (exercise.isCustom) {
        return (
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push(`/exercise/edit-exercise?id=${exercise.id}`)}>
                {content}
            </TouchableOpacity>
        )
    }

    return content
}

const styles = StyleSheet.create({
  customRow: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    borderWidth: 1,
  },
  customRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
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
});