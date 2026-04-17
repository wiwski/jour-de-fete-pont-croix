import type { NormalizedEvent } from '../types';
import { EventCard } from './EventCard';

interface VirtualEventsPanelProps {
  events: NormalizedEvent[];
  onSelectPlace: (placeId: string | null) => void;
}

export function VirtualEventsPanel({ events, onSelectPlace }: VirtualEventsPanelProps) {
  if (events.length === 0) {
    return null;
  }

  return (
    <section className="section-card">
      <div className="section-card__header">
        <div>
          <p className="eyebrow">Déambulation</p>
          <h2>Dans toute la ville</h2>
        </div>
      </div>

      <div className="event-group__items">
        {events.map((event) => (
          <EventCard key={event.id} event={event} onSelectPlace={onSelectPlace} />
        ))}
      </div>
    </section>
  );
}
