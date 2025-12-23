/**
 * Planet Generator
 *
 * Procedural generation system for creating secondary planets using 2D6 dice rolls.
 * Generates gas giants, ice giants, asteroid belts, and planetoid belts.
 */

import { roll2D6, type DiceRollResult } from '@/lib/dice';
import { PlanetType, BeltDensity, type PlanetData, type PlanetDiceRolls } from '@/models/world/planet';
import { GenerationMethod } from '@/models/common/types';
import { generatePlanetId } from '@/lib/db/queries/planetQueries';

// =====================
// 2D6 Tables
// =====================

/**
 * Planet Type Table (2D6)
 *
 * Distribution:
 * - 2-3: Belts (asteroid/planetoid) (8% chance)
 * - 4-5, 11: Ice Giants (25% chance)
 * - 6-10, 12: Gas Giants (67% chance)
 */
export const PLANET_TYPE_TABLE: Record<number, PlanetType> = {
  2: PlanetType.ASTEROID_BELT,
  3: PlanetType.PLANETOID_BELT,
  4: PlanetType.ICE_GIANT,
  5: PlanetType.ICE_GIANT,
  6: PlanetType.GAS_GIANT,
  7: PlanetType.GAS_GIANT,
  8: PlanetType.GAS_GIANT,
  9: PlanetType.GAS_GIANT,
  10: PlanetType.GAS_GIANT,
  11: PlanetType.ICE_GIANT,
  12: PlanetType.GAS_GIANT,
};

/**
 * Gas Giant Size Table (2D6)
 *
 * Sizes in Jupiter masses (JM), where 1 JM = Jupiter
 * Jupiter: 1.0 JM, 142,984 km diameter
 * Saturn: 0.3 JM, 120,536 km diameter
 * Super-Jupiters: Up to 13 JM (brown dwarf boundary)
 */
export const GAS_GIANT_SIZE_TABLE: Record<
  number,
  { min: number; max: number; label: string; description: string }
> = {
  2: {
    min: 0.1,
    max: 0.3,
    label: 'Small',
    description: 'Saturn-sized (0.1-0.3 JM)',
  },
  3: {
    min: 0.3,
    max: 0.5,
    label: 'Medium-Small',
    description: 'Sub-Jovian (0.3-0.5 JM)',
  },
  4: {
    min: 0.5,
    max: 0.7,
    label: 'Below Average',
    description: 'Below Jovian (0.5-0.7 JM)',
  },
  5: {
    min: 0.7,
    max: 0.9,
    label: 'Average',
    description: 'Near-Jovian (0.7-0.9 JM)',
  },
  6: {
    min: 0.9,
    max: 1.1,
    label: 'Jupiter-sized',
    description: 'Jupiter-sized (0.9-1.1 JM)',
  },
  7: {
    min: 1.1,
    max: 1.5,
    label: 'Large',
    description: 'Super-Jovian (1.1-1.5 JM)',
  },
  8: {
    min: 1.5,
    max: 2.0,
    label: 'Very Large',
    description: 'Large Giant (1.5-2.0 JM)',
  },
  9: {
    min: 2.0,
    max: 3.0,
    label: 'Huge',
    description: 'Huge Giant (2.0-3.0 JM)',
  },
  10: {
    min: 3.0,
    max: 5.0,
    label: 'Massive',
    description: 'Massive Giant (3.0-5.0 JM)',
  },
  11: {
    min: 5.0,
    max: 8.0,
    label: 'Super-Massive',
    description: 'Super-Massive (5.0-8.0 JM)',
  },
  12: {
    min: 8.0,
    max: 13.0,
    label: 'Sub-Brown Dwarf',
    description: 'Near brown dwarf limit (8.0-13.0 JM)',
  },
};

/**
 * Ice Giant Size Table (2D6)
 *
 * Sizes in Jupiter masses (JM)
 * Neptune: 0.054 JM, 49,528 km diameter
 * Uranus: 0.046 JM, 51,118 km diameter
 */
export const ICE_GIANT_SIZE_TABLE: Record<
  number,
  { min: number; max: number; label: string; description: string }
> = {
  2: {
    min: 0.02,
    max: 0.03,
    label: 'Tiny',
    description: 'Tiny ice giant (0.02-0.03 JM)',
  },
  3: {
    min: 0.03,
    max: 0.04,
    label: 'Very Small',
    description: 'Very small (0.03-0.04 JM)',
  },
  4: {
    min: 0.04,
    max: 0.045,
    label: 'Small',
    description: 'Uranus-sized (0.04-0.045 JM)',
  },
  5: {
    min: 0.045,
    max: 0.05,
    label: 'Below Average',
    description: 'Below average (0.045-0.05 JM)',
  },
  6: {
    min: 0.05,
    max: 0.055,
    label: 'Average',
    description: 'Neptune-sized (0.05-0.055 JM)',
  },
  7: {
    min: 0.055,
    max: 0.06,
    label: 'Above Average',
    description: 'Above average (0.055-0.06 JM)',
  },
  8: {
    min: 0.06,
    max: 0.07,
    label: 'Large',
    description: 'Large ice giant (0.06-0.07 JM)',
  },
  9: {
    min: 0.07,
    max: 0.08,
    label: 'Very Large',
    description: 'Very large (0.07-0.08 JM)',
  },
  10: {
    min: 0.08,
    max: 0.09,
    label: 'Huge',
    description: 'Huge ice giant (0.08-0.09 JM)',
  },
  11: {
    min: 0.09,
    max: 0.1,
    label: 'Massive',
    description: 'Massive ice giant (0.09-0.1 JM)',
  },
  12: {
    min: 0.1,
    max: 0.15,
    label: 'Super-Massive',
    description: 'Super ice giant (0.1-0.15 JM)',
  },
};

/**
 * Belt Density Table (2D6)
 *
 * Determines the density of asteroid or planetoid belts
 */
export const BELT_DENSITY_TABLE: Record<number, BeltDensity> = {
  2: BeltDensity.SPARSE,
  3: BeltDensity.SPARSE,
  4: BeltDensity.SPARSE,
  5: BeltDensity.MODERATE,
  6: BeltDensity.MODERATE,
  7: BeltDensity.MODERATE,
  8: BeltDensity.MODERATE,
  9: BeltDensity.MODERATE,
  10: BeltDensity.DENSE,
  11: BeltDensity.DENSE,
  12: BeltDensity.DENSE,
};

// =====================
// Generation Options
// =====================

export interface GeneratePlanetOptions {
  starSystemId: string;
  orbitPosition: number; // Orbit number from star (1 = innermost)
  planetName?: string;
  advantage?: number;
  disadvantage?: number;
}

// =====================
// Generator Functions
// =====================

/**
 * Generate a complete planet with all properties
 *
 * @param options - Generation options including starSystemId and orbitPosition
 * @returns Complete PlanetData object
 */
export function generatePlanet(options: GeneratePlanetOptions): PlanetData {
  const {
    starSystemId,
    orbitPosition,
    planetName,
    advantage = 0,
    disadvantage = 0,
  } = options;

  // Roll planet type
  const typeResult: DiceRollResult = roll2D6(advantage, disadvantage);
  const planetType = PLANET_TYPE_TABLE[typeResult.total];

  let size: number | undefined;
  let mass: number | undefined;
  let beltWidth: number | undefined;
  let density: BeltDensity | undefined;
  const diceRolls: Partial<PlanetDiceRolls> = { typeRoll: typeResult.total };

  // Type-specific generation
  if (planetType === PlanetType.GAS_GIANT) {
    const sizeResult: DiceRollResult = roll2D6(advantage, disadvantage);
    const sizeData = GAS_GIANT_SIZE_TABLE[sizeResult.total];
    size = (sizeData.min + sizeData.max) / 2; // Use average
    mass = size; // For gas giants, mass ≈ size
    diceRolls.sizeRoll = sizeResult.total;
  } else if (planetType === PlanetType.ICE_GIANT) {
    const sizeResult: DiceRollResult = roll2D6(advantage, disadvantage);
    const sizeData = ICE_GIANT_SIZE_TABLE[sizeResult.total];
    size = (sizeData.min + sizeData.max) / 2;
    mass = size; // For ice giants, mass ≈ size
    diceRolls.sizeRoll = sizeResult.total;
  } else {
    // Asteroid or Planetoid Belt
    const densityResult: DiceRollResult = roll2D6(advantage, disadvantage);
    density = BELT_DENSITY_TABLE[densityResult.total];
    beltWidth = planetType === PlanetType.ASTEROID_BELT ? 0.5 : 1.0; // AU
    diceRolls.densityRoll = densityResult.total;
  }

  // Generate default name if not provided
  const name = planetName || generatePlanetName(orbitPosition, planetType);

  return {
    id: generatePlanetId(),
    name,
    starSystemId,
    orbitPosition,
    planetType,
    size,
    mass,
    beltWidth,
    density,
    generationMethod: GenerationMethod.PROCEDURAL,
    diceRolls,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'user', // TODO: Replace with actual user ID when auth is implemented
  };
}

/**
 * Generate a default planet name based on orbit position
 *
 * @param orbitPosition - The orbital position (1, 2, 3, etc.)
 * @param planetType - Type of planet for naming variation
 * @returns Generated planet name (e.g., "Planet I", "Gas Giant II", "Asteroid Belt A")
 */
export function generatePlanetName(
  orbitPosition: number,
  planetType: PlanetType
): string {
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
  const numeral = romanNumerals[orbitPosition - 1] || String(orbitPosition);

  switch (planetType) {
    case PlanetType.GAS_GIANT:
      return `Gas Giant ${numeral}`;
    case PlanetType.ICE_GIANT:
      return `Ice Giant ${numeral}`;
    case PlanetType.ASTEROID_BELT:
      return `Asteroid Belt ${numeral}`;
    case PlanetType.PLANETOID_BELT:
      return `Planetoid Belt ${numeral}`;
    default:
      return `Planet ${numeral}`;
  }
}

/**
 * Get the planet type from a given roll
 *
 * @param roll - 2D6 roll result (2-12)
 * @returns PlanetType
 */
export function getPlanetTypeFromRoll(roll: number): PlanetType {
  return PLANET_TYPE_TABLE[roll];
}

/**
 * Get the gas giant size entry from the table for a given roll
 *
 * @param roll - 2D6 roll result (2-12)
 * @returns Size table entry
 */
export function getGasGiantSizeFromRoll(
  roll: number
): { min: number; max: number; label: string; description: string } {
  return GAS_GIANT_SIZE_TABLE[roll];
}

/**
 * Get the ice giant size entry from the table for a given roll
 *
 * @param roll - 2D6 roll result (2-12)
 * @returns Size table entry
 */
export function getIceGiantSizeFromRoll(
  roll: number
): { min: number; max: number; label: string; description: string } {
  return ICE_GIANT_SIZE_TABLE[roll];
}

/**
 * Get the belt density from a given roll
 *
 * @param roll - 2D6 roll result (2-12)
 * @returns BeltDensity
 */
export function getBeltDensityFromRoll(roll: number): BeltDensity {
  return BELT_DENSITY_TABLE[roll];
}

// =====================
// Validation
// =====================

/**
 * Validate planet data for correctness
 *
 * @param planetData - PlanetData to validate
 * @returns Validation result with errors if any
 */
export function validatePlanetData(planetData: PlanetData): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Required fields
  if (!planetData.name || planetData.name.trim() === '') {
    errors.push('Planet name is required');
  }

  if (!planetData.starSystemId) {
    errors.push('Star system ID is required');
  }

  if (
    planetData.orbitPosition <= 0 ||
    planetData.orbitPosition > 20
  ) {
    errors.push('Orbit position must be between 1 and 20');
  }

  // Type-specific validation
  const isGiant =
    planetData.planetType === PlanetType.GAS_GIANT ||
    planetData.planetType === PlanetType.ICE_GIANT;
  const isBelt =
    planetData.planetType === PlanetType.ASTEROID_BELT ||
    planetData.planetType === PlanetType.PLANETOID_BELT;

  if (isGiant) {
    // Giants should have size and mass
    if (!planetData.size || planetData.size <= 0 || planetData.size > 15) {
      errors.push('Giant planet size must be between 0 and 15 Jupiter masses');
    }

    if (!planetData.mass || planetData.mass <= 0 || planetData.mass > 15) {
      errors.push('Giant planet mass must be between 0 and 15 Jupiter masses');
    }

    // Giants should NOT have belt properties
    if (planetData.beltWidth !== undefined || planetData.density !== undefined) {
      errors.push('Giant planets should not have belt properties');
    }
  }

  if (isBelt) {
    // Belts should have density and width
    if (!planetData.density) {
      errors.push('Belt must have a density value');
    }

    if (!planetData.beltWidth || planetData.beltWidth <= 0) {
      errors.push('Belt width must be greater than 0 AU');
    }

    // Belts should NOT have size/mass
    if (planetData.size !== undefined || planetData.mass !== undefined) {
      errors.push('Belts should not have size or mass properties');
    }
  }

  // Dice rolls validation (if present)
  if (planetData.diceRolls) {
    if (
      planetData.diceRolls.typeRoll &&
      (planetData.diceRolls.typeRoll < 2 || planetData.diceRolls.typeRoll > 12)
    ) {
      errors.push('Type roll must be between 2 and 12');
    }

    if (
      planetData.diceRolls.sizeRoll &&
      (planetData.diceRolls.sizeRoll < 2 || planetData.diceRolls.sizeRoll > 12)
    ) {
      errors.push('Size roll must be between 2 and 12');
    }

    if (
      planetData.diceRolls.densityRoll &&
      (planetData.diceRolls.densityRoll < 2 ||
        planetData.diceRolls.densityRoll > 12)
    ) {
      errors.push('Density roll must be between 2 and 12');
    }
  }

  return { isValid: errors.length === 0, errors };
}

// =====================
// Disk Generation Re-exports
// =====================

/**
 * Re-export disk generation functions and tables for unified import
 * Usage: import { generateDisk, DISK_MASS_TABLE } from '@/lib/generators/planetGenerator';
 */
export * from './diskGenerator';
export * from './diskTables';
