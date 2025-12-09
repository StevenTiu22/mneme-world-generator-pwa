import { GenerationMethod } from '@/models/common/types';

export interface PlanetData {
  id?: string;
  name: string;
  starSystemId: string;
  orbitPosition: number;      // Orbit number from star (1 = innermost)

  // Classification
  planetType: PlanetType;     // GAS_GIANT | ICE_GIANT | ASTEROID_BELT | PLANETOID_BELT | CIRCUMSTELLAR_DISK

  // Physical properties (varies by type)
  size?: number;              // In Jupiter masses for giants
  mass?: number;

  // Belt properties (for asteroid/planetoid belts)
  beltWidth?: number;         // Width in AU
  density?: BeltDensity;

  // Disk properties (for circumstellar disks)
  diskType?: DiskType;        // ACCRETION | PROTOPLANETARY
  diskZone?: DiskZone;        // INFERNAL | HOT | HABITABLE_INNER | HABITABLE_OUTER | COLD | OUTER
  diskMass?: number;          // Mass value (numeric)
  diskMassUnit?: string;      // 'CM' | 'LM' | 'EM' | 'JM'
  diskInnerRadius?: number;   // Inner boundary in AU
  diskOuterRadius?: number;   // Outer boundary in AU

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
  PLANETOID_BELT: 'planetoid_belt',
  CIRCUMSTELLAR_DISK: 'circumstellar_disk'
} as const;

export type PlanetType = typeof PlanetType[keyof typeof PlanetType];

export const BeltDensity = {
  SPARSE: 'sparse',
  MODERATE: 'moderate',
  DENSE: 'dense'
} as const;

export type BeltDensity = typeof BeltDensity[keyof typeof BeltDensity];

export const DiskType = {
  ACCRETION: 'accretion',
  PROTOPLANETARY: 'protoplanetary'
} as const;

export type DiskType = typeof DiskType[keyof typeof DiskType];

export const DiskZone = {
  INFERNAL: 'infernal',
  HOT: 'hot',
  HABITABLE_INNER: 'habitable_inner',
  HABITABLE_OUTER: 'habitable_outer',
  COLD: 'cold',
  OUTER: 'outer'
} as const;

export type DiskZone = typeof DiskZone[keyof typeof DiskZone];

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

export function isValidDiskType(value: unknown): value is DiskType {
  return typeof value === 'string' && Object.values(DiskType).includes(value as DiskType);
}

export function isValidDiskZone(value: unknown): value is DiskZone {
  return typeof value === 'string' && Object.values(DiskZone).includes(value as DiskZone);
}

// Helper functions
export function getAllPlanetTypes(): PlanetType[] {
  return Object.values(PlanetType);
}

export function getAllBeltDensities(): BeltDensity[] {
  return Object.values(BeltDensity);
}

export function getAllDiskTypes(): DiskType[] {
  return Object.values(DiskType);
}

export function getAllDiskZones(): DiskZone[] {
  return Object.values(DiskZone);
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
    case PlanetType.CIRCUMSTELLAR_DISK:
      return 'Circumstellar Disk';
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

export function getDiskTypeLabel(type: DiskType): string {
  switch (type) {
    case DiskType.ACCRETION:
      return 'Accretion Disk';
    case DiskType.PROTOPLANETARY:
      return 'Protoplanetary Disk';
    default:
      return 'Unknown';
  }
}

export function getDiskZoneLabel(zone: DiskZone): string {
  switch (zone) {
    case DiskZone.INFERNAL:
      return 'Infernal Zone';
    case DiskZone.HOT:
      return 'Hot Zone';
    case DiskZone.HABITABLE_INNER:
      return 'Habitable Zone (Inner)';
    case DiskZone.HABITABLE_OUTER:
      return 'Habitable Zone (Outer)';
    case DiskZone.COLD:
      return 'Cold Zone';
    case DiskZone.OUTER:
      return 'Outer Zone';
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

export function isDisk(type: PlanetType): boolean {
  return type === PlanetType.CIRCUMSTELLAR_DISK;
}
