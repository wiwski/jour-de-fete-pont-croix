import type { DayPart, FiltersState } from '../types';
import { formatCategoryLabel } from '../utils/labels';

interface FilterBarProps {
  filters: FiltersState;
  categories: string[];
  selectedPlaceLabel?: string | null;
  onCategoryChange: (category: string) => void;
  onDayPartChange: (dayPart: DayPart) => void;
  onCurrentOnlyChange: (currentOnly: boolean) => void;
  onReset: () => void;
  onClearPlace: () => void;
}

const DAY_PART_OPTIONS: { value: DayPart; label: string }[] = [
  { value: 'all', label: 'Toute la journée' },
  { value: 'morning', label: 'Matin' },
  { value: 'afternoon', label: 'Après-midi' },
  { value: 'evening', label: 'Soirée' },
];

export function FilterBar({
  filters,
  categories,
  selectedPlaceLabel,
  onCategoryChange,
  onDayPartChange,
  onCurrentOnlyChange,
  onReset,
  onClearPlace,
}: FilterBarProps) {
  return (
    <section className="filter-bar" aria-label="Filtres du programme">
      <div className="filter-bar__grid">
        <label className="field">
          <span className="field__label">Catégorie</span>
          <select
            value={filters.category}
            onChange={(event) => onCategoryChange(event.target.value)}
          >
            <option value="all">Toutes</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {formatCategoryLabel(category)}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field__label">Moment</span>
          <select
            value={filters.dayPart}
            onChange={(event) => onDayPartChange(event.target.value as DayPart)}
          >
            {DAY_PART_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field field--checkbox">
          <input
            type="checkbox"
            checked={filters.currentOnly}
            onChange={(event) => onCurrentOnlyChange(event.target.checked)}
          />
          <span>En ce moment</span>
        </label>

        <button type="button" className="ghost-button" onClick={onReset}>
          Réinitialiser
        </button>
      </div>

      {selectedPlaceLabel ? (
        <div className="filter-bar__selection">
          <span>Lieu sélectionné: {selectedPlaceLabel}</span>
          <button type="button" className="text-button" onClick={onClearPlace}>
            Retirer le filtre
          </button>
        </div>
      ) : null}
    </section>
  );
}
