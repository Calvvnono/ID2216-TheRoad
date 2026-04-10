import { useMemo, useRef, useEffect, useCallback, useState, Component } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Colors, BorderRadius, Typography } from '../../shared/theme';

/**
 * Hub 地图 — react-native-maps（GitHub: react-native-maps/react-native-maps）。
 * iOS: Apple Maps；Android: Google Maps（需 EXPO_PUBLIC_GOOGLE_MAPS_API_KEY）。
 * Android 缺少 API key 时显示 fallback 提示而非闪退。
 */

const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0d1b2a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8a9bae' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0d1117' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#1b2838' }] },
  { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: '#5a6a7a' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#0f2035' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#162a40' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#6a8090' }] },
  { featureType: 'poi.park', elementType: 'geometry.fill', stylers: [{ color: '#0a2818' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#3a7050' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a2a3d' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#0d1b2a' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#1e3550' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#0d1b2a' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#7a90a8' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#162035' }] },
  { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#6a8090' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#040e18' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#3a5570' }] },
];

const DEFAULT_REGION = {
  latitude: 20,
  longitude: 15,
  latitudeDelta: 100,
  longitudeDelta: 100,
};

const HAS_GOOGLE_KEY =
  Platform.OS !== 'android' ||
  !!(process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY?.trim());

function regionFromCoords(coords) {
  if (!coords || coords.length === 0) return DEFAULT_REGION;
  let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
  for (const c of coords) {
    minLat = Math.min(minLat, c.latitude);
    maxLat = Math.max(maxLat, c.latitude);
    minLng = Math.min(minLng, c.longitude);
    maxLng = Math.max(maxLng, c.longitude);
  }
  const padLat = Math.max((maxLat - minLat) * 0.3, 5);
  const padLng = Math.max((maxLng - minLng) * 0.3, 5);
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: (maxLat - minLat) + padLat,
    longitudeDelta: (maxLng - minLng) + padLng,
  };
}

/* ── Error boundary: catches native map crashes (e.g. missing API key) ── */
class MapErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return <MapFallback message="Map failed to load" />;
    return this.props.children;
  }
}

function MapFallback({ message }) {
  return (
    <View style={styles.fallback}>
      <Text style={styles.fallbackIcon}>🗺️</Text>
      <Text style={styles.fallbackTitle}>{message}</Text>
      <Text style={styles.fallbackHint}>
        {Platform.OS === 'android'
          ? 'Set EXPO_PUBLIC_GOOGLE_MAPS_API_KEY in .env and rebuild.'
          : 'Check your network connection.'}
      </Text>
    </View>
  );
}

export default function GlobeMap({
  locations,
  routeCoords,
  selectedName,
  fitKey,
  onMarkerPress,
}) {
  const mapRef = useRef(null);

  const markers = useMemo(
    () =>
      (locations || []).map((l) => ({
        id: l.id,
        name: l.name,
        label: l.nameEn ?? l.name,
        latitude: Number(l.coordinates.latitude),
        longitude: Number(l.coordinates.longitude),
      })),
    [locations],
  );

  const polyline = useMemo(() => {
    if (!routeCoords || routeCoords.length < 2) return [];
    return routeCoords.map((c) => ({
      latitude: Number(c.latitude),
      longitude: Number(c.longitude),
    }));
  }, [routeCoords]);

  const initialRegion = useMemo(
    () => regionFromCoords(markers),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    if (!mapRef.current || markers.length === 0) return;
    const coords = markers.map((m) => ({ latitude: m.latitude, longitude: m.longitude }));
    mapRef.current.fitToCoordinates(coords, {
      edgePadding: { top: 60, right: 60, bottom: 80, left: 60 },
      animated: true,
    });
  }, [fitKey, markers]);

  const handleMarkerPress = useCallback(
    (name) => { onMarkerPress?.(name); },
    [onMarkerPress],
  );

  if (!HAS_GOOGLE_KEY && Platform.OS === 'android') {
    return <MapFallback message="Google Maps API key not configured" />;
  }

  const isAndroid = Platform.OS === 'android';

  return (
    <MapErrorBoundary>
      <View style={styles.fill}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={isAndroid ? PROVIDER_GOOGLE : undefined}
          initialRegion={initialRegion}
          customMapStyle={isAndroid ? DARK_MAP_STYLE : undefined}
          userInterfaceStyle={isAndroid ? undefined : 'dark'}
          mapType={isAndroid ? 'standard' : 'mutedStandard'}
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={false}
          showsScale={false}
          showsTraffic={false}
          showsBuildings={false}
          showsIndoors={false}
          showsPointsOfInterest={false}
          pitchEnabled={false}
          rotateEnabled={false}
          toolbarEnabled={false}
          moveOnMarkerPress={false}
        >
          {polyline.length >= 2 && (
            <Polyline
              coordinates={polyline}
              strokeColor={Colors.primary}
              strokeWidth={3}
              lineCap="round"
              lineJoin="round"
            />
          )}
          {markers.map((m) => {
            const isSelected = selectedName === m.name;
            const color = isSelected ? Colors.secondary : Colors.primary;
            return (
              <Marker
                key={m.id}
                coordinate={{ latitude: m.latitude, longitude: m.longitude }}
                onPress={() => handleMarkerPress(m.name)}
                tracksViewChanges={false}
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <MarkerDot color={color} label={m.label} isSelected={isSelected} />
              </Marker>
            );
          })}
        </MapView>
      </View>
    </MapErrorBoundary>
  );
}

function MarkerDot({ color, label, isSelected }) {
  return (
    <View style={styles.markerWrap}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <View
        style={[
          styles.labelBox,
          isSelected && { borderColor: Colors.secondary },
        ]}
      >
        <Text
          style={[styles.labelText, isSelected && { color: Colors.secondary }]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    alignSelf: 'stretch',
    width: '100%',
    minHeight: 260,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  labelBox: {
    backgroundColor: 'rgba(10,14,26,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.28)',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  labelText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  fallback: {
    flex: 1,
    alignSelf: 'stretch',
    minHeight: 260,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 24,
  },
  fallbackIcon: {
    fontSize: 36,
  },
  fallbackTitle: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  fallbackHint: {
    color: Colors.textTertiary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
