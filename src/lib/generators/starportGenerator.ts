/**
 * Starport Generator
 *
 * Procedural starport generation following Mneme rules.
 * Generates starport classification, facilities, and base presence.
 */

import { v4 as uuidv4 } from 'uuid';
import { roll2D6 } from '@/lib/dice';
import {
  type StarportData,
  type StarportClass,
  type BasePresence,
  type StarportDiceRolls,
  BaseType,
} from '@/models/world/starport';
import { calculatePortValueScore, getStarportClassFromPVS } from './worldTables';

/**
 * Generation options for starport
 */
export interface StarportGenerationOptions {
  worldId: string;
  habitabilityScore: number;
  techLevel: number;
  wealth: number;
  developmentModifier: number;
}

/**
 * Generate complete starport data
 *
 * Process:
 * 1. Calculate Port Value Score (PVS)
 * 2. Determine starport class from PVS
 * 3. Roll for base presence (Naval, Scout, Pirate)
 * 4. Compile facilities and capabilities
 *
 * @param options - Generation configuration
 * @returns Complete StarportData
 */
export function generateStarport(options: StarportGenerationOptions): StarportData {
  const { worldId, habitabilityScore, techLevel, wealth, developmentModifier } = options;

  // Track dice rolls for transparency
  const diceRolls: StarportDiceRolls = {};

  // Step 1: Calculate Port Value Score
  const portValueScore = calculatePortValueScore(
    habitabilityScore,
    techLevel,
    wealth,
    developmentModifier
  );

  // Step 2: Determine starport class
  const starportEntry = getStarportClassFromPVS(portValueScore);
  const starportClass = starportEntry.starportClass as StarportClass;

  // Step 3: Roll for base presence
  const bases: BasePresence[] = [];

  // Naval Base (only for A and B class ports)
  if (starportClass === 'A' || starportClass === 'B') {
    const navalRoll = roll2D6();
    diceRolls.navalBaseRoll = navalRoll.total;

    // Naval base on 8+ for A-class, 10+ for B-class
    const navalTarget = starportClass === 'A' ? 8 : 10;
    bases.push({
      type: BaseType.NAVAL,
      present: navalRoll.total >= navalTarget,
      roll: navalRoll.total,
    });
  }

  // Scout Base (for A, B, C, and D class ports)
  if (['A', 'B', 'C', 'D'].includes(starportClass)) {
    const scoutRoll = roll2D6();
    diceRolls.scoutBaseRoll = scoutRoll.total;

    // Scout base on 7+ for A-class, 8+ for B-class, 9+ for C-class, 10+ for D-class
    const scoutTargets: Record<string, number> = {
      'A': 7,
      'B': 8,
      'C': 9,
      'D': 10,
    };
    const scoutTarget = scoutTargets[starportClass] || 12;
    bases.push({
      type: BaseType.SCOUT,
      present: scoutRoll.total >= scoutTarget,
      roll: scoutRoll.total,
    });
  }

  // Pirate Base (for C, D, and E class ports - lower quality ports attract pirates)
  if (['C', 'D', 'E'].includes(starportClass)) {
    const pirateRoll = roll2D6();
    diceRolls.pirateBaseRoll = pirateRoll.total;

    // Pirate base on 12 for all (rare, but possible)
    bases.push({
      type: BaseType.PIRATE,
      present: pirateRoll.total >= 12,
      roll: pirateRoll.total,
    });
  }

  // Step 4: Create complete starport data
  const now = new Date().toISOString();
  const starportData: StarportData = {
    id: uuidv4(),
    worldId,
    starportClass,
    portValueScore,
    label: starportEntry.label,
    description: starportEntry.description,
    capabilities: starportEntry.capabilities,
    bases,
    generationMethod: 'procedural',
    diceRolls,
    createdAt: now,
    updatedAt: now,
  };

  console.log('🚀 Generated starport:', {
    worldId,
    class: starportClass,
    pvs: portValueScore,
    bases: bases.filter(b => b.present).map(b => b.type),
  });

  return starportData;
}

/**
 * Re-roll base presence for a specific base type
 * Useful for manual adjustment of starport features
 */
export function rollBasePresence(
  baseType: BaseType,
  starportClass: StarportClass
): BasePresence {
  const roll = roll2D6();

  let present = false;
  let target = 12; // Default: impossible unless overridden

  switch (baseType) {
    case BaseType.NAVAL:
      if (starportClass === 'A') target = 8;
      else if (starportClass === 'B') target = 10;
      else target = 13; // Impossible for other classes
      break;

    case BaseType.SCOUT:
      const scoutTargets: Record<string, number> = {
        'A': 7,
        'B': 8,
        'C': 9,
        'D': 10,
      };
      target = scoutTargets[starportClass] || 13;
      break;

    case BaseType.PIRATE:
      if (['C', 'D', 'E'].includes(starportClass)) target = 12;
      else target = 13;
      break;

    default:
      target = 12;
  }

  present = roll.total >= target;

  return {
    type: baseType,
    present,
    roll: roll.total,
  };
}

/**
 * Get base presence target number for UI display
 */
export function getBasePresenceTarget(
  baseType: BaseType,
  starportClass: StarportClass
): number | null {
  switch (baseType) {
    case BaseType.NAVAL:
      if (starportClass === 'A') return 8;
      if (starportClass === 'B') return 10;
      return null; // Not possible

    case BaseType.SCOUT:
      const scoutTargets: Record<string, number> = {
        'A': 7,
        'B': 8,
        'C': 9,
        'D': 10,
      };
      return scoutTargets[starportClass] || null;

    case BaseType.PIRATE:
      if (['C', 'D', 'E'].includes(starportClass)) return 12;
      return null;

    default:
      return null;
  }
}

/**
 * Calculate what PVS would be needed for a specific starport class
 * Useful for UI to show what's possible
 */
export function getPVSRangeForClass(starportClass: StarportClass): {
  min: number;
  max: number | null;
} {
  const ranges: Record<StarportClass, { min: number; max: number | null }> = {
    'X': { min: -Infinity, max: -1 },
    'E': { min: 0, max: 3 },
    'D': { min: 4, max: 7 },
    'C': { min: 8, max: 11 },
    'B': { min: 12, max: 15 },
    'A': { min: 16, max: null },
  };
  return ranges[starportClass];
}
