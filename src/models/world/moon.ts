import { GenerationMethod } from '@/models/common/types';

export interface MoonData {
  id?: string;
  name: string;
  worldId: string;           // Foreign key to parent world
  starSystemId: string;      // For easy queries
  orbitPosition?: number;    // Optional orbit number (1st moon, 2nd moon, etc.)

  // Physical properties
  size: number;              // In lunar masses (LM)
  mass: number;              // In lunar masses
  gravity: number;           // In Earth G

  // Classification
  moonType: MoonType;        // MAJOR | MINOR | CAPTURED_ASTEROID
  composition?: string;      // Optional composition description

  // Generation metadata
  generationMethod: GenerationMethod;
  diceRolls?: MoonDiceRolls;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export const MoonType = {
  MAJOR: 'major',
  MINOR: 'minor',
  CAPTURED_ASTEROID: 'captured_asteroid'
} as const;

export type MoonType = typeof MoonType[keyof typeof MoonType];

export interface MoonDiceRolls {
  typeRoll?: number;
  sizeRoll?: number;
  gravityRoll?: number;
}

// Type guard for runtime validation
export function isValidMoonType(value: unknown): value is MoonType {
  return typeof value === 'string' && Object.values(MoonType).includes(value as MoonType);
}

// Helper function to get all moon types
export function getAllMoonTypes(): MoonType[] {
  return Object.values(MoonType);
}

// Helper function to get moon type label
export function getMoonTypeLabel(type: MoonType): string {
  switch (type) {
    case MoonType.MAJOR:
      return 'Major Moon';
    case MoonType.MINOR:
      return 'Minor Moon';
    case MoonType.CAPTURED_ASTEROID:
      return 'Captured Asteroid';
    default:
      return 'Unknown';
  }
}
