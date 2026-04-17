import type { DayPart, EventRecord, NormalizedEvent, TimeSlotRecord } from '../types';

const DAY_PART_WINDOWS: Record<Exclude<DayPart, 'all'>, [number, number]> = {
  morning: [9, 12],
  afternoon: [12, 18],
  evening: [18, 22],
};

function formatParts(date: Date, timeZone: string): Record<string, string> {
  return Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
      .formatToParts(date)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  );
}

export function getZonedDateKey(date: Date, timeZone: string): string {
  const parts = formatParts(date, timeZone);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function getZonedHour(date: Date, timeZone: string): number {
  return Number.parseInt(formatParts(date, timeZone).hour, 10);
}

export function parseSlotDate(value: string): Date {
  return new Date(value);
}

export function formatSlot(slot: TimeSlotRecord): string {
  const start = parseSlotDate(slot.start);
  const end = parseSlotDate(slot.end);
  const startLabel = start.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const endLabel = end.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (start.getTime() === end.getTime()) {
    return startLabel;
  }

  return `${startLabel}–${endLabel}`;
}

export function resolveDisplayTime(event: EventRecord): string {
  if (event.display_time) {
    return event.display_time;
  }

  if (event.all_day) {
    return 'Toute la journée';
  }

  if (event.time_slots.length > 0) {
    return event.time_slots.map(formatSlot).join(' • ');
  }

  if (event.schedule_status === 'to-be-confirmed') {
    return 'Horaires à préciser';
  }

  if (event.schedule_status === 'unknown') {
    return 'Voir sur place';
  }

  return 'Horaires non renseignés';
}

export function getFirstStart(event: EventRecord): Date | null {
  if (event.time_slots.length === 0) {
    return null;
  }

  return parseSlotDate(event.time_slots[0].start);
}

export function eventIsCurrent(
  event: EventRecord,
  now: Date,
  eventDate: string,
  timeZone: string,
): boolean {
  if (getZonedDateKey(now, timeZone) !== eventDate) {
    return false;
  }

  return event.time_slots.some((slot) => {
    const start = parseSlotDate(slot.start).getTime();
    const end = parseSlotDate(slot.end).getTime();
    const current = now.getTime();
    return current >= start && current <= end;
  });
}

export function getDayPartsForEvent(event: EventRecord): DayPart[] {
  if (event.all_day) {
    return ['morning', 'afternoon', 'evening'];
  }

  if (event.time_slots.length === 0) {
    const label = event.display_time?.toLowerCase() ?? '';

    if (label.includes('journée')) {
      return ['morning', 'afternoon', 'evening'];
    }

    if (label.includes('matin')) {
      return ['morning'];
    }

    if (label.includes('après-midi') || label.includes('apres-midi')) {
      return ['afternoon'];
    }

    if (label.includes('soir')) {
      return ['evening'];
    }

    return [];
  }

  const dayParts = new Set<DayPart>();

  event.time_slots.forEach((slot) => {
    const start = parseSlotDate(slot.start);
    const end = parseSlotDate(slot.end);
    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const rawEndMinutes = end.getHours() * 60 + end.getMinutes();
    const endMinutes = rawEndMinutes === startMinutes ? rawEndMinutes + 1 : rawEndMinutes;

    Object.entries(DAY_PART_WINDOWS).forEach(([dayPart, [startHour, endHour]]) => {
      const windowStart = startHour * 60;
      const windowEnd = endHour * 60;
      const overlaps = startMinutes < windowEnd && endMinutes > windowStart;

      if (overlaps) {
        dayParts.add(dayPart as DayPart);
      }
    });
  });

  return Array.from(dayParts);
}

export function getScheduleGroup(event: EventRecord): NormalizedEvent['scheduleGroup'] {
  if (event.time_slots.length === 0) {
    return 'unscheduled';
  }

  if (event.all_day) {
    return 'all-day';
  }

  return 'timed';
}

export function compareEvents(a: NormalizedEvent, b: NormalizedEvent): number {
  const rank = {
    timed: 0,
    'all-day': 1,
    unscheduled: 2,
  } as const;

  const groupDiff = rank[a.scheduleGroup] - rank[b.scheduleGroup];
  if (groupDiff !== 0) {
    return groupDiff;
  }

  if (a.firstStart && b.firstStart) {
    return a.firstStart.getTime() - b.firstStart.getTime();
  }

  if (a.firstStart) {
    return -1;
  }

  if (b.firstStart) {
    return 1;
  }

  return a.title.localeCompare(b.title, 'fr-FR');
}
