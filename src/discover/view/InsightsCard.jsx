import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../shared/theme/colors';

/**
 * Pure view — high-level discover insight panel.
 */
export function InsightsCard({ insights }) {
  if (!insights) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.tag}>{insights.trendTag}</Text>
      <Text style={styles.text}>{insights.suggestion}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
    backgroundColor: Colors.primarySoft,
    borderWidth: 1,
    borderColor: Colors.chipBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  tag: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 6,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textPrimary,
  },
});

