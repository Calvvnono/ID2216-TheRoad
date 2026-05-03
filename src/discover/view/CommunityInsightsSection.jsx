import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Colors } from '../../shared/theme/colors';

export function CommunityInsightsSection({ items = [], onPress }) {
  if (!items.length) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Popular with Travelers</Text>
      <Text style={styles.subtitle}>Aggregated from recent community journeys</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {items.map((item) => (
          <Pressable key={item.id} style={styles.card} onPress={() => onPress?.(item)}>
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
            {item.badge ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            ) : null}
            <View style={styles.body}>
              <Text style={styles.name} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.meta} numberOfLines={1}>
                {item.country}
              </Text>
              {item.peerNote ? (
                <Text style={styles.peerNote} numberOfLines={2}>
                  {item.peerNote}
                </Text>
              ) : null}
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const CARD_W = 168;

const styles = StyleSheet.create({
  section: {
    marginTop: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: 12,
  },
  row: {
    gap: 12,
    paddingRight: 8,
  },
  card: {
    width: CARD_W,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 96,
    backgroundColor: Colors.surfaceLight,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.chipBorder,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
  },
  body: {
    padding: 10,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  meta: {
    marginTop: 4,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  peerNote: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 15,
    color: Colors.textTertiary,
  },
});
