import { useEffect, useMemo } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { NormalizedPlace } from '../types';

interface MapViewProps {
  places: NormalizedPlace[];
  activePlaceId: string | null;
  className?: string;
  eventCounts: Record<string, number>;
  onSelectPlace: (placeId: string) => void;
}

function createMarkerIcon(isActive: boolean, count: number) {
  return L.divIcon({
    className: '',
    html: `<div class="map-marker${isActive ? ' map-marker--active' : ''}">
      <span>${count}</span>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

function RecenterMap({
  places,
  selectedPlace,
}: {
  places: NormalizedPlace[];
  selectedPlace: NormalizedPlace | null;
}) {
  const map = useMap();
  const bounds = useMemo(() => {
    const coordinates = places
      .filter(
        (place) =>
          place.latitude !== null &&
          place.longitude !== null,
      )
      .map((place) => [place.latitude as number, place.longitude as number] as [number, number]);

    return coordinates.length > 0 ? L.latLngBounds(coordinates) : null;
  }, [places]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      map.invalidateSize();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [map]);

  useEffect(() => {
    if (!selectedPlace || selectedPlace.latitude === null || selectedPlace.longitude === null) {
      if (!bounds) {
        return;
      }

      map.fitBounds(bounds, {
        padding: [28, 28],
        maxZoom: 15,
      });
      return;
    }

    map.flyTo([selectedPlace.latitude, selectedPlace.longitude], 16, {
      duration: 0.5,
    });
  }, [bounds, map, selectedPlace]);

  return null;
}

export function MapView({ places, activePlaceId, className, eventCounts, onSelectPlace }: MapViewProps) {
  const fallbackCenter: [number, number] = [48.0409, -4.4892];
  const selectedPlace = activePlaceId ? places.find((place) => place.id === activePlaceId) ?? null : null;

  return (
    <section className={`section-card map-card${className ? ` ${className}` : ''}`}>
      <div className="section-card__header">
        <div>
          <p className="eyebrow">Carte</p>
          <h2>Explorer les lieux</h2>
        </div>
        <span className="section-card__count">{places.length} lieux</span>
      </div>

      <div className="map-frame">
        <MapContainer center={fallbackCenter} zoom={15} scrollWheelZoom className="map-root">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <RecenterMap places={places} selectedPlace={selectedPlace} />
          {places.map((place) => {
            if (place.latitude === null || place.longitude === null) {
              return null;
            }

            return (
              <Marker
                key={place.id}
                position={[place.latitude, place.longitude]}
                icon={createMarkerIcon(place.id === activePlaceId, eventCounts[place.id] ?? 0)}
                eventHandlers={{
                  click: () => onSelectPlace(place.id),
                }}
              >
                <Popup>
                  <strong>{place.name}</strong>
                  <br />
                  {place.subtitle ? (
                    <>
                      {place.subtitle}
                      <br />
                    </>
                  ) : null}
                  {eventCounts[place.id] ?? 0} événement(s)
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </section>
  );
}
