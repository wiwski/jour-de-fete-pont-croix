import type { NormalizedEvent } from '../types';
import { formatCategoryLabel } from '../utils/labels';

interface EventCardProps {
  event: NormalizedEvent;
  onSelectPlace: (placeId: string | null) => void;
}

function getStatusLabel(event: NormalizedEvent): string | null {
  if (event.isCurrent) {
    return 'En ce moment';
  }

  if (event.schedule_status === 'to-be-confirmed') {
    return 'À confirmer';
  }

  if (event.schedule_status === 'unknown') {
    return 'Voir sur place';
  }

  if (event.all_day) {
    return 'Toute la journée';
  }

  return null;
}

export function EventCard({ event, onSelectPlace }: EventCardProps) {
  const status = getStatusLabel(event);

  return (
    <article className="event-card">
      <div className="event-card__header">
        <div>
          <p className="event-card__time">{event.resolvedDisplayTime}</p>
          <h3>{event.title}</h3>
        </div>
        {status ? <span className="pill pill--accent">{status}</span> : null}
      </div>

      <div className="event-card__meta">
        <span className="pill">{formatCategoryLabel(event.category)}</span>
        {event.place && !event.isVirtual ? (
          <button
            type="button"
            className="pill pill--button"
            onClick={() => onSelectPlace(event.place?.id ?? null)}
          >
            {event.place.name}
            {event.subplace ? ` · ${event.subplace}` : ''}
          </button>
        ) : event.place ? (
          <span className="pill">
            {event.place.name}
            {event.subplace ? ` · ${event.subplace}` : ''}
          </span>
        ) : null}
      </div>

      {event.description ? <p className="event-card__description">{event.description}</p> : null}

      {event.organizers && event.organizers.length > 0 ? (
        <p className="event-card__organizers">
          <strong>Par:</strong> {event.organizers.join(', ')}
        </p>
      ) : null}
    </article>
  );
}
