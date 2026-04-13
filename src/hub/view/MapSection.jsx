import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
} from '../../shared/theme';
import MapLocationPill from './MapLocationPill';

/**
 * Location card grid — pure RN replacement for react-native-maps.
 * Shows visited locations as tappable cards with visit stats.
 * Polyline route replaced by numbered sequence badges.
 *
 * Not currently wired in HubScreen; if used, pass props from HubScreen (HubPresenter).
 */
function MapSection({
  aggregatedLocationsPlain: locations,
  selectedLocationName: selected,
  onMarkerPress,
}) {

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.heading}>Visited Locations</Text>
        <Text style={styles.badge}>{locations.length}</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {locations.map((loc, idx) => {
          const isSelected = loc.name === selected;
          return (
            <TouchableOpacity
              key={loc.id}
              activeOpacity={0.7}
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => onMarkerPress(loc.name)}
            >
              <View style={styles.cardTop}>
                <View
                  style={[
                    styles.indexCircle,
                    isSelected && styles.indexCircleSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.indexText,
                      isSelected && styles.indexTextSelected,
                    ]}
                  >
                    {idx + 1}
                  </Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text
                    style={[styles.locName, isSelected && styles.locNameSelected]}
                    numberOfLines={1}
                  >
                    {loc.name}
                  </Text>
                  {loc.country ? (
                    <Text style={styles.locCountry}>{loc.country}</Text>
                  ) : null}
                </View>
              </View>

              <View style={styles.statsRow}>
                <MapLocationPill label="Visits" value={loc.visitCount} color={Colors.primary} />
                <MapLocationPill label="Days" value={loc.totalDays} color={Colors.secondary} />
                <MapLocationPill
                  label="Spent"
                  value={`$${loc.totalSpent.toLocaleString()}`}
                  color={Colors.tertiary}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  heading: {
    ...Typography.cardTitle,
    color: Colors.textPrimary,
  },
  badge: {
    backgroundColor: Colors.primarySoft,
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 13,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  scroll: { flex: 1 },
  grid: {
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  cardSelected: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(0, 212, 255, 0.06)',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  indexCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexCircleSelected: {
    backgroundColor: Colors.primary,
  },
  indexText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  indexTextSelected: {
    color: Colors.textInverse,
  },
  cardInfo: {
    flex: 1,
  },
  locName: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  locNameSelected: {
    color: Colors.primary,
  },
  locCountry: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
});

export default MapSection;
