import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../shared/theme';
import GlobeMap from './GlobeMap';

/**
 * Globe + time slider. All data and actions come from HubScreen via props
 * (HubScreen reads from HubPresenter).
 */
function GlobeSection({
  selectedLocationName: selected,
  timeSliderNormalized: storeNorm,
  aggregatedLocationsPlain: locations,
  routeCoordinatesPlain: routeCoords,
  timeSliderDateLabel: dateLabel,
  onMarkerPress,
  onTimeSliderChange,
}) {

  const [slideLocal, setSlideLocal] = useState(storeNorm);
  useEffect(() => {
    setSlideLocal(storeNorm);
  }, [storeNorm]);

  const fitKey = `${storeNorm}|${locations.map((l) => l.id).join(',')}`;

  return (
    <View style={styles.stage}>
      <View style={styles.globeArea}>
        <GlobeMap
          locations={locations}
          routeCoords={routeCoords}
          selectedName={selected}
          fitKey={fitKey}
          onMarkerPress={onMarkerPress}
        />
      </View>

      <View style={styles.timeOverlay} pointerEvents="box-none">
        <View style={styles.timeHeader}>
          <View style={styles.timeTitleRow}>
            <MaterialCommunityIcons
              name="timer-sand"
              size={20}
              color={Colors.primary}
            />
            <Text style={styles.timeTitle}>Time Machine</Text>
          </View>
          <Text style={styles.timeDate} numberOfLines={1}>
            {dateLabel}
          </Text>
          <TouchableOpacity
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() => {
              setSlideLocal(1);
              onTimeSliderChange(1);
            }}
          >
            <Text style={styles.showAll}>Show All</Text>
          </TouchableOpacity>
        </View>

        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          value={slideLocal}
          onValueChange={(v) => {
            setSlideLocal(v);
            onTimeSliderChange(v);
          }}
          minimumTrackTintColor={Colors.primary}
          maximumTrackTintColor={Colors.surfaceLight}
          thumbTintColor={Colors.primary}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    width: '100%',
    minHeight: 320,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    position: 'relative',
    overflow:
      Platform.OS === 'web' || Platform.OS === 'ios' ? 'hidden' : 'visible',
  },
  globeArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    minHeight: 260,
  },
  timeOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: 'rgba(10, 14, 26, 0.88)',
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
  },
  timeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  timeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flexShrink: 0,
  },
  timeTitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  timeDate: {
    ...Typography.statSmall,
    color: Colors.primary,
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
  },
  showAll: {
    ...Typography.buttonText,
    color: Colors.primary,
    fontWeight: '600',
    flexShrink: 0,
  },
  slider: {
    width: '100%',
    height: 44,
  },
});

export default GlobeSection;
