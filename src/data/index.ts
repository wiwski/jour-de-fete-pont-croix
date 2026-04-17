import sourceData from '../../data.json';
import type {
  EventRecord,
  NormalizedEvent,
  NormalizedPlace,
  PreparedData,
  SourceData,
} from '../types';
import { compareEvents, eventIsCurrent, getDayPartsForEvent, getFirstStart, getScheduleGroup, resolveDisplayTime } from '../utils/time';

function isSourceData(value: unknown): value is SourceData {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const data = value as Partial<SourceData>;
  return Array.isArray(data.events) && Array.isArray(data.places) && typeof data.meta === 'object';
}

function validateData(data: SourceData): string[] {
  const warnings: string[] = [];
  const placeIds = new Set(data.places.map((place) => place.id));

  data.events.forEach((event) => {
    if (!placeIds.has(event.place_id)) {
      warnings.push(`Le lieu "${event.place_id}" est référencé par "${event.title}" mais absent des places.`);
    }

    if (!event.all_day && event.time_slots.length === 0 && !event.schedule_status) {
      warnings.push(`L'événement "${event.title}" n'a ni créneau ni statut d'horaire.`);
    }
  });

  return warnings;
}

function preparePlaces(data: SourceData): Record<string, NormalizedPlace> {
  const eventCounts = data.events.reduce<Record<string, number>>((accumulator, event) => {
    accumulator[event.place_id] = (accumulator[event.place_id] ?? 0) + 1;
    return accumulator;
  }, {});

  return Object.fromEntries(
    data.places.map((place) => [
      place.id,
      {
        ...place,
        hasCoordinates:
          typeof place.latitude === 'number' && typeof place.longitude === 'number',
        isVirtual: place.kind === 'virtual-area' || Boolean(place.is_virtual),
        eventCount: eventCounts[place.id] ?? 0,
      },
    ]),
  );
}

function normalizeEvent(
  event: EventRecord,
  placesById: Record<string, NormalizedPlace>,
  meta: SourceData['meta'],
  now: Date,
): NormalizedEvent {
  const place = placesById[event.place_id] ?? null;
  const isVirtual = event.is_mobile || place?.isVirtual || !place?.hasCoordinates ? true : false;

  return {
    ...event,
    place,
    isVirtual,
    isCurrent: eventIsCurrent(event, now, meta.date, meta.timezone),
    hasKnownSchedule: event.time_slots.length > 0,
    firstStart: getFirstStart(event),
    resolvedDisplayTime: resolveDisplayTime(event),
    scheduleGroup: getScheduleGroup(event),
    dayParts: getDayPartsForEvent(event),
  };
}

export function getPreparedData(now = new Date()): PreparedData {
  if (!isSourceData(sourceData)) {
    throw new Error('data.json ne respecte pas la structure attendue.');
  }

  const warnings = validateData(sourceData);
  const placesById = preparePlaces(sourceData);
  const places = Object.values(placesById).sort((a, b) => a.sort_order - b.sort_order);
  const events = sourceData.events
    .map((event) => normalizeEvent(event, placesById, sourceData.meta, now))
    .sort(compareEvents);

  const physicalEvents = events.filter((event) => !event.isVirtual);
  const virtualEvents = events.filter((event) => event.isVirtual);
  const mapPlaces = places.filter((place) => place.hasCoordinates && place.eventCount > 0);
  const visibleCategories = Array.from(new Set(events.map((event) => event.category))).sort((a, b) =>
    a.localeCompare(b, 'fr-FR'),
  );
  const eventsByPlaceId = events.reduce<Record<string, NormalizedEvent[]>>((accumulator, event) => {
    accumulator[event.place_id] = accumulator[event.place_id] ?? [];
    accumulator[event.place_id].push(event);
    return accumulator;
  }, {});

  return {
    meta: sourceData.meta,
    events,
    physicalEvents,
    virtualEvents,
    places,
    mapPlaces,
    placesById,
    eventsByPlaceId,
    visibleCategories,
    warnings,
  };
}
