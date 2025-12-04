import { GenerationMethod } from '@/models/common/types';

export interface PlanetData {
  id?: string;
  name: string;
  starSystemId: string;
  orbitPosition: number;      // Orbit number from star (1 = innermost)

  // Classification
  planetType: PlanetType;     // GAS_GIANT | ICE_GIANT | ASTEROID_BELT | PLANETOID_BELT

  // Physical properties (varies by type)
  size?: number;              // In Jupiter masses for giants
  mass?: number;

  // Belt properties (for asteroid/planetoid belts)
  beltWidth?: number;         // Width in AU
  density?: BeltDensity;

  // Generation metadata
  generationMethod: GenerationMethod;
  diceRolls?: PlanetDiceRolls;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export const PlanetType = {
  GAS_GIANT: 'gas_giant',
  ICE_GIANT: 'ice_giant',
  ASTEROID_BELT: 'asteroid_belt',
  PLANETOID_BELT: 'planetoid_belt'
} as const;

export type PlanetType = typeof PlanetType[keyof typeof PlanetType];

export const BeltDensity = {
  SPARSE: 'sparse',
  MODERATE: 'moderate',
  DENSE: 'dense'
} as const;

export type BeltDensity = typeof BeltDensity[keyof typeof BeltDensity];

export interface PlanetDiceRolls {
  typeRoll?: number;
  sizeRoll?: number;
  densityRoll?: number;
}

// Type guards for runtime validation
export function isValidPlanetType(value: unknown): value is PlanetType {
  return typeof value === 'string' && Object.values(PlanetType).includes(value as PlanetType);
}

export function isValidBeltDensity(value: unknown): value is BeltDensity {
  return typeof value === 'string' && Object.values(BeltDensity).includes(value as BeltDensity);
}

// Helper functions
export function getAllPlanetTypes(): PlanetType[] {
  return Object.values(PlanetType);
}

export function getAllBeltDensities(): BeltDensity[] {
  return Object.values(BeltDensity);
}

export function getPlanetTypeLabel(type: PlanetType): string {
  switch (type) {
    case PlanetType.GAS_GIANT:
      return 'Gas Giant';
    case PlanetType.ICE_GIANT:
      return 'Ice Giant';
    case PlanetType.ASTEROID_BELT:
      return 'Asteroid Belt';
    case PlanetType.PLANETOID_BELT:
      return 'Planetoid Belt';
    default:
      return 'Unknown';
  }
}

export function getBeltDensityLabel(density: BeltDensity): string {
  switch (density) {
    case BeltDensity.SPARSE:
      return 'Sparse';
    case BeltDensity.MODERATE:
      return 'Moderate';
    case BeltDensity.DENSE:
      return 'Dense';
    default:
      return 'Unknown';
  }
}

export function isPlanetBelt(type: PlanetType): boolean {
  return type === PlanetType.ASTEROID_BELT || type === PlanetType.PLANETOID_BELT;
}

export function isPlanetGiant(type: PlanetType): boolean {
  return type === PlanetType.GAS_GIANT || type === PlanetType.ICE_GIANT;
}
