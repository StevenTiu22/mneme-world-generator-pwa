import type { StellarClass } from '@/models/stellar/types/enums';

/**
 * Companion Star Table (Mneme PDF page 14)
 * Maps stellar class to 2D6 target number for companion star existence
 * Rolling 12 allows additional companion roll (max 3 companions)
 */
export const COMPANION_STAR_TABLE: Record<StellarClass, number> = {
  O: 4,
  B: 5,
  A: 6,
  F: 7,
  G: 8,
  K: 9,
  M: 10,
};

/**
 * Stellar class hierarchy (hottest to coolest)
 * Used for validating companions are smaller than primary
 */
export const STELLAR_CLASS_ORDER: StellarClass[] = ['O', 'B', 'A', 'F', 'G', 'K', 'M'];

/**
 * Get all stellar classes that are valid for a companion given primary class
 * Companions must be later in sequence (cooler) than primary
 */
export function getValidCompanionClasses(primaryClass: StellarClass): StellarClass[] {
  const primaryIndex = STELLAR_CLASS_ORDER.indexOf(primaryClass);
  if (primaryIndex === -1) {
    throw new Error(`Invalid stellar class: ${primaryClass}`);
  }

  // Return all classes from primary onwards (including same class)
  return STELLAR_CLASS_ORDER.slice(primaryIndex);
}

/**
 * Check if a companion class/grade is smaller than primary
 * @param companionClass - Companion stellar class
 * @param companionGrade - Companion stellar grade (0-9)
 * @param primaryClass - Primary stellar class
 * @param primaryGrade - Primary stellar grade (0-9)
 * @returns true if companion is smaller (valid)
 */
export function isCompanionSmallerThanPrimary(
  companionClass: StellarClass,
  companionGrade: number,
  primaryClass: StellarClass,
  primaryGrade: number
): boolean {
  const primaryIndex = STELLAR_CLASS_ORDER.indexOf(primaryClass);
  const companionIndex = STELLAR_CLASS_ORDER.indexOf(companionClass);

  if (primaryIndex === -1 || companionIndex === -1) {
    return false;
  }

  // Companion must be later in sequence (higher index = cooler/smaller)
  if (companionIndex > primaryIndex) {
    return true;
  }

  // If same class, companion grade must be higher (dimmer)
  if (companionIndex === primaryIndex && companionGrade > primaryGrade) {
    return true;
  }

  return false;
}

/**
 * Orbital Distance Ranges (in AU) based on 3D6 roll
 * Mneme PDF page 15 - Orbit Table
 *
 * These values are based on stellar class and represent typical orbital separations
 * for companion stars in binary/multiple systems
 */
export interface OrbitRange {
  min3D6: number;  // Minimum 3D6 roll
  max3D6: number;  // Maximum 3D6 roll
  minAU: number;   // Minimum orbital distance in AU
  maxAU: number;   // Maximum orbital distance in AU
}

/**
 * Orbit Distance Table by Stellar Class
 * Maps 3D6 results to orbital distances in AU
 */
export const ORBIT_DISTANCE_TABLE: Record<StellarClass, OrbitRange[]> = {
  O: [
    { min3D6: 3, max3D6: 6, minAU: 0.1, maxAU: 1 },
    { min3D6: 7, max3D6: 10, minAU: 1, maxAU: 10 },
    { min3D6: 11, max3D6: 14, minAU: 10, maxAU: 100 },
    { min3D6: 15, max3D6: 18, minAU: 100, maxAU: 1000 },
  ],
  B: [
    { min3D6: 3, max3D6: 6, minAU: 0.1, maxAU: 1 },
    { min3D6: 7, max3D6: 10, minAU: 1, maxAU: 10 },
    { min3D6: 11, max3D6: 14, minAU: 10, maxAU: 100 },
    { min3D6: 15, max3D6: 18, minAU: 100, maxAU: 1000 },
  ],
  A: [
    { min3D6: 3, max3D6: 6, minAU: 0.1, maxAU: 1 },
    { min3D6: 7, max3D6: 10, minAU: 1, maxAU: 10 },
    { min3D6: 11, max3D6: 14, minAU: 10, maxAU: 100 },
    { min3D6: 15, max3D6: 18, minAU: 100, maxAU: 1000 },
  ],
  F: [
    { min3D6: 3, max3D6: 6, minAU: 0.05, maxAU: 0.5 },
    { min3D6: 7, max3D6: 10, minAU: 0.5, maxAU: 5 },
    { min3D6: 11, max3D6: 14, minAU: 5, maxAU: 50 },
    { min3D6: 15, max3D6: 18, minAU: 50, maxAU: 500 },
  ],
  G: [
    { min3D6: 3, max3D6: 6, minAU: 0.05, maxAU: 0.5 },
    { min3D6: 7, max3D6: 10, minAU: 0.5, maxAU: 5 },
    { min3D6: 11, max3D6: 14, minAU: 5, maxAU: 50 },
    { min3D6: 15, max3D6: 18, minAU: 50, maxAU: 500 },
  ],
  K: [
    { min3D6: 3, max3D6: 6, minAU: 0.01, maxAU: 0.1 },
    { min3D6: 7, max3D6: 10, minAU: 0.1, maxAU: 1 },
    { min3D6: 11, max3D6: 14, minAU: 1, maxAU: 10 },
    { min3D6: 15, max3D6: 18, minAU: 10, maxAU: 100 },
  ],
  M: [
    { min3D6: 3, max3D6: 6, minAU: 0.01, maxAU: 0.1 },
    { min3D6: 7, max3D6: 10, minAU: 0.1, maxAU: 1 },
    { min3D6: 11, max3D6: 14, minAU: 1, maxAU: 10 },
    { min3D6: 15, max3D6: 18, minAU: 10, maxAU: 100 },
  ],
};

/**
 * Get orbital distance in AU based on 3D6 roll and primary stellar class
 * @param roll3D6 - Result of 3D6 roll (3-18)
 * @param primaryClass - Primary star's stellar class
 * @returns Orbital distance in AU
 */
export function getOrbitalDistance(roll3D6: number, primaryClass: StellarClass): number {
  const ranges = ORBIT_DISTANCE_TABLE[primaryClass];

  // Find the matching range
  const range = ranges.find(r => roll3D6 >= r.min3D6 && roll3D6 <= r.max3D6);

  if (!range) {
    throw new Error(`Invalid 3D6 roll: ${roll3D6} for class ${primaryClass}`);
  }

  // Generate random distance within range
  const logMin = Math.log10(range.minAU);
  const logMax = Math.log10(range.maxAU);
  const logDistance = logMin + Math.random() * (logMax - logMin);

  return Math.pow(10, logDistance);
}
