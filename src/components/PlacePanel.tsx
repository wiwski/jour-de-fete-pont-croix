import type { NormalizedEvent, NormalizedPlace } from "../types";

interface PlacePanelProps {
  place: NormalizedPlace | null;
  events: NormalizedEvent[];
  onClear: () => void;
}

export function PlacePanel({ place, events, onClear }: PlacePanelProps) {
  if (!place) {
    return (
      <section className="section-card place-panel place-panel--empty">
        <p className="eyebrow">Choisir un lieu</p>
        <h2>Sélectionnez un point sur la carte pour voir ce qui s’y passe</h2>
        <p>
          Cliquez sur un lieu pour afficher les animations associées et explorer
          le programme à cet endroit. Vous pouvez revenir à l’ensemble du
          programme à tout moment.
        </p>
      </section>
    );
  }

  return (
    <section className="section-card place-panel">
      <div className="section-card__header">
        <div>
          <p className="eyebrow">Lieu sélectionné</p>
          <h2>{place.name}</h2>
        </div>
        <button type="button" className="ghost-button" onClick={onClear}>
          Voir tous les lieux
        </button>
      </div>
      {place.subtitle ? (
        <p className="place-panel__subtitle">{place.subtitle}</p>
      ) : null}
      <p className="place-panel__address">{place.address}</p>
      <p className="place-panel__summary">
        {events.length} événement(s) associé(s)
      </p>
    </section>
  );
}
