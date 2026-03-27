import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Colors } from '../../shared/theme/colors';

/**
 * Pure view — list of recommended destinations.
 */
export function DestinationList({ destinations }) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>Recommended For You</Text>
      {destinations.map((item) => (
        <View key={item.id} style={styles.card}>
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
          <View style={styles.body}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.country}>{item.country}</Text>
            <Text style={styles.reason}>{item.reason}</Text>
          </View>
        </View>
      ))}
      {destinations.length === 0 && (
        <Text style={styles.empty}>No destinations match your search.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 20,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 140,
    backgroundColor: Colors.surfaceLight,
  },
  body: {
    padding: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  country: {
    marginTop: 2,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  reason: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  empty: {
    textAlign: 'center',
    color: Colors.textSecondary,
    marginTop: 8,
  },
});

