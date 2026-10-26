import { useMemo } from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';

import quotes from '@/assets/quotes.json';
import { Colors, Spacing } from '@/constants/theme';

import { ThemedText } from './themed-text';

export function QuoteCard() {
  const scheme = useColorScheme();
  const actualColors = scheme === 'dark' ? Colors.dark : Colors.light;

  const quote = useMemo(() => quotes[Math.floor(Math.random() * quotes.length)], []);

  return (
    <View  style={[styles.container, { borderColor: 'transparent' }]}>
      <ThemedText style={[styles.quoteText, { fontFamily: 'serif' }]}>
        “{quote.quote}”
      </ThemedText>
      <ThemedText type="small" style={[styles.authorText, { color: actualColors.textSecondary }]}>
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
