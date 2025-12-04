/**
 * Moon Generator
 *
 * Procedural generation system for creating moons using 2D6 dice rolls.
 * Generates moon properties including type, size, mass, and gravity.
 */

import { roll2D6, type DiceRollResult } from '@/lib/dice';
import { MoonType, type MoonData } from '@/models/world/moon';
import { GenerationMethod } from '@/models/common/types';

// =====================
// 2D6 Tables
// =====================

/**
 * Moon Type Table (2D6)
 *
 * Distribution:
 * - 2-6: Minor moons and captured asteroids (42% chance)
 * - 7-12: Major moons (58% chance)
 */
export const MOON_TYPE_TABLE: Record<number, MoonType> = {
  2: MoonType.CAPTURED_ASTEROID,
  3: MoonType.MINOR,
  4: MoonType.MINOR,
  5: MoonType.MINOR,
  6: MoonType.MINOR,
  7: MoonType.MAJOR,
  8: MoonType.MAJOR,
  9: MoonType.MAJOR,
  10: MoonType.MAJOR,
  11: MoonType.MAJOR,
  12: MoonType.MAJOR,
};

/**
 * Moon Size Table (2D6)
 *
 * Sizes in lunar masses (LM), where 1 LM = Earth's Moon
 * Luna: 1.0 LM, 3,474 km diameter, 0.165 G
 * Titan: ~1.8 LM, 5,150 km diameter
 * Ganymede: ~2.0 LM, 5,268 km diameter
 */
export const MOON_SIZE_TABLE: Record<
  number,
  { min: number; max: number; label: string; description: string }
> = {
  2: {
    min: 0.01,
    max: 0.05,
    label: 'Tiny',
    description: 'Asteroid-sized (50-250 km diameter)',
  },
  3: {
    min: 0.05,
    max: 0.1,
    label: 'Very Small',
    description: 'Small captured body (250-500 km)',
  },
  4: {
    min: 0.1,
    max: 0.2,
    label: 'Small',
    description: 'Small moon (500-800 km)',
  },
  5: {
    min: 0.2,
    max: 0.4,
    label: 'Below Average',
    description: 'Medium-small moon (800-1,200 km)',
  },
  6: {
    min: 0.4,
    max: 0.6,
    label: 'Average',
    description: 'Medium moon (1,200-1,800 km)',
  },
  7: {
    min: 0.6,
    max: 0.8,
    label: 'Above Average',
    description: 'Medium-large moon (1,800-2,400 km)',
  },
  8: {
    min: 0.8,
    max: 1.0,
    label: 'Large',
    description: 'Large moon, Luna-sized (2,400-3,500 km)',
  },
  9: {
    min: 1.0,
    max: 1.3,
    label: 'Very Large',
    description: 'Very large moon (3,500-4,200 km)',
  },
  10: {
    min: 1.3,
    max: 1.6,
    label: 'Huge',
    description: 'Huge moon (4,200-4,800 km)',
  },
  11: {
    min: 1.6,
    max: 1.9,
    label: 'Titan-sized',
    description: 'Titan-sized moon (4,800-5,200 km)',
  },
  12: {
    min: 1.9,
    max: 2.2,
    label: 'Ganymede-sized',
    description: 'Ganymede-sized moon (5,200-5,600 km)',
  },
};

// =====================
// Generation Options
// =====================

export interface GenerateMoonOptions {
  worldId: string;
  starSystemId: string;
  orbitPosition?: number; // Moon number (1st, 2nd, 3rd moon, etc.)
  moonName?: string;
  advantage?: number; // Number of advantage dice (roll extra, drop lowest)
  disadvantage?: number; // Number of disadvantage dice (roll extra, drop highest)
}

// =====================
// Generator Functions
// =====================

/**
 * Generate a complete moon with all properties
 *
 * @param options - Generation options including worldId and starSystemId
 * @returns Complete MoonData object
 */
export function generateMoon(options: GenerateMoonOptions): MoonData {
  const {
    worldId,
    starSystemId,
    orbitPosition,
    moonName,
    advantage = 0,
    disadvantage = 0,
  } = options;

  // Roll moon type
  const typeResult: DiceRollResult = roll2D6(advantage, disadvantage);
  const moonType = MOON_TYPE_TABLE[typeResult.total];

  // Roll size
  const sizeResult: DiceRollResult = roll2D6(advantage, disadvantage);
  const sizeData = MOON_SIZE_TABLE[sizeResult.total];
  const size = (sizeData.min + sizeData.max) / 2; // Use average

  // Mass equals size (simplified assumption for moons)
  const mass = size;

  // Calculate gravity (Luna has 0.165g at 1 LM)
  // Using simplified formula: g ≈ 0.165 * (mass in LM)
  const gravity = Math.round(size * 0.165 * 1000) / 1000; // Round to 3 decimals

  // Generate default name if not provided
  const name =
    moonName || generateMoonName(orbitPosition || 1, moonType);

  return {
    name,
    worldId,
    starSystemId,
    orbitPosition,
    size,
    mass,
    gravity,
    moonType,
    generationMethod: GenerationMethod.PROCEDURAL,
    diceRolls: {
      typeRoll: typeResult.total,
      sizeRoll: sizeResult.total,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'user', // TODO: Replace with actual user ID when auth is implemented
  };
}

/**
 * Generate a default moon name based on orbit position
 *
 * @param moonNumber - The orbital position (1, 2, 3, etc.)
 * @param moonType - Type of moon for naming variation
 * @returns Generated moon name (e.g., "Moon I", "Moon II", "Captured Asteroid A")
 */
export function generateMoonName(
  moonNumber: number,
  moonType: MoonType
): string {
  if (moonType === MoonType.CAPTURED_ASTEROID) {
    // Use letters for captured asteroids
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return `Captured Asteroid ${letters[moonNumber - 1] || moonNumber}`;
  }

  // Use Roman numerals for regular moons
  const romanNumerals = [
    'I',
    'II',
    'III',
    'IV',
    'V',
    'VI',
    'VII',
    'VIII',
    'IX',
    'X',
    'XI',
    'XII',
  ];
  return `Moon ${romanNumerals[moonNumber - 1] || moonNumber}`;
}

/**
 * Generate a named moon based on a world name
 *
 * @param worldName - Name of the parent world
 * @param moonNumber - The orbital position
 * @param moonType - Type of moon
 * @returns Generated moon name (e.g., "Terra I", "Terra II")
 */
export function generateNamedMoon(
  worldName: string,
  moonNumber: number,
  moonType: MoonType
): string {
  if (moonType === MoonType.CAPTURED_ASTEROID) {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return `${worldName} Captured ${letters[moonNumber - 1] || moonNumber}`;
  }

  const romanNumerals = [
    'I',
    'II',
    'III',
    'IV',
    'V',
    'VI',
    'VII',
    'VIII',
    'IX',
    'X',
  ];
  return `${worldName} ${romanNumerals[moonNumber - 1] || moonNumber}`;
}

/**
 * Get the size entry from the table for a given roll
 *
 * @param roll - 2D6 roll result (2-12)
 * @returns Size table entry
 */
export function getSizeFromRoll(
  roll: number
): { min: number; max: number; label: string; description: string } {
  return MOON_SIZE_TABLE[roll];
}

/**
 * Get the moon type from a given roll
 *
 * @param roll - 2D6 roll result (2-12)
 * @returns MoonType
 */
export function getMoonTypeFromRoll(roll: number): MoonType {
  return MOON_TYPE_TABLE[roll];
}

// =====================
// Validation
// =====================

/**
 * Validate moon data for correctness
 *
 * @param moonData - MoonData to validate
 * @returns Validation result with errors if any
 */
export function validateMoonData(moonData: MoonData): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Required fields
  if (!moonData.name || moonData.name.trim() === '') {
    errors.push('Moon name is required');
  }

  if (!moonData.worldId) {
    errors.push('Parent world ID is required');
  }

  if (!moonData.starSystemId) {
    errors.push('Star system ID is required');
  }

  // Physical properties validation
  if (moonData.size <= 0 || moonData.size > 5) {
    errors.push('Moon size must be between 0 and 5 lunar masses');
  }

  if (moonData.mass <= 0 || moonData.mass > 5) {
    errors.push('Moon mass must be between 0 and 5 lunar masses');
  }

  if (moonData.gravity < 0 || moonData.gravity > 1) {
    errors.push('Moon gravity must be between 0 and 1 G');
  }

  // Dice rolls validation (if present)
  if (moonData.diceRolls) {
    if (
      moonData.diceRolls.typeRoll &&
      (moonData.diceRolls.typeRoll < 2 || moonData.diceRolls.typeRoll > 12)
    ) {
      errors.push('Type roll must be between 2 and 12');
    }

    if (
      moonData.diceRolls.sizeRoll &&
      (moonData.diceRolls.sizeRoll < 2 || moonData.diceRolls.sizeRoll > 12)
    ) {
      errors.push('Size roll must be between 2 and 12');
    }
  }

  return { isValid: errors.length === 0, errors };
}
