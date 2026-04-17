export type DayPart = 'all' | 'morning' | 'afternoon' | 'evening';
export type ScheduleGroup = 'timed' | 'all-day' | 'unscheduled';

export interface MetaRecord {
  event_name: string;
  date: string;
  city: string;
  timezone: string;
  categories: string[];
}

export interface PlaceRecord {
  id: string;
  kind: 'physical-place' | 'virtual-area';
  name: string;
  subtitle?: string | null;
  address: string;
  latitude: number | null;
  longitude: number | null;
  sort_order: number;
  is_virtual?: boolean;
}

export interface TimeSlotRecord {
  start: string;
  end: string;
}

export interface EventRecord {
  id: string;
  place_id: string;
  title: string;
  description?: string | null;
  category: string;
  organizers?: string[];
  audience?: string | string[] | null;
  price?: string | null;
  all_day: boolean;
  display_time?: string | null;
  time_slots: TimeSlotRecord[];
  subplace?: string | null;
  schedule_status?: 'to-be-confirmed' | 'unknown' | null;
  source_text?: string;
  is_mobile?: boolean;
}

export interface SourceData {
  meta: MetaRecord;
  places: PlaceRecord[];
  events: EventRecord[];
}

export interface NormalizedPlace extends PlaceRecord {
  eventCount: number;
  hasCoordinates: boolean;
  isVirtual: boolean;
}

export interface NormalizedEvent extends EventRecord {
  place: NormalizedPlace | null;
  isVirtual: boolean;
  isCurrent: boolean;
  hasKnownSchedule: boolean;
  firstStart: Date | null;
  resolvedDisplayTime: string;
  scheduleGroup: ScheduleGroup;
  dayParts: DayPart[];
}

export interface PreparedData {
  meta: MetaRecord;
  events: NormalizedEvent[];
  physicalEvents: NormalizedEvent[];
  virtualEvents: NormalizedEvent[];
  places: NormalizedPlace[];
  mapPlaces: NormalizedPlace[];
  placesById: Record<string, NormalizedPlace>;
  eventsByPlaceId: Record<string, NormalizedEvent[]>;
  visibleCategories: string[];
  warnings: string[];
}

export interface FiltersState {
  category: string;
  dayPart: DayPart;
  currentOnly: boolean;
  selectedPlaceId: string | null;
}
