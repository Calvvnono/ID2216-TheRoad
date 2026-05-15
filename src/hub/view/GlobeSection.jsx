import { useEffect, useMemo, useRef, useState } from 'react';
import {
  PanResponder,
  Platform,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../shared/theme';
import GlobeMap from './GlobeMap';

/**
 * Globe + time slider. All data and actions come from HubScreen via props
 * (HubScreen receives these values from its Presenter).
 */
function GlobeSection({
  selectedLocationName: selected,
  timeStartNormalized: storeStartNorm,
  timeEndNormalized: storeEndNorm,
  aggregatedLocationsPlain: locations,
  routeCoordinatesPlain: routeCoords,
  timeStartDateLabel: startDateLabel,
  timeEndDateLabel: endDateLabel,
  onMarkerPress,
  onTimeStartChange,
  onTimeEndChange,
  onResetTimeRange,
}) {
  const THUMB_SIZE = 22;
  const clamp01 = (value) => Math.min(1, Math.max(0, value));

  const [startLocal, setStartLocal] = useState(storeStartNorm);
  const [endLocal, setEndLocal] = useState(storeEndNorm);
  const [axisWidth, setAxisWidth] = useState(0);
  const startLocalRef = useRef(storeStartNorm);
  const endLocalRef = useRef(storeEndNorm);
  const startDragBaseRef = useRef(storeStartNorm);
  const endDragBaseRef = useRef(storeEndNorm);
  useEffect(() => {
    setStartLocal(storeStartNorm);
    startLocalRef.current = storeStartNorm;
  }, [storeStartNorm]);
  useEffect(() => {
    setEndLocal(storeEndNorm);
    endLocalRef.current = storeEndNorm;
  }, [storeEndNorm]);

  const fitKey = `${storeStartNorm}|${storeEndNorm}|${locations.map((l) => l.id).join(',')}`;
  const rangeLeft = `${Math.round(startLocal * 100)}%`;
  const rangeRight = `${Math.round((1 - endLocal) * 100)}%`;
  const axisUsableWidth = Math.max(1, axisWidth - THUMB_SIZE);
  const startThumbLeft = startLocal * axisUsableWidth;
  const endThumbLeft = endLocal * axisUsableWidth;

  const startPanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2,
        onPanResponderGrant: () => {
          startDragBaseRef.current = startLocalRef.current;
        },
        onPanResponderMove: (_, gestureState) => {
          const delta = gestureState.dx / axisUsableWidth;
          const next = clamp01(startDragBaseRef.current + delta);
          const clamped = Math.min(next, endLocalRef.current);
          startLocalRef.current = clamped;
          setStartLocal(clamped);
          onTimeStartChange(clamped);
        },
        onPanResponderTerminationRequest: () => false,
      }),
    [axisUsableWidth, onTimeStartChange],
  );

  const endPanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2,
        onPanResponderGrant: () => {
          endDragBaseRef.current = endLocalRef.current;
        },
        onPanResponderMove: (_, gestureState) => {
          const delta = gestureState.dx / axisUsableWidth;
          const next = clamp01(endDragBaseRef.current + delta);
          const clamped = Math.max(next, startLocalRef.current);
          endLocalRef.current = clamped;
          setEndLocal(clamped);
          onTimeEndChange(clamped);
        },
        onPanResponderTerminationRequest: () => false,
      }),
    [axisUsableWidth, onTimeEndChange],
  );

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
            {startDateLabel} - {endDateLabel}
          </Text>
          <TouchableOpacity
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() => {
              setStartLocal(0);
              setEndLocal(1);
              startLocalRef.current = 0;
              endLocalRef.current = 1;
              onResetTimeRange();
            }}
          >
            <Text style={styles.showAll}>Show All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.rangeMetaRow}>
          <Text style={styles.sliderLabel}>Start: {startDateLabel}</Text>
          <Text style={styles.sliderLabel}>End: {endDateLabel}</Text>
        </View>

        <View
          style={styles.rangeAxis}
          onLayout={(e) => setAxisWidth(e.nativeEvent.layout.width)}
        >
          <View style={[styles.rangeHighlight, { left: rangeLeft, right: rangeRight }]} />
          <View
            style={[
              styles.thumb,
              styles.startThumb,
              { left: startThumbLeft, width: THUMB_SIZE, height: THUMB_SIZE },
            ]}
            {...startPanResponder.panHandlers}
          />
          <View
            style={[
              styles.thumb,
              styles.endThumb,
              { left: endThumbLeft, width: THUMB_SIZE, height: THUMB_SIZE },
            ]}
            {...endPanResponder.panHandlers}
          />
        </View>
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
  rangeMetaRow: {
    marginTop: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rangeAxis: {
    marginTop: 8,
    width: '100%',
    height: 34,
    borderRadius: 999,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  rangeHighlight: {
    position: 'absolute',
    top: 10,
    bottom: 10,
    borderRadius: 999,
    backgroundColor: Colors.primarySoft,
  },
  thumb: {
    position: 'absolute',
    top: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  startThumb: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
    zIndex: 3,
  },
  endThumb: {
    borderColor: Colors.secondary,
    backgroundColor: Colors.surface,
    zIndex: 4,
  },
  sliderLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontSize: 12,
  },
});

export default GlobeSection;
