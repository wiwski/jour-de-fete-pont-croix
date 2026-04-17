import type { NormalizedEvent } from '../types';
import { EventCard } from './EventCard';

interface EventListProps {
  events: NormalizedEvent[];
  title: string;
  emptyLabel: string;
  onSelectPlace: (placeId: string | null) => void;
}

const GROUPS: {
  key: NormalizedEvent['scheduleGroup'];
  title: string;
}[] = [
  { key: 'timed', title: 'À horaires fixes' },
  { key: 'all-day', title: 'Toute la journée' },
  { key: 'unscheduled', title: 'Horaires à préciser' },
];

export function EventList({ events, title, emptyLabel, onSelectPlace }: EventListProps) {
  const grouped = GROUPS.map((group) => ({
    ...group,
    events: events.filter((event) => event.scheduleGroup === group.key),
  })).filter((group) => group.events.length > 0);

  return (
    <section className="section-card">
      <div className="section-card__header">
        <div>
          <p className="eyebrow">Programme</p>
          <h2>{title}</h2>
        </div>
        <span className="section-card__count">{events.length} événement(s)</span>
      </div>

      {events.length === 0 ? <p className="empty-state">{emptyLabel}</p> : null}

      <div className="event-groups">
        {grouped.map((group) => (
          <section key={group.key} className="event-group">
            <div className="event-group__title">
              <h3>{group.title}</h3>
            </div>
            <div className="event-group__items">
              {group.events.map((event) => (
                <EventCard key={event.id} event={event} onSelectPlace={onSelectPlace} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
