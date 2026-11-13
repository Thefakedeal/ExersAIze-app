import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import quotes from '@/assets/quotes.json';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from './themed-text';

export function QuoteCard() {
  const theme = useTheme();

  const quote = useMemo(() => quotes[Math.floor(Math.random() * quotes.length)], []);

  return (
    <View style={styles.container}>
      <ThemedText style={[styles.quoteText, { fontFamily: 'serif' }]}>
        “{quote.quote}”
      </ThemedText>
      <ThemedText type="small" style={[styles.authorText, { color: theme.textSecondary }]}>
        — {quote.author}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.four,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: Spacing.two,
  },
  quoteText: {
    fontSize: 18,
    lineHeight: 26,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  authorText: {
    alignSelf: 'center',
  },
});
