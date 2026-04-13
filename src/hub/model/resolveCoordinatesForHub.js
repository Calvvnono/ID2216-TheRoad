import { placesClient } from '../../shared/api/placesClient';
import {
  coordinatesForDestination,
  isDestinationInMockLookup,
} from './mapFirestoreJourneyToTrip';

const cache = new Map();

/**
 * Real lat/lng for Hub map (Places when not in mock table; else mock or hash fallback).
 */
export async function resolveCoordinatesForHub(destination, country) {
  const key = `${String(destination || '').trim()}|${String(country || '').trim()}`.toLowerCase();
  if (cache.has(key)) {
    return cache.get(key);
  }

  let coords;
  if (isDestinationInMockLookup(destination)) {
    coords = coordinatesForDestination(destination, country);
  } else {
    let geo = null;
    try {
      geo = await placesClient.geocodeCity(destination, country);
    } catch (e) {
      console.warn(
        'Hub Places geocode failed; using hash fallback:',
        destination,
        country,
        e?.message,
      );
    }
    coords = geo || coordinatesForDestination(destination, country);
  }
  cache.set(key, coords);
  return coords;
}
