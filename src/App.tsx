import { useEffect, useMemo, useState } from "react";
import posterImage from "../image.webp";
import { EventList } from "./components/EventList";
import { FilterBar } from "./components/FilterBar";
import { MapView } from "./components/MapView";
import { PlacePanel } from "./components/PlacePanel";
import { VirtualEventsPanel } from "./components/VirtualEventsPanel";
import { getPreparedData } from "./data";
import type { FiltersState } from "./types";
import {
  countEventsByPlace,
  filterEvents,
  filterPlacesForMap,
} from "./utils/selectors";
import "./styles.css";
import "leaflet/dist/leaflet.css";

const DEFAULT_FILTERS: FiltersState = {
  category: "all",
  dayPart: "all",
  currentOnly: false,
  selectedPlaceId: null,
};

export default function App() {
  const [now, setNow] = useState(() => new Date());
  const [filters, setFilters] = useState<FiltersState>(DEFAULT_FILTERS);
  const [isMobileViewport, setIsMobileViewport] = useState(
    () => window.matchMedia("(max-width: 959px)").matches,
  );

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 959px)");
    const updateViewport = () => {
      setIsMobileViewport(mediaQuery.matches);
    };

    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);

    return () => {
      mediaQuery.removeEventListener("change", updateViewport);
    };
  }, []);

  const prepared = useMemo(() => getPreparedData(now), [now]);
  const baseFilters = useMemo(
    () => ({
      ...filters,
      selectedPlaceId: null,
    }),
    [filters],
  );

  const filteredWithoutPlace = useMemo(
    () => filterEvents(prepared.physicalEvents, baseFilters),
    [baseFilters, prepared.physicalEvents],
  );
  const filteredVirtualEvents = useMemo(
    () => filterEvents(prepared.virtualEvents, baseFilters),
    [baseFilters, prepared.virtualEvents],
  );
  const filteredEvents = useMemo(
    () => filterEvents(prepared.physicalEvents, filters),
    [filters, prepared.physicalEvents],
  );
  const placeCounts = useMemo(
    () => countEventsByPlace(filteredWithoutPlace),
    [filteredWithoutPlace],
  );
  const mapPlaces = useMemo(
    () => filterPlacesForMap(prepared.mapPlaces, placeCounts),
    [placeCounts, prepared.mapPlaces],
  );

  const selectedPlace = filters.selectedPlaceId
    ? (prepared.placesById[filters.selectedPlaceId] ?? null)
    : null;
  const selectedPlaceEvents = filters.selectedPlaceId
    ? filteredWithoutPlace.filter(
        (event) => event.place_id === filters.selectedPlaceId,
      )
    : [];

  const handleSelectPlace = (placeId: string | null) => {
    setFilters((current) => ({
      ...current,
      selectedPlaceId: placeId,
    }));
  };

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero__content">
          <p className="eyebrow">
            Pont-Croix · Samedi 25 avril 2026 · 9h30 - 20h
          </p>
          <h1>{prepared.meta.event_name}</h1>
          <p className="hero__lede">
            Habitants, associations, artistes et commerçants ouvrent leurs
            portes et proposent ateliers, concerts, visites et animations dans
            toute la ville.
          </p>
          <p>
            Explorez la carte et le programme pour vous laisser guider au fil de
            la journée, de lieu en lieu.
          </p>
        </div>
        <div className="hero__poster">
          <img src={posterImage} alt="Affiche du Jour de fête à Pont-Croix" />
        </div>
      </header>

      <FilterBar
        filters={filters}
        categories={prepared.visibleCategories}
        selectedPlaceLabel={selectedPlace?.name ?? null}
        onCategoryChange={(category) =>
          setFilters((current) => ({ ...current, category }))
        }
        onDayPartChange={(dayPart) =>
          setFilters((current) => ({ ...current, dayPart }))
        }
        onCurrentOnlyChange={(currentOnly) =>
          setFilters((current) => ({ ...current, currentOnly }))
        }
        onReset={() => setFilters(DEFAULT_FILTERS)}
        onClearPlace={() =>
          setFilters((current) => ({
            ...current,
            selectedPlaceId: null,
          }))
        }
      />

      {prepared.warnings.length > 0 ? (
        <section className="notice-banner notice-banner--warning">
          <strong>Données à vérifier.</strong> {prepared.warnings[0]}
        </section>
      ) : null}

      <main className="content-grid">
        {!isMobileViewport ? (
          <section className="content-grid__map">
            <MapView
              places={mapPlaces}
              activePlaceId={filters.selectedPlaceId}
              eventCounts={placeCounts}
              onSelectPlace={handleSelectPlace}
            />
          </section>
        ) : null}

        <section className="content-grid__program">
          <PlacePanel
            place={selectedPlace}
            events={selectedPlaceEvents}
            onClear={() => handleSelectPlace(null)}
          />

          {isMobileViewport ? (
            <MapView
              places={mapPlaces}
              activePlaceId={filters.selectedPlaceId}
              eventCounts={placeCounts}
              onSelectPlace={handleSelectPlace}
              className="map-card--inline"
            />
          ) : null}

          <EventList
            title={
              selectedPlace
                ? `Programme autour de ${selectedPlace.name}`
                : "Programme de la journée"
            }
            events={filteredEvents}
            emptyLabel="Aucun événement ne correspond aux filtres actifs."
            onSelectPlace={handleSelectPlace}
          />

          {!filters.selectedPlaceId ? (
            <VirtualEventsPanel
              events={filteredVirtualEvents}
              onSelectPlace={handleSelectPlace}
            />
          ) : null}
        </section>
      </main>
    </div>
  );
}
