/**
 * Hub demo trips — aligned with `MOCK_JOURNEYS` in `journeys/model/JourneysService.js`:
 * per-day amounts only (same shape as Firestore `dailyExpenses`), not category breakdown.
 * @type {import('./tripModel').Trip[]}
 */

function expensesFromDaily(daily) {
  return daily.map((amount, i) => ({
    category: `Day ${i + 1}`,
    amount,
    currency: 'USD',
  }));
}

export const MOCK_TRIPS = [
  {
    id: 'journey-tokyo-2024',
    destination: 'Tokyo',
    country: 'Japan',
    startDate: '2024-03-01',
    endDate: '2024-03-08',
    coordinates: { latitude: 35.6762, longitude: 139.6503 },
    expenses: expensesFromDaily([280, 340, 420, 300, 380, 290, 430]),
    photos: 142,
    companions: [],
  },
  {
    id: 'journey-paris-2024',
    destination: 'Paris',
    country: 'France',
    startDate: '2024-01-15',
    endDate: '2024-01-22',
    coordinates: { latitude: 48.8566, longitude: 2.3522 },
    expenses: expensesFromDaily([250, 300, 390, 280, 410, 320, 500]),
    photos: 142,
    companions: [],
  },
  {
    id: 'journey-seoul-2023',
    destination: 'Seoul',
    country: 'South Korea',
    startDate: '2023-11-10',
    endDate: '2023-11-20',
    coordinates: { latitude: 37.5665, longitude: 126.978 },
    expenses: expensesFromDaily([
      320, 360, 410, 380, 450, 340, 390, 420, 360, 410,
    ]),
    photos: 211,
    companions: [],
  },
];
