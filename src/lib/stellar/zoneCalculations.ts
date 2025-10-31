import type { StellarZones, ZoneRange } from '@/models/stellar/types/interface';
import type { StellarClass, StellarGrade } from '@/models/stellar/types/enums';
import { getStellarProperty } from '@/lib/db/queries/stellarQueries';
import {
  HABITABILITY_ZONE_CONSTANTS,
  ORBITAL_ZONE_MULTIPLIERS,
} from '@/models/stellar/data/constants';

/**
 * Calculate the habitable zone boundaries based on stellar luminosity
 * Uses the conservative habitability zone formula
 *
 * @param luminosity - Stellar luminosity in solar luminosities (L☉)
 * @returns Inner and outer boundaries of conservative habitable zone in AU
 */
export function calculateHabitableZone(luminosity: number): ZoneRange {
  const sqrtLuminosity = Math.sqrt(luminosity);

  return {
    innerBoundary: HABITABILITY_ZONE_CONSTANTS.INNER_BOUNDARY_COEFFICIENT * sqrtLuminosity,
    outerBoundary: HABITABILITY_ZONE_CONSTANTS.OUTER_BOUNDARY_COEFFICIENT * sqrtLuminosity,
  };
}

/**
 * Calculate the frostline distance based on stellar luminosity
 * Frostline is where water ice can exist (beyond snow line)
 *
 * @param luminosity - Stellar luminosity in solar luminosities (L☉)
 * @returns Frostline distance in AU
 */
export function calculateFrostline(luminosity: number): number {
  return ORBITAL_ZONE_MULTIPLIERS.FROSTLINE_COEFFICIENT * Math.sqrt(luminosity);
}

/**
 * Calculate all stellar zones for a given star
 *
 * Zones:
 * - Infernal: 0 to 0.5 × inner HZ (too hot, surface molten)
 * - Hot: 0.5 × inner HZ to inner HZ (hot desert worlds)
 * - Conservative Habitable: inner HZ to outer HZ (liquid water possible)
 * - Cold: outer HZ to 2 × outer HZ (frozen but potentially habitable subsurface)
 * - Outer: 2 × outer HZ to frostline (gas giants, ice worlds)
 * - Frostline: boundary where volatiles freeze
 *
 * @param luminosity - Stellar luminosity in solar luminosities (L☉)
 * @returns Complete stellar zone structure with all boundaries
 */
export function calculateStellarZones(luminosity: number): StellarZones {
  const habitableZone = calculateHabitableZone(luminosity);
  const innerHZ = habitableZone.innerBoundary;
  const outerHZ = habitableZone.outerBoundary;
  const frostline = calculateFrostline(luminosity);

  return {
    infernal: {
      innerBoundary: ORBITAL_ZONE_MULTIPLIERS.INFERNAL_INNER,
      outerBoundary: innerHZ * ORBITAL_ZONE_MULTIPLIERS.INFERNAL_OUTER,
    },
    hot: {
      innerBoundary: innerHZ * ORBITAL_ZONE_MULTIPLIERS.HOT_INNER,
      outerBoundary: innerHZ * ORBITAL_ZONE_MULTIPLIERS.HOT_OUTER,
    },
    conservativeHabitable: {
      innerBoundary: innerHZ,
      outerBoundary: outerHZ,
    },
    cold: {
      innerBoundary: outerHZ * ORBITAL_ZONE_MULTIPLIERS.COLD_INNER,
      outerBoundary: outerHZ * ORBITAL_ZONE_MULTIPLIERS.COLD_OUTER,
    },
    outer: {
      innerBoundary: outerHZ * ORBITAL_ZONE_MULTIPLIERS.OUTER_INNER,
      outerBoundary: frostline,
    },
    frostline,
  };
}

/**
 * Calculate stellar zones from stellar class and grade
 * Queries the database for luminosity, then calculates zones
 *
 * @param stellarClass - Stellar class (O, B, A, F, G, K, M)
 * @param stellarGrade - Stellar grade (0-9)
 * @returns Promise with stellar zones or null if data not found
 */
export async function calculateStellarZonesFromClassGrade(
  stellarClass: StellarClass,
  stellarGrade: StellarGrade
): Promise<StellarZones | null> {
  const stellarProperty = await getStellarProperty(stellarClass, stellarGrade);

  if (!stellarProperty || !stellarProperty.luminosity) {
    return null;
  }

  return calculateStellarZones(stellarProperty.luminosity);
}

/**
 * Determine which zone a given orbital distance falls into
 *
 * @param orbitalDistance - Distance from star in AU
 * @param zones - Stellar zones structure
 * @returns Zone name or 'beyond' if past frostline
 */
export function determineOrbitalZone(
  orbitalDistance: number,
  zones: StellarZones
): 'infernal' | 'hot' | 'conservativeHabitable' | 'cold' | 'outer' | 'beyond' {
  if (orbitalDistance >= zones.infernal.innerBoundary && orbitalDistance < zones.infernal.outerBoundary) {
    return 'infernal';
  }
  if (orbitalDistance >= zones.hot.innerBoundary && orbitalDistance < zones.hot.outerBoundary) {
    return 'hot';
  }
  if (orbitalDistance >= zones.conservativeHabitable.innerBoundary &&
      orbitalDistance <= zones.conservativeHabitable.outerBoundary) {
    return 'conservativeHabitable';
  }
  if (orbitalDistance >= zones.cold.innerBoundary && orbitalDistance < zones.cold.outerBoundary) {
    return 'cold';
  }
  if (orbitalDistance >= zones.outer.innerBoundary && orbitalDistance <= zones.outer.outerBoundary) {
    return 'outer';
  }
  return 'beyond';
}

/**
 * Format zone name for display
 */
export function getZoneDisplayName(zone: string): string {
  const zoneNames: Record<string, string> = {
    infernal: 'Infernal Zone',
    hot: 'Hot Zone',
    conservativeHabitable: 'Habitable Zone',
    cold: 'Cold Zone',
    outer: 'Outer Zone',
    beyond: 'Beyond Frostline',
  };
  return zoneNames[zone] || 'Unknown';
}

/**
 * Get zone description
 */
export function getZoneDescription(zone: string): string {
  const descriptions: Record<string, string> = {
    infernal: 'Molten surface, extreme heat, no atmosphere retention',
    hot: 'Hot desert worlds, minimal water, challenging conditions',
    conservativeHabitable: 'Liquid water possible, optimal for life',
    cold: 'Frozen surface, potential subsurface oceans',
    outer: 'Gas giants and ice worlds, beyond habitable range',
    beyond: 'Far outer system, comets and icy bodies',
  };
  return descriptions[zone] || '';
}

/**
 * Validate companion star orbital distance
 * Warns if companion orbit interferes with habitable zone
 *
 * @param companionDistance - Companion orbital distance in AU
 * @param primaryZones - Primary star's stellar zones
 * @returns Validation result with warnings
 */
export function validateCompanionOrbit(
  companionDistance: number,
  primaryZones: StellarZones
): {
  valid: boolean;
  warnings: string[];
  zone: string;
} {
  const warnings: string[] = [];
  const zone = determineOrbitalZone(companionDistance, primaryZones);

  // Check if companion is too close (inside habitable zone)
  if (companionDistance <= primaryZones.conservativeHabitable.outerBoundary) {
    warnings.push('Companion orbit is inside or near the habitable zone. This may destabilize planetary orbits.');
  }

  // Check if companion is very close (inside hot zone)
  if (companionDistance <= primaryZones.hot.outerBoundary) {
    warnings.push('Companion is very close to primary star. Tidal interactions will be significant.');
  }

  return {
    valid: true, // All distances technically valid, just warn
    warnings,
    zone: getZoneDisplayName(zone),
  };
}

/**
 * Calculate safe orbital range for planets around primary in a binary system
 * Uses rough approximation: planets stable within ~1/3 of companion distance
 *
 * @param companionDistance - Distance to companion star in AU
 * @returns Maximum stable planetary orbit distance in AU
 */
export function calculateStablePlanetaryOrbitLimit(companionDistance: number): number {
  // Simplified stability criterion: planets can orbit within ~1/3 of binary separation
  // More precise calculation would use Hill sphere and mass ratios
  return companionDistance / 3;
}

/**
 * Format distance for display (handles very small and very large numbers)
 */
export function formatDistance(distance: number): string {
  if (distance < 0.01) {
    return distance.toExponential(2);
  } else if (distance < 1) {
    return distance.toFixed(3);
  } else if (distance < 10) {
    return distance.toFixed(2);
  } else if (distance < 100) {
    return distance.toFixed(1);
  } else {
    return distance.toFixed(0);
  }
}
