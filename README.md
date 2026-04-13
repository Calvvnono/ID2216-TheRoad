# The Road Goes Ever On

The Road Goes Ever On is a travel companion app built with Expo and React Native. The app is organized around four tabs: `Hub`, `Journeys`, `Discover`, and `Profile`. We use Expo Router for navigation, MobX for state management, Firebase for stored user data, and Google Places for destination suggestions and place details.

## Short description

The idea behind the app is simple: keep your past trips in one place, explore where to go next, and see your travel history in a more visual way. `Journeys` stores user trips in Firestore under `users/{uid}/journeys`, including uploaded photos. `Discover` uses Google Places search together with the user's saved activities and budget to generate recommendation cards. `Hub` reads the same journey collection, adds demo trips when needed, and shows the result as statistics, markers, and a time-based overview.

There are also a few platform-specific details worth noting. On Android, the native map depends on Google Play services and a Google Maps key injected during build through `app.config.js` and `plugins/withGoogleMapsApiKey.js`. In Expo Go, the full Hub map is not available, so that screen falls back to a simple list view instead of the real map. On web, Hub uses the Leaflet-based implementation in `GlobeMap.web.jsx`.

## What we have done

- The app shell and tab navigation are in place under `src/app/`.
- Firebase is connected through `src/shared/api/firebaseClient.js`, with anonymous auth, Firestore, and Storage.
- `Journeys` supports listing trips, opening a detail page, and creating a new journey with photo uploads. We have included three sample journeys by default in `src/journeys/model/JourneysService.js`.
- `Discover` already shows Places-based recommendations, a detail modal, and wishlist interactions. The current "community" section is still generated from Places results rather than real user posts.
- `Hub` shows a time slider, travel stats, a marker view, and a location sheet. It loads the same Firestore journeys as `Journeys`, tries to resolve coordinates for Firebase rows, and then appends the demo trips from `src/hub/model/mockTrips.js`.
- `Profile` contains preferences and wishlist-related data through `ProfileService` and `ProfileStore`.
- For keys, the default workflow is `.env` locally and `EXPO_PUBLIC_*` values in EAS. There is also an optional embedded-key path documented in code, but it is not the default setup.

## What we still plan to do

- Turn the "community" part of `Discover` into real community content backed by app data instead of another Places query.
- Improve the Hub experience, especially the Time Machine flow and map behaviour on devices where the native map is available.
- We plan to introduce a feature that allows users to create music videos using their existing photo albums.
- Keep polishing the journey creation flow if time allows, for example with better tagging or richer media handling.

## Project file structure

### Root files


| Path                                   | Role                                                                     |
| -------------------------------------- | ------------------------------------------------------------------------ |
| `app.json`                             | Static Expo app metadata.                                                |
| `app.config.js`                        | Dynamic Expo config, including Android Google Maps setup.                |
| `eas.json`                             | EAS build profiles for development, preview, and production.             |
| `embedded-google-api-key.example.json` | Example file for the optional embedded key setup.                        |
| `plugins/withGoogleMapsApiKey.js`      | Config plugin that writes the Google Maps key into the Android manifest. |


### App and features


| Path                                                               | Role                                                                  |
| ------------------------------------------------------------------ | --------------------------------------------------------------------- |
| `src/app/_layout.jsx`                                              | Main router layout and tab structure.                                 |
| `src/app/index.jsx`, `journeys.jsx`, `discover.jsx`, `profile.jsx` | Entry points for the main tabs.                                       |
| `src/app/journeyDetail.jsx`                                        | Separate route for the journey detail page.                           |
| `src/hub/view/*`                                                   | Hub UI, including the map/globe view, stats, and location sheet.      |
| `src/hub/presenter/hubPresenter.js`                                | Presenter layer between Hub views and store logic.                    |
| `src/hub/model/hubStore.js`                                        | Hub state and derived values.                                         |
| `src/hub/model/hubService.js`                                      | Loads journeys for Hub, resolves coordinates, and appends demo trips. |
| `src/hub/model/mockTrips.js`                                       | Demo trip data used by Hub.                                           |
| `src/journeys/view/*`                                              | Journeys screens and add-journey modal.                               |
| `src/journeys/presenter/*`                                         | Presenter logic for journey list and detail screens.                  |
| `src/journeys/model/JourneysStore.js`                              | Journeys state management.                                            |
| `src/journeys/model/JourneysService.js`                            | Firebase read/write logic, photo upload, and mock journeys.           |
| `src/discover/view/*`                                              | Discover screen, cards, search bar, and place detail modal.           |
| `src/discover/presenter/DiscoverPresenter.js`                      | Presenter for Discover interactions.                                  |
| `src/discover/model/DiscoverStore.js`, `DiscoverService.js`        | Discover state and Places API logic.                                  |
| `src/profile/view/*`                                               | Profile screen, preferences, and wishlist UI.                         |
| `src/profile/presenter/ProfilePresenter.js`                        | Presenter for Profile actions.                                        |
| `src/profile/model/ProfileStore.js`, `ProfileService.js`           | Profile state and Firebase-related profile logic.                     |


### Shared code


| Path                               | Role                                                      |
| ---------------------------------- | --------------------------------------------------------- |
| `src/shared/api/firebaseClient.js` | Firebase initialization for auth, Firestore, and Storage. |
| `src/shared/api/placesClient.js`   | Google Places API client used by Discover and Hub.        |
| `src/shared/theme/*`               | Shared design tokens and common styles.                   |
| `src/shared/ui/*`                  | Reusable shared UI components.                            |


## Environment

Copy `.env.example` to `.env` and set:

- `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` — Android MapView (native).
- `EXPO_PUBLIC_PLACES_API_KEY` — Places API in JS.

For **EAS Build**, set the same variables in EAS as well.

If you want to bundle the key into the app for packaging, copy `embedded-google-api-key.example.json` to `embedded-google-api-key.json` and uncomment the embedded-key lines in `app.config.js` and `src/shared/api/placesClient.js`.

## Local development

```bash
npm install
npm run dev
```

You can also run `npx expo start`.

Expo Go works for general testing, but the full Hub map is a native map component and is not available there. In Expo Go, Hub falls back to a simple list view. To test the real map, use a development build or an Android package built through EAS.

## Native build

```bash
eas build --platform android --profile preview
```

This creates an internal Android APK using the `preview` profile in `eas.json`.

For a development build, use:

```bash
eas build --platform android --profile development
```

For a production-style Android build, use:

```bash
eas build --platform android --profile production
```

## Course

Project for **ID2216** (mobile development), KTH.
