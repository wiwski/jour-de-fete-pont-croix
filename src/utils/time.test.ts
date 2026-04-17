import { describe, expect, it } from 'vitest';
import type { EventRecord } from '../types';
import { compareEvents, eventIsCurrent, getDayPartsForEvent, resolveDisplayTime } from './time';

const baseEvent: EventRecord = {
  id: 'event-1',
  place_id: 'place-1',
  title: 'Atelier',
  category: 'atelier',
  description: null,
  organizers: [],
  all_day: false,
  display_time: null,
  time_slots: [],
};

describe('time utils', () => {
  it('resolves multi-slot labels', () => {
    const label = resolveDisplayTime({
      ...baseEvent,
      time_slots: [
        { start: '2026-04-25T10:00:00+02:00', end: '2026-04-25T12:00:00+02:00' },
        { start: '2026-04-25T14:00:00+02:00', end: '2026-04-25T18:00:00+02:00' },
      ],
    });

    expect(label).toContain('10:00');
    expect(label).toContain('14:00');
  });

  it('detects current events only on the event date', () => {
    const event = {
      ...baseEvent,
      time_slots: [{ start: '2026-04-25T10:00:00+02:00', end: '2026-04-25T12:00:00+02:00' }],
    };

    expect(
      eventIsCurrent(event, new Date('2026-04-25T10:30:00+02:00'), '2026-04-25', 'Europe/Paris'),
    ).toBe(true);
    expect(
      eventIsCurrent(event, new Date('2026-04-26T10:30:00+02:00'), '2026-04-25', 'Europe/Paris'),
    ).toBe(false);
  });

  it('maps an all-day event to all day parts', () => {
    expect(
      getDayPartsForEvent({
        ...baseEvent,
        all_day: true,
      }),
    ).toEqual(['morning', 'afternoon', 'evening']);
  });

  it('sorts timed events before all-day ones', () => {
    const timed = {
      ...baseEvent,
      time_slots: [{ start: '2026-04-25T09:00:00+02:00', end: '2026-04-25T10:00:00+02:00' }],
      firstStart: new Date('2026-04-25T09:00:00+02:00'),
      scheduleGroup: 'timed' as const,
      resolvedDisplayTime: '09:00–10:00',
      isVirtual: false,
      isCurrent: false,
      hasKnownSchedule: true,
      dayParts: ['morning'],
      place: null,
    };
    const allDay = {
      ...timed,
      id: 'event-2',
      all_day: true,
      scheduleGroup: 'all-day' as const,
      firstStart: new Date('2026-04-25T09:00:00+02:00'),
    };

    expect(compareEvents(timed, allDay)).toBeLessThan(0);
  });
});
