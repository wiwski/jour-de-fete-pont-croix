import type { FiltersState, NormalizedEvent, NormalizedPlace } from '../types';

export function filterEvents(events: NormalizedEvent[], filters: FiltersState): NormalizedEvent[] {
  return events.filter((event) => {
    if (filters.category !== 'all' && event.category !== filters.category) {
      return false;
    }

    if (filters.dayPart !== 'all' && !event.dayParts.includes(filters.dayPart)) {
      return false;
    }

    if (filters.currentOnly && !event.isCurrent) {
      return false;
    }

    if (filters.selectedPlaceId && event.place_id !== filters.selectedPlaceId) {
      return false;
    }

    return true;
  });
}

export function countEventsByPlace(events: NormalizedEvent[]): Record<string, number> {
  return events.reduce<Record<string, number>>((accumulator, event) => {
    accumulator[event.place_id] = (accumulator[event.place_id] ?? 0) + 1;
    return accumulator;
  }, {});
}

export function filterPlacesForMap(
  places: NormalizedPlace[],
  eventCounts: Record<string, number>,
): NormalizedPlace[] {
  return places.filter((place) => place.hasCoordinates && (eventCounts[place.id] ?? 0) > 0);
}
