/**
 * Stellar Data Constants
 *
 * Reference data for stellar classification properties.
 * This data is used to seed the Dexie.js database and serves as the
 * source of truth for stellar property lookups.
 */

import type { StellarClass, StellarGrade } from '../types/enums';

// =====================
// Star Class Metadata
// =====================

export interface StarClassInfo {
  class: StellarClass;
  color: string;
  description: string;
  temperatureRange: string;
}

export const STAR_CLASS_INFO: Record<StellarClass, StarClassInfo> = {
  O: {
    class: 'O',
    color: 'Blue',
    description: 'Extremely hot and luminous',
    temperatureRange: '≥30,000 K',
  },
  B: {
    class: 'B',
    color: 'Blue-White',
    description: 'Very hot and bright',
    temperatureRange: '10,000-30,000 K',
  },
  A: {
    class: 'A',
    color: 'White',
    description: 'Hot main sequence',
    temperatureRange: '7,500-10,000 K',
  },
  F: {
    class: 'F',
    color: 'Yellow-White',
    description: 'Intermediate temperature',
    temperatureRange: '6,000-7,500 K',
  },
  G: {
    class: 'G',
    color: 'Yellow',
    description: 'Sun-like stars',
    temperatureRange: '5,200-6,000 K',
  },
  K: {
    class: 'K',
    color: 'Orange',
    description: 'Cool main sequence',
    temperatureRange: '3,700-5,200 K',
  },
  M: {
    class: 'M',
    color: 'Red',
    description: 'Cool, dim, and common',
    temperatureRange: '2,400-3,700 K',
  },
} as const;

// =====================
// Stellar Property Lookup Tables
// =====================

/**
 * Stellar Mass by Class and Grade
 * Values in solar masses (M☉)
 * Index corresponds to grade (0-9)
 */
export const STELLAR_MASS: Record<StellarClass, readonly number[]> = {
  O: [128.0, 116.8, 105.6, 94.4, 83.2, 72.0, 60.8, 49.6, 38.4, 27.2],
  B: [16.0, 14.61, 13.22, 11.83, 10.44, 9.05, 7.66, 6.27, 4.88, 3.49],
  A: [2.1, 2.03, 1.96, 1.89, 1.82, 1.75, 1.68, 1.61, 1.54, 1.47],
  F: [1.4, 1.36, 1.33, 1.29, 1.26, 1.22, 1.18, 1.15, 1.11, 1.08],
  G: [1.04, 1.02, 0.99, 0.97, 0.94, 0.92, 0.9, 0.87, 0.85, 0.82],
  K: [0.8, 0.77, 0.73, 0.7, 0.66, 0.63, 0.59, 0.56, 0.52, 0.49],
  M: [0.45, 0.41, 0.38, 0.34, 0.3, 0.27, 0.23, 0.19, 0.15, 0.12],
} as const;

/**
 * Stellar Luminosity by Class and Grade
 * Values in solar luminosities (L☉)
 * Index corresponds to grade (0-9)
 */
export const STELLAR_LUMINOSITY: Record<StellarClass, readonly number[]> = {
  O: [
    3516325, 2071113, 1219884, 718510, 423202, 249266, 146817, 86475, 50934,
    30000,
  ],
  B: [
    14752.9, 7260.98, 3573.66, 1758.86, 865.66, 426.06, 209.69, 103.21, 50.8,
    25.0,
  ],
  A: [23.0, 21.2, 19.4, 17.6, 15.8, 14.0, 12.2, 10.4, 8.6, 5.0],
  F: [4.65, 4.34, 4.02, 3.71, 3.39, 3.08, 2.76, 2.45, 2.13, 1.5],
  G: [1.41, 1.33, 1.25, 1.17, 1.09, 1.01, 0.92, 0.84, 0.76, 0.6],
  K: [0.55, 0.5, 0.45, 0.41, 0.36, 0.31, 0.27, 0.22, 0.17, 0.08],
  M: [0.07, 0.07, 0.06, 0.05, 0.05, 0.04, 0.03, 0.03, 0.02, 0.01],
} as const;

/**
 * Stellar Radius by Class and Grade
 * Values in solar radii (R☉)
 * Index corresponds to grade (0-9)
 *
 * TODO: Verify these values against Mneme documentation
 * Currently placeholder - pending official reference data
 */
export const STELLAR_RADIUS: Record<StellarClass, readonly number[]> = {
  O: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  B: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  A: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  F: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  G: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  K: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  M: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
} as const;

/**
 * Effective Temperature by Class and Grade
 * Values in Kelvin (K)
 * Index corresponds to grade (0-9)
 */
export const STELLAR_TEMPERATURE: Record<StellarClass, readonly number[]> = {
  O: [50000, 47000, 44000, 41000, 38000, 35000, 33000, 31000, 30000, 30000],
  B: [30000, 25000, 22000, 18500, 16000, 15000, 14000, 13000, 11500, 10500],
  A: [10000, 9750, 9500, 9250, 9000, 8750, 8500, 8250, 8000, 7500],
  F: [7500, 7300, 7100, 6900, 6700, 6500, 6400, 6300, 6200, 6000],
  G: [6000, 5900, 5850, 5800, 5750, 5700, 5600, 5500, 5400, 5200],
  K: [5200, 5000, 4800, 4600, 4400, 4200, 4000, 3900, 3800, 3700],
  M: [3700, 3600, 3500, 3400, 3300, 3200, 3100, 3000, 2800, 2400],
} as const;

// =====================
// Habitability Constants
// =====================

/**
 * Habitability zone boundaries based on stellar luminosity
 * Using the conservative habitability zone formula
 */
export const HABITABILITY_ZONE_CONSTANTS = {
  /** Inner boundary coefficient for conservative habitable zone */
  INNER_BOUNDARY_COEFFICIENT: 0.95,
  /** Outer boundary coefficient for conservative habitable zone */
  OUTER_BOUNDARY_COEFFICIENT: 1.37,
  /** Optimistic inner boundary coefficient */
  OPTIMISTIC_INNER_COEFFICIENT: 0.75,
  /** Optimistic outer boundary coefficient */
  OPTIMISTIC_OUTER_COEFFICIENT: 1.77,
  /** Recent Venus distance (AU) */
  RECENT_VENUS: 0.75,
  /** Early Mars distance (AU) */
  EARLY_MARS: 1.77,
} as const;

/**
 * Orbital zone boundaries as multipliers of habitability zone boundaries
 */
export const ORBITAL_ZONE_MULTIPLIERS = {
  /** Infernal zone: 0 to 0.5 × inner HZ boundary */
  INFERNAL_INNER: 0,
  INFERNAL_OUTER: 0.5,
  /** Hot zone: 0.5 × inner HZ to inner HZ boundary */
  HOT_INNER: 0.5,
  HOT_OUTER: 1.0,
  /** Conservative habitable zone is the reference (1.0) */
  /** Cold zone: outer HZ boundary to 2 × outer HZ boundary */
  COLD_INNER: 1.0,
  COLD_OUTER: 2.0,
  /** Outer zone: 2 × outer HZ to frostline */
  OUTER_INNER: 2.0,
  /** Frostline: approximately 4.85 × sqrt(L☉) AU */
  FROSTLINE_COEFFICIENT: 4.85,
} as const;

// =====================
// Database Record Interfaces
// =====================

/**
 * Database record for stellar property lookup
 * Combines class and grade for efficient querying
 */
export interface StellarProperty {
  id: string; // Format: "O0", "G5", "M9", etc.
  stellarClass: StellarClass;
  stellarGrade: StellarGrade;
  mass: number; // Solar masses
  luminosity: number; // Solar luminosities
  radius: number; // Solar radii
  temperature: number; // Kelvin
  color: string;
  description: string;
  temperatureRange: string;
}

// =====================
// Utility Functions
// =====================

/**
 * Get stellar properties for a given class and grade
 */
export function getStellarProperties(
  stellarClass: StellarClass,
  stellarGrade: StellarGrade
): Omit<StellarProperty, 'id'> {
  const classInfo = STAR_CLASS_INFO[stellarClass];
  const mass = STELLAR_MASS[stellarClass][stellarGrade];
  const luminosity = STELLAR_LUMINOSITY[stellarClass][stellarGrade];
  const radius = STELLAR_RADIUS[stellarClass][stellarGrade];
  const temperature = STELLAR_TEMPERATURE[stellarClass][stellarGrade];

  return {
    stellarClass,
    stellarGrade,
    mass,
    luminosity,
    radius,
    temperature,
    color: classInfo.color,
    description: classInfo.description,
    temperatureRange: classInfo.temperatureRange,
  };
}

/**
 * Generate ID for stellar property record
 */
export function getStellarPropertyId(
  stellarClass: StellarClass,
  stellarGrade: StellarGrade
): string {
  return `${stellarClass}${stellarGrade}`;
}

/**
 * Generate all stellar properties for database seeding
 */
export function generateAllStellarProperties(): StellarProperty[] {
  const records: StellarProperty[] = [];

  const classes = Object.keys(STELLAR_MASS) as StellarClass[];
  const grades = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as StellarGrade[];

  for (const stellarClass of classes) {
    for (const stellarGrade of grades) {
      const properties = getStellarProperties(stellarClass, stellarGrade);
      records.push({
        id: getStellarPropertyId(stellarClass, stellarGrade),
        ...properties,
      });
    }
  }

  return records;
}
