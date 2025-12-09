import { GenerationMethod } from '../common/types';

/**
 * Brown Dwarf Spectral Types
 * Based on effective temperature ranges:
 * - L Class: 1300-2500 K (red/brown, lithium present)
 * - T Class: 600-1300 K (methane absorption features)
 * - Y Class: <600 K (ammonia clouds, coolest)
 */
export const BrownDwarfSpectralType = {
  L_CLASS: 'l_class',
  T_CLASS: 't_class',
  Y_CLASS: 'y_class',
} as const;

export type BrownDwarfSpectralType = typeof BrownDwarfSpectralType[keyof typeof BrownDwarfSpectralType];

/**
 * Type guard for BrownDwarfSpectralType
 */
export function isValidBrownDwarfSpectralType(value: unknown): value is BrownDwarfSpectralType {
  return (
    typeof value === 'string' &&
    Object.values(BrownDwarfSpectralType).includes(value as BrownDwarfSpectralType)
  );
}

/**
 * Get all brown dwarf spectral types
 */
export function getAllBrownDwarfSpectralTypes(): BrownDwarfSpectralType[] {
  return Object.values(BrownDwarfSpectralType);
}

/**
 * Get human-readable label for spectral type
 */
export function getBrownDwarfSpectralTypeLabel(type: BrownDwarfSpectralType): string {
  const labels: Record<BrownDwarfSpectralType, string> = {
    [BrownDwarfSpectralType.L_CLASS]: 'L Class (Hot)',
    [BrownDwarfSpectralType.T_CLASS]: 'T Class (Moderate)',
    [BrownDwarfSpectralType.Y_CLASS]: 'Y Class (Cool)',
  };
  return labels[type];
}

/**
 * Get description for spectral type
 */
export function getBrownDwarfSpectralTypeDescription(type: BrownDwarfSpectralType): string {
  const descriptions: Record<BrownDwarfSpectralType, string> = {
    [BrownDwarfSpectralType.L_CLASS]: 'Red/brown coloration, 1300-2500 K',
    [BrownDwarfSpectralType.T_CLASS]: 'Methane absorption, 600-1300 K',
    [BrownDwarfSpectralType.Y_CLASS]: 'Ammonia clouds, <600 K',
  };
  return descriptions[type];
}

/**
 * Dice rolls used for brown dwarf generation
 */
export interface BrownDwarfDiceRolls {
  massRoll?: number;        // 2D6 for mass range
  spectralRoll?: number;    // 2D6 for spectral type and temperature
}

/**
 * Brown Dwarf Data Interface
 * Represents a substellar object (13-80 Jupiter masses)
 * Too small to sustain hydrogen fusion but larger than gas giants
 */
export interface BrownDwarfData {
  id: string;
  name: string;
  starSystemId: string;
  orbitPosition: number;      // Orbital slot in system (1-20)

  // Physical Properties
  mass: number;               // Jupiter masses (13-80 JM)
  temperature: number;        // Kelvin (300-2500 K)
  spectralType: BrownDwarfSpectralType;

  // Generation Metadata
  generationMethod: GenerationMethod;
  diceRolls?: BrownDwarfDiceRolls;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

/**
 * Validate brown dwarf data
 */
export function validateBrownDwarfData(data: Partial<BrownDwarfData>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Required fields
  if (!data.name) errors.push('Name is required');
  if (!data.starSystemId) errors.push('Star system ID is required');
  if (data.orbitPosition === undefined) errors.push('Orbit position is required');

  // Physical constraints
  if (data.mass !== undefined) {
    if (data.mass < 13) errors.push('Brown dwarf mass must be at least 13 Jupiter masses');
    if (data.mass > 80) errors.push('Brown dwarf mass cannot exceed 80 Jupiter masses');
  }

  if (data.temperature !== undefined) {
    if (data.temperature < 300) errors.push('Temperature must be at least 300 K');
    if (data.temperature > 2500) errors.push('Temperature cannot exceed 2500 K');
  }

  // Spectral type
  if (data.spectralType && !isValidBrownDwarfSpectralType(data.spectralType)) {
    errors.push('Invalid spectral type');
  }

  // Dice rolls validation
  if (data.diceRolls) {
    if (data.diceRolls.massRoll !== undefined && (data.diceRolls.massRoll < 2 || data.diceRolls.massRoll > 12)) {
      errors.push('Mass roll must be between 2 and 12');
    }
    if (data.diceRolls.spectralRoll !== undefined && (data.diceRolls.spectralRoll < 2 || data.diceRolls.spectralRoll > 12)) {
      errors.push('Spectral roll must be between 2 and 12');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Generate default name for brown dwarf
 */
export function generateDefaultBrownDwarfName(spectralType: BrownDwarfSpectralType, orbitPosition: number): string {
  const spectralPrefix = spectralType === BrownDwarfSpectralType.L_CLASS ? 'L'
    : spectralType === BrownDwarfSpectralType.T_CLASS ? 'T'
    : 'Y';
  return `Brown Dwarf ${spectralPrefix}${orbitPosition}`;
}
