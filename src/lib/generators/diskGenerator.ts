/**
 * Disk Generator
 *
 * Procedural generation system for creating circumstellar disks using 2D6 dice rolls.
 * Generates accretion disks and protoplanetary disks with mass, zone placement, and width.
 */

import { roll2D6, type DiceRollResult } from '@/lib/dice';
import {
  PlanetType,
  DiskType,
  DiskZone,
  type PlanetData,
} from '@/models/world/planet';
import type { StellarZones } from '@/models/stellar/types/interface';
import { GenerationMethod } from '@/models/common/types';
import {
  getDiskMassFromRoll,
  getDiskZoneFromRoll,
  getDiskTypeFromRoll,
} from './diskTables';

// =====================
// Generation Options
// =====================

export interface GenerateDiskOptions {
  starSystemId: string;
  stellarZones: StellarZones; // Required for calculating disk width
  diskName?: string;
  advantage?: number;
  disadvantage?: number;
}

// =====================
// Generator Functions
// =====================

/**
 * Generate a complete circumstellar disk with all properties
 *
 * @param options - Generation options including starSystemId and stellarZones
 * @returns Complete PlanetData object representing a circumstellar disk
 */
export function generateDisk(options: GenerateDiskOptions): PlanetData {
  const {
    starSystemId,
    stellarZones,
    diskName,
    advantage = 0,
    disadvantage = 0,
  } = options;

  // Roll disk mass (2D6)
  const massResult: DiceRollResult = roll2D6(advantage, disadvantage);
  const massEntry = getDiskMassFromRoll(massResult.total);

  // Roll zone placement (2D6)
  const zoneResult: DiceRollResult = roll2D6(advantage, disadvantage);
  const diskZone = getDiskZoneFromRoll(zoneResult.total);

  // Roll disk type (2D6)
  const typeResult: DiceRollResult = roll2D6(advantage, disadvantage);
  const diskType = getDiskTypeFromRoll(typeResult.total);

  // Calculate disk width from stellar zones
  const { inner, outer, midpoint } = calculateDiskWidth(diskZone, stellarZones);

  // Generate default name if not provided
  const name = diskName || generateDiskName(diskType, diskZone);

  // Store dice rolls
  const diceRolls = {
    massRoll: massResult.total,
    zoneRoll: zoneResult.total,
    typeRoll: typeResult.total,
  };

  return {
    name,
    starSystemId,
    orbitPosition: midpoint, // Use zone midpoint for orbit position
    planetType: PlanetType.CIRCUMSTELLAR_DISK,

    // Disk-specific properties
    diskType,
    diskZone,
    diskMass: massEntry.mass,
    diskMassUnit: massEntry.unit,
    diskInnerRadius: inner,
    diskOuterRadius: outer,

    // No size/mass in Jupiter masses (disks use diskMass instead)
    size: undefined,
    mass: undefined,

    // No belt properties
    beltWidth: undefined,
    density: undefined,

    generationMethod: GenerationMethod.PROCEDURAL,
    diceRolls,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'user', // TODO: Replace with actual user ID when auth is implemented
  };
}

/**
 * Calculate disk width from stellar zones
 *
 * Maps a DiskZone to actual AU boundaries based on the star's orbital zones
 *
 * @param zone - The disk zone (INFERNAL, HOT, etc.)
 * @param stellarZones - The stellar zones for the parent star
 * @returns Object with inner boundary, outer boundary, and midpoint in AU
 */
export function calculateDiskWidth(
  zone: DiskZone,
  stellarZones: StellarZones
): { inner: number; outer: number; midpoint: number } {
  let inner: number;
  let outer: number;

  switch (zone) {
    case DiskZone.INFERNAL:
      inner = stellarZones.infernal.innerBoundary;
      outer = stellarZones.infernal.outerBoundary;
      break;

    case DiskZone.HOT:
      inner = stellarZones.hot.innerBoundary;
      outer = stellarZones.hot.outerBoundary;
      break;

    case DiskZone.HABITABLE_INNER:
      // Inner half of habitable zone
      inner = stellarZones.conservativeHabitable.innerBoundary;
      outer =
        (stellarZones.conservativeHabitable.innerBoundary +
          stellarZones.conservativeHabitable.outerBoundary) /
        2;
      break;

    case DiskZone.HABITABLE_OUTER:
      // Outer half of habitable zone
      inner =
        (stellarZones.conservativeHabitable.innerBoundary +
          stellarZones.conservativeHabitable.outerBoundary) /
        2;
      outer = stellarZones.conservativeHabitable.outerBoundary;
      break;

    case DiskZone.COLD:
      inner = stellarZones.cold.innerBoundary;
      outer = stellarZones.cold.outerBoundary;
      break;

    case DiskZone.OUTER:
      inner = stellarZones.outer.innerBoundary;
      outer = stellarZones.outer.outerBoundary;
      break;

    default:
      throw new Error(`Invalid disk zone: ${zone}`);
  }

  const midpoint = (inner + outer) / 2;

  return { inner, outer, midpoint };
}

/**
 * Generate a default disk name
 *
 * @param diskType - Type of disk (ACCRETION or PROTOPLANETARY)
 * @param diskZone - Zone where disk is located
 * @returns Generated disk name
 */
export function generateDiskName(diskType: DiskType, diskZone: DiskZone): string {
  const typePrefix =
    diskType === DiskType.ACCRETION ? 'Accretion' : 'Protoplanetary';

  const zoneSuffix = (() => {
    switch (diskZone) {
      case DiskZone.INFERNAL:
        return 'Infernal';
      case DiskZone.HOT:
        return 'Inner';
      case DiskZone.HABITABLE_INNER:
        return 'Habitable-Inner';
      case DiskZone.HABITABLE_OUTER:
        return 'Habitable-Outer';
      case DiskZone.COLD:
        return 'Cold';
      case DiskZone.OUTER:
        return 'Outer';
      default:
        return 'Unknown';
    }
  })();

  return `${typePrefix} Disk (${zoneSuffix})`;
}

/**
 * Validate disk data for correctness
 *
 * @param diskData - PlanetData to validate (should be a disk)
 * @returns Validation result with errors if any
 */
export function validateDiskData(diskData: PlanetData): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Required fields
  if (!diskData.name || diskData.name.trim() === '') {
    errors.push('Disk name is required');
  }

  if (!diskData.starSystemId) {
    errors.push('Star system ID is required');
  }

  if (diskData.planetType !== PlanetType.CIRCUMSTELLAR_DISK) {
    errors.push('Planet type must be CIRCUMSTELLAR_DISK');
  }

  // Disk-specific validation
  if (!diskData.diskType) {
    errors.push('Disk type is required (ACCRETION or PROTOPLANETARY)');
  }

  if (!diskData.diskZone) {
    errors.push('Disk zone is required');
  }

  if (diskData.diskMass === undefined || diskData.diskMass <= 0) {
    errors.push('Disk mass must be greater than 0');
  }

  if (!diskData.diskMassUnit) {
    errors.push('Disk mass unit is required (CM, LM, EM, or JM)');
  } else if (!['CM', 'LM', 'EM', 'JM'].includes(diskData.diskMassUnit)) {
    errors.push('Disk mass unit must be CM, LM, EM, or JM');
  }

  if (
    diskData.diskInnerRadius === undefined ||
    diskData.diskInnerRadius <= 0
  ) {
    errors.push('Disk inner radius must be greater than 0 AU');
  }

  if (
    diskData.diskOuterRadius === undefined ||
    diskData.diskOuterRadius <= 0
  ) {
    errors.push('Disk outer radius must be greater than 0 AU');
  }

  if (
    diskData.diskInnerRadius !== undefined &&
    diskData.diskOuterRadius !== undefined &&
    diskData.diskInnerRadius >= diskData.diskOuterRadius
  ) {
    errors.push('Disk inner radius must be less than outer radius');
  }

  // Orbit position validation (should be between inner and outer radius)
  if (
    diskData.orbitPosition < 0 ||
    diskData.orbitPosition > 100
  ) {
    errors.push('Orbit position must be between 0 and 100 AU');
  }

  // Disks should NOT have size/mass in Jupiter masses
  if (diskData.size !== undefined) {
    errors.push('Disks should not have size property (use diskMass instead)');
  }

  if (diskData.mass !== undefined) {
    errors.push('Disks should not have mass property (use diskMass instead)');
  }

  // Disks should NOT have belt properties
  if (diskData.beltWidth !== undefined || diskData.density !== undefined) {
    errors.push('Disks should not have belt properties');
  }

  // Dice rolls validation (if present)
  if (diskData.diceRolls) {
    const rolls = diskData.diceRolls;

    if (rolls.massRoll && (rolls.massRoll < 2 || rolls.massRoll > 12)) {
      errors.push('Mass roll must be between 2 and 12');
    }

    if (rolls.zoneRoll && (rolls.zoneRoll < 2 || rolls.zoneRoll > 12)) {
      errors.push('Zone roll must be between 2 and 12');
    }

    if (rolls.typeRoll && (rolls.typeRoll < 2 || rolls.typeRoll > 12)) {
      errors.push('Type roll must be between 2 and 12');
    }
  }

  return { isValid: errors.length === 0, errors };
}

// =====================
// Re-export Table Functions
// =====================

export {
  getDiskMassFromRoll,
  getDiskZoneFromRoll,
  getDiskTypeFromRoll,
  DISK_MASS_TABLE,
  DISK_ZONE_TABLE,
  DISK_TYPE_TABLE,
} from './diskTables';
