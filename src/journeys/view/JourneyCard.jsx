import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../shared/theme/colors';

const BAR_PATTERN = [
  10, 22, 16, 26, 12, 20, 30, 16, 24, 18,
  26, 14, 20, 28, 12, 22, 16, 24, 10, 18,
];

function StatBox({ label, value }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

export function JourneyCard({ journey, onPress }) {
  return (
    <Pressable style={styles.card} onPress={() => onPress?.(journey.id)}>
      <Image source={{ uri: journey.imageUrl }} style={styles.backgroundImage} />
      <View style={styles.overlay} />

      <View style={styles.content}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.destination}>{journey.destination}</Text>
            <Text style={styles.country}>{journey.country}</Text>
          </View>

          <View style={styles.iconBubble}>
            <MaterialCommunityIcons
              name="airplane"
              size={18}
              color={Colors.primary}
            />
          </View>
        </View>

        <View style={styles.metaRow}>
          <View>
            <Text style={styles.metaLabel}>TRAVEL DATES</Text>
            <Text style={styles.metaValue}>{journey.travelDates}</Text>
          </View>
          <View>
            <Text style={styles.metaLabel}>DURATION</Text>
            <Text style={styles.metaValue}>{journey.durationLabel}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <StatBox label="Spent" value={journey.spentLabel} />
          <StatBox label="Photos" value={journey.photos} />
          <StatBox label="Places" value={journey.places} />
        </View>

        <View style={styles.barsRow}>
          {BAR_PATTERN.map((height, index) => (
            <View
              key={`${journey.id}-${index}`}
              style={[
                styles.bar,
                { height, opacity: index % 3 === 0 ? 0.7 : 0.45 },
              ]}
            />
          ))}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 230,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    marginBottom: 14,
    backgroundColor: Colors.surface,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 24, 41, 0.82)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  destination: {
    fontSize: 36,
    fontWeight: '300',
    color: Colors.textPrimary,
  },
  country: {
    marginTop: 2,
    fontSize: 17,
    color: Colors.textSecondary,
  },
  iconBubble: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 212, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderMedium,
  },
  metaRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 26,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: Colors.textTertiary,
  },
  metaValue: {
    marginTop: 4,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  statsRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(26, 32, 53, 0.92)',
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statValue: {
    marginTop: 2,
    fontSize: 34,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  barsRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    height: 34,
  },
  bar: {
    width: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
});
