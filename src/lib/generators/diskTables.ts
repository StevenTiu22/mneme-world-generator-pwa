/**
 * Disk Generation Tables
 *
 * Lookup tables for generating circumstellar disks using 2D6 dice rolls.
 * Based on Mneme World Generator Revisions PDF (Pages 33-35).
 */

import { DiskType, DiskZone } from '@/models/world/planet';

// =====================
// Disk Mass Table
// =====================

/**
 * Disk Mass Table (2D6 or system-based rolls)
 *
 * Mass ranges from Ceres masses (CM) to Jupiter masses (JM)
 *
 * Reference: PDF Page 33 - Planetary Systems Table
 * - CM = Ceres Mass (0.00015 Earth masses, ~9.4×10^20 kg)
 * - LM = Lunar Mass (0.0123 Earth masses, ~7.3×10^22 kg)
 * - EM = Earth Mass (5.97×10^24 kg)
 * - JM = Jupiter Mass (318 Earth masses, ~1.9×10^27 kg)
 */
export const DISK_MASS_TABLE: Record<
  number,
  {
    mass: number;
    unit: 'CM' | 'LM' | 'EM' | 'JM';
    label: string;
    description: string;
  }
> = {
  2: {
    mass: 0.01,
    unit: 'CM',
    label: 'Trace',
    description: 'Very sparse dust (0.01 Ceres masses)',
  },
  3: {
    mass: 0.1,
    unit: 'CM',
    label: 'Sparse',
    description: 'Thin dust disk (0.1 Ceres masses)',
  },
  4: {
    mass: 1,
    unit: 'CM',
    label: 'Light',
    description: 'Ceres-mass of material (1 CM)',
  },
  5: {
    mass: 0.01,
    unit: 'LM',
    label: 'Moderate-Light',
    description: '10 Ceres masses (0.01 Lunar masses)',
  },
  6: {
    mass: 0.1,
    unit: 'LM',
    label: 'Moderate',
    description: 'Sub-lunar disk (0.1 Lunar masses)',
  },
  7: {
    mass: 1,
    unit: 'LM',
    label: 'Substantial',
    description: 'Lunar-mass disk (1 LM)',
  },
  8: {
    mass: 0.01,
    unit: 'EM',
    label: 'Heavy',
    description: '10 Lunar masses (0.01 Earth masses)',
  },
  9: {
    mass: 0.1,
    unit: 'EM',
    label: 'Very Heavy',
    description: 'Sub-Earth disk (0.1 Earth masses)',
  },
  10: {
    mass: 1,
    unit: 'EM',
    label: 'Massive',
    description: 'Earth-mass disk (1 EM)',
  },
  11: {
    mass: 0.1,
    unit: 'JM',
    label: 'Huge',
    description: 'Sub-Jovian disk (0.1 Jupiter masses)',
  },
  12: {
    mass: 3,
    unit: 'JM',
    label: 'Colossal',
    description: 'Massive protoplanetary disk (3 Jupiter masses)',
  },
};

// =====================
// Disk Zone Table
// =====================

/**
 * Disk Zone Placement Table (2D6)
 *
 * Determines which orbital zone the disk occupies
 * Reference: PDF Page 34 - Disk Zone Table
 *
 * Distribution:
 * - 2: Infernal (2.8% chance)
 * - 3-4: Hot (8.3% chance)
 * - 5-6: Habitable Inner (22.2% chance)
 * - 7-8: Habitable Outer (30.6% chance)
 * - 9-10: Cold (22.2% chance)
 * - 11-12: Outer (13.9% chance)
 */
export const DISK_ZONE_TABLE: Record<number, DiskZone> = {
  2: DiskZone.INFERNAL,
  3: DiskZone.HOT,
  4: DiskZone.HOT,
  5: DiskZone.HABITABLE_INNER,
  6: DiskZone.HABITABLE_INNER,
  7: DiskZone.HABITABLE_OUTER,
  8: DiskZone.HABITABLE_OUTER,
  9: DiskZone.COLD,
  10: DiskZone.COLD,
  11: DiskZone.OUTER,
  12: DiskZone.OUTER,
};

// =====================
// Disk Type Table
// =====================

/**
 * Disk Type Table (2D6)
 *
 * Determines whether disk is accreting or protoplanetary
 * Note: This is a design decision as PDF does not specify explicit table
 *
 * Distribution:
 * - 2-6: Accretion Disk (fragmenting material, collapsing inward) - 41.7%
 * - 7-12: Protoplanetary Disk (coalescing material, forming planets) - 58.3%
 *
 * Rationale:
 * - Protoplanetary disks are more common (planet formation is the norm)
 * - Accretion disks represent systems with active infall or fragmentation
 * - Can be overridden in Custom mode if user has different requirements
 */
export const DISK_TYPE_TABLE: Record<number, DiskType> = {
  2: DiskType.ACCRETION,
  3: DiskType.ACCRETION,
  4: DiskType.ACCRETION,
  5: DiskType.ACCRETION,
  6: DiskType.ACCRETION,
  7: DiskType.PROTOPLANETARY,
  8: DiskType.PROTOPLANETARY,
  9: DiskType.PROTOPLANETARY,
  10: DiskType.PROTOPLANETARY,
  11: DiskType.PROTOPLANETARY,
  12: DiskType.PROTOPLANETARY,
};

// =====================
// Helper Functions
// =====================

/**
 * Get disk mass data from a roll
 *
 * @param roll - 2D6 roll result (2-12)
 * @returns Mass table entry with mass, unit, label, and description
 */
export function getDiskMassFromRoll(roll: number): {
  mass: number;
  unit: 'CM' | 'LM' | 'EM' | 'JM';
  label: string;
  description: string;
} {
  if (roll < 2 || roll > 12) {
    throw new Error(`Invalid disk mass roll: ${roll}. Must be between 2 and 12.`);
  }
  return DISK_MASS_TABLE[roll];
}

/**
 * Get disk zone from a roll
 *
 * @param roll - 2D6 roll result (2-12)
 * @returns DiskZone enum value
 */
export function getDiskZoneFromRoll(roll: number): DiskZone {
  if (roll < 2 || roll > 12) {
    throw new Error(`Invalid disk zone roll: ${roll}. Must be between 2 and 12.`);
  }
  return DISK_ZONE_TABLE[roll];
}

/**
 * Get disk type from a roll
 *
 * @param roll - 2D6 roll result (2-12)
 * @returns DiskType enum value (ACCRETION or PROTOPLANETARY)
 */
export function getDiskTypeFromRoll(roll: number): DiskType {
  if (roll < 2 || roll > 12) {
    throw new Error(`Invalid disk type roll: ${roll}. Must be between 2 and 12.`);
  }
  return DISK_TYPE_TABLE[roll];
}

/**
 * Get all possible disk mass entries
 *
 * @returns Array of all disk mass table entries
 */
export function getAllDiskMassEntries(): Array<{
  roll: number;
  mass: number;
  unit: string;
  label: string;
  description: string;
}> {
  return Object.entries(DISK_MASS_TABLE).map(([roll, entry]) => ({
    roll: Number(roll),
    ...entry,
  }));
}

/**
 * Get all possible disk zones with their roll ranges
 *
 * @returns Array of zones with roll ranges
 */
export function getAllDiskZoneEntries(): Array<{
  zone: DiskZone;
  rolls: number[];
  probability: string;
}> {
  const zoneMap = new Map<DiskZone, number[]>();

  // Group rolls by zone
  Object.entries(DISK_ZONE_TABLE).forEach(([roll, zone]) => {
    if (!zoneMap.has(zone)) {
      zoneMap.set(zone, []);
    }
    zoneMap.get(zone)!.push(Number(roll));
  });

  // Calculate probabilities
  const totalOutcomes = 36; // 2D6 has 36 possible outcomes
  const rollProbabilities: Record<number, number> = {
    2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6,
    8: 5, 9: 4, 10: 3, 11: 2, 12: 1,
  };

  return Array.from(zoneMap.entries()).map(([zone, rolls]) => {
    const totalProb = rolls.reduce((sum, roll) => sum + rollProbabilities[roll], 0);
    const percentage = ((totalProb / totalOutcomes) * 100).toFixed(1);
    return {
      zone,
      rolls,
      probability: `${percentage}%`,
    };
  });
}
