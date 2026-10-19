import { goatsApi, hensApi, ducksApi, type SimpleAnimalApi } from '../api/endpoints';

export const SIMPLE_ANIMAL_STATUSES = ['Active', 'Sold', 'Deceased'] as const;
// Goat (or any future species wired into the breeding pipeline) cycles through these too.
export const BREEDING_ANIMAL_STATUSES = ['Active', 'Mated', 'Pregnant', 'Sold', 'Deceased'] as const;

export interface SimpleAnimalConfig {
  label: string;
  singular: string;
  icon: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap;
  emoji: string;
  color: string;
  api: SimpleAnimalApi;
  /** Does this species track Female/Male (needed to pick a breedable female)? Only Goat today. */
  hasGender: boolean;
  /** Is this species wired into the breeding/pregnancy/kidding pipeline? Only Goat today. */
  hasBreeding: boolean;
  /** Does this species log periodic weigh-ins (current weight + history)? Only Goat today. */
  hasWeightTracking: boolean;
}

// Goat/Hen/Duck share the exact same shape and CRUD API — one set of screens driven by this
// config, parameterized by the `type` route segment, instead of tripling near-identical JSX.
// Goat additionally supports breeding + weight tracking; Hen/Duck are plain inventory.
export const SIMPLE_ANIMAL_CONFIG = {
  goats: { label: 'Goats', singular: 'Goat', icon: 'paw-outline', emoji: '🐐', color: '#7C3AED', api: goatsApi, hasGender: true, hasBreeding: true, hasWeightTracking: true },
  hens: { label: 'Hens', singular: 'Hen', icon: 'egg-outline', emoji: '🐔', color: '#D97706', api: hensApi, hasGender: false, hasBreeding: false, hasWeightTracking: false },
  ducks: { label: 'Ducks', singular: 'Duck', icon: 'water-outline', emoji: '🦆', color: '#0891B2', api: ducksApi, hasGender: false, hasBreeding: false, hasWeightTracking: false },
} as const satisfies Record<string, SimpleAnimalConfig>;

export type SimpleAnimalTypeSlug = keyof typeof SIMPLE_ANIMAL_CONFIG;

export const isSimpleAnimalTypeSlug = (value: string | undefined): value is SimpleAnimalTypeSlug =>
  !!value && value in SIMPLE_ANIMAL_CONFIG;

// Weight trend (Goat only): red if lighter than last time, green once a 2.5kg+ gain since the
// last weigh-in, otherwise blue "no change" (anywhere from 0 up to that 2.5kg gain threshold).
export type WeightTrend = 'gain' | 'loss' | 'stable' | 'none';

export const WEIGHT_TREND_COLOR: Record<WeightTrend, string> = {
  gain: '#16A34A', loss: '#DC2626', stable: '#2563EB', none: '#6B7280',
};

export const WEIGHT_TREND_LABEL: Record<WeightTrend, string> = {
  gain: 'Gained', loss: 'Decreased', stable: 'No Change', none: 'Not weighed',
};

export function getWeightTrend(current?: number | string | null, previous?: number | string | null): WeightTrend {
  if (current === undefined || current === null || previous === undefined || previous === null || previous === '') return 'none';
  const delta = Number(current) - Number(previous);
  if (delta < 0) return 'loss';
  if (delta >= 2.5) return 'gain';
  return 'stable';
}
