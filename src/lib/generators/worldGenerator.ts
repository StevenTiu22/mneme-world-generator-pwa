/**
 * World Generator
 *
 * Procedural world generation following Mneme rules.
 * Generates worlds using 2D6 dice rolls and lookup tables.
 */

import { v4 as uuidv4 } from 'uuid';
import { roll2D6, rollD66 } from '@/lib/dice';
import { GenerationMethod } from '@/models/common/types';
import {
  WorldType,
  type WorldData,
  type WorldDiceRolls,
  DwarfComposition,
  calculateHabitabilityScore,
  determineWorldDevelopment,
  type HabitabilityModifiers,
} from '@/models/world';
import {
  getWorldTypeFromRoll,
  getSizeFromRoll,
  getGravityFromRoll,
  getCompositionFromRoll,
  getAtmosphereFromRoll,
  getTemperatureFromRoll,
  getHazardTypeFromRoll,
  getHazardIntensityFromRoll,
  getBiochemicalResourcesFromRoll,
  getWealthFromRoll,
  getPowerStructureFromRoll,
  getGovernanceFromRoll,
  getSourceOfPowerFromRoll,
  calculatePortValueScore,
  getStarportClassFromPVS,
  getCultureTrait,
  HABITAT_SIZE_TABLE,
  DWARF_SIZE_TABLE,
  TERRESTRIAL_SIZE_TABLE,
} from './worldTables';

// =====================
// Generation Configuration
// =====================

export interface WorldGenerationOptions {
  starSystemId: string;
  techLevel: number;
  advantage?: number;
  disadvantage?: number;
  worldName?: string;
}

// =====================
// Main Generation Function
// =====================

/**
 * Generate a complete world using Mneme procedural rules
 *
 * @param options - Generation configuration
 * @returns Complete WorldData with all properties and dice rolls
 */
export function generateWorld(options: WorldGenerationOptions): WorldData {
  const {
    starSystemId,
    techLevel,
    advantage = 0,
    disadvantage = 0,
    worldName,
  } = options;

  // Track all dice rolls for transparency
  const diceRolls: WorldDiceRolls = {};

  // Step 1: Generate world type (2D6)
  const typeRoll = roll2D6(advantage, disadvantage);
  diceRolls.typeRoll = typeRoll.total;
  const worldType = getWorldTypeFromRoll(typeRoll.total);

  // Step 2: Generate size (2D6)
  const sizeRoll = roll2D6(advantage, disadvantage);
  diceRolls.sizeRoll = sizeRoll.total;
  const sizeEntry = getSizeFromRoll(sizeRoll.total, worldType);
  const size = sizeRoll.total;
  const mass = sizeEntry?.massValue || 1.0;

  // Step 3: Generate gravity (2D6) - only for dwarf and terrestrial
  let gravity = 1.0; // Default for habitats (artificial gravity)
  if (worldType !== WorldType.HABITAT) {
    const gravityRoll = roll2D6(advantage, disadvantage);
    diceRolls.gravityRoll = gravityRoll.total;
    gravity = getGravityFromRoll(gravityRoll.total, worldType);
  }

  // Step 4: Generate composition (2D6) - only for dwarfs
  let composition: DwarfComposition | undefined;
  if (worldType === WorldType.DWARF) {
    const compositionRoll = roll2D6(advantage, disadvantage);
    diceRolls.compositionRoll = compositionRoll.total;
    composition = getCompositionFromRoll(compositionRoll.total);
  }

  // Step 5: Generate habitability properties (Milestone 4)
  const atmosphereRoll = roll2D6(advantage, disadvantage);
  diceRolls.atmosphereRoll = atmosphereRoll.total;
  const atmosphereEntry = getAtmosphereFromRoll(atmosphereRoll.total);
  const atmosphericPressure = atmosphereEntry.pressure;

  const temperatureRoll = roll2D6(advantage, disadvantage);
  diceRolls.temperatureRoll = temperatureRoll.total;
  const temperatureEntry = getTemperatureFromRoll(temperatureRoll.total);
  const temperature = temperatureEntry.temperature;

  const hazardTypeRoll = roll2D6(advantage, disadvantage);
  diceRolls.hazardTypeRoll = hazardTypeRoll.total;
  const hazardTypeEntry = getHazardTypeFromRoll(hazardTypeRoll.total);
  const hazardType = hazardTypeEntry.hazardType;

  let hazardIntensity: number | undefined;
  if (hazardTypeEntry.requiresIntensity) {
    const hazardIntensityRoll = roll2D6(advantage, disadvantage);
    diceRolls.hazardIntensityRoll = hazardIntensityRoll.total;
    const hazardIntensityEntry = getHazardIntensityFromRoll(hazardIntensityRoll.total);
    hazardIntensity = hazardIntensityEntry.intensity;
  }

  const resourceRoll = roll2D6(advantage, disadvantage);
  diceRolls.resourceRoll = resourceRoll.total;
  const resourceEntry = getBiochemicalResourcesFromRoll(resourceRoll.total);
  const biochemicalResources = resourceEntry.resources;

  // Step 6: Calculate habitability score
  const habitabilityModifiers: Partial<HabitabilityModifiers> = {
    atmosphericPressure: atmosphereEntry.habitabilityModifier,
    temperature: temperatureEntry.habitabilityModifier,
    hazard: hazardIntensity ? -0.5 : 0, // Base hazard penalty if hazard exists
    hazardIntensity: hazardIntensity
      ? getHazardIntensityFromRoll(diceRolls.hazardIntensityRoll || 7).habitabilityModifier
      : 0,
    biochemicalResources: resourceEntry.habitabilityModifier,
    mass: mass >= 0.5 && mass <= 1.5 ? 0 : -1, // Penalty for extreme masses
    techLevel: Math.max(0, techLevel - 7) * 0.5, // Tech can offset harsh conditions
  };
  const habitabilityScore = calculateHabitabilityScore(habitabilityModifiers);

  // Step 7: Generate inhabitants properties (Milestone 4)
  const wealthRoll = roll2D6(advantage, disadvantage);
  diceRolls.wealthRoll = wealthRoll.total;
  const wealthEntry = getWealthFromRoll(wealthRoll.total);
  const wealth = wealthEntry.wealth;

  const powerStructureRoll = roll2D6(advantage, disadvantage);
  diceRolls.powerStructureRoll = powerStructureRoll.total;
  const powerStructureEntry = getPowerStructureFromRoll(powerStructureRoll.total);
  const powerStructure = powerStructureEntry.structure;

  const governanceRoll = roll2D6(advantage, disadvantage);
  diceRolls.governanceRoll = governanceRoll.total;
  const governanceEntry = getGovernanceFromRoll(governanceRoll.total);
  const governance = governanceEntry.governance;

  const sourceOfPowerRoll = roll2D6(advantage, disadvantage);
  diceRolls.sourceOfPowerRoll = sourceOfPowerRoll.total;
  const sourceOfPowerEntry = getSourceOfPowerFromRoll(sourceOfPowerRoll.total);
  const sourceOfPower = sourceOfPowerEntry.source;

  // Step 8: Calculate population (simplified formula)
  // Base population from size + modifiers from habitability and tech level
  let basePopulation = 0;
  if (worldType === WorldType.HABITAT) {
    // Habitat population from size table description
    const sizeValue = parseInt(sizeEntry?.description.split('-')[0].replace(/[KMB]/g, '') || '0');
    basePopulation = sizeValue * (sizeEntry?.mass.includes('G') ? 1000000 : 1000);
  } else {
    // Terrestrial/Dwarf: population based on habitability and tech
    const habFactor = Math.max(0.1, 1 + habitabilityScore / 10);
    const techFactor = Math.pow(10, techLevel - 7);
    basePopulation = Math.floor(mass * habFactor * techFactor * 1000000);
  }
  const population = Math.max(0, basePopulation);

  // Step 9: Determine development level
  const developmentLevel = determineWorldDevelopment(techLevel, habitabilityScore);

  // Step 10: Calculate starport (Milestone 4)
  const developmentModifier = getDevelopmentModifierForPVS(developmentLevel);
  const portValueScore = calculatePortValueScore(
    habitabilityScore,
    techLevel,
    wealth,
    developmentModifier
  );
  const starportEntry = getStarportClassFromPVS(portValueScore);
  const starportClass = starportEntry.starportClass;
  const starportFeatures = starportEntry.capabilities;

  // Step 11: Generate cultural traits (D66 system - Milestone 4)
  const culturalTraits: string[] = [];
  const cultureRolls: string[] = [];

  // Roll for 3 cultural aspects
  const socialRoll = rollD66();
  cultureRolls.push(socialRoll);
  const socialTrait = getCultureTrait(socialRoll, 'social');
  culturalTraits.push(`${socialTrait.trait}: ${socialTrait.description}`);

  const economicRoll = rollD66();
  cultureRolls.push(economicRoll);
  const economicTrait = getCultureTrait(economicRoll, 'economic');
  culturalTraits.push(`${economicTrait.trait}: ${economicTrait.description}`);

  const techRoll = rollD66();
  cultureRolls.push(techRoll);
  const techTrait = getCultureTrait(techRoll, 'tech');
  culturalTraits.push(`${techTrait.trait}: ${techTrait.description}`);

  // Store culture rolls in diceRolls
  diceRolls.cultureRolls = cultureRolls;

  // Step 12: Generate default name if not provided
  const name = worldName || generateDefaultWorldName(worldType);

  // Step 13: Create complete WorldData
  const now = new Date().toISOString();
  const worldData: WorldData = {
    id: uuidv4(),
    name,
    starSystemId,
    type: worldType,
    size,
    mass,
    gravity,
    composition,

    // Habitability properties
    atmosphericPressure,
    temperature,
    hazardType,
    hazardIntensity,
    biochemicalResources,
    habitabilityScore,

    // Inhabitants properties
    population,
    wealth,
    powerStructure,
    governance,
    sourceOfPower,

    // Starport properties
    portValueScore,
    starportClass,
    starportFeatures,

    // Culture properties
    culturalTraits,

    // Development
    techLevel,
    developmentLevel,

    // Generation metadata
    generationMethod: GenerationMethod.PROCEDURAL,
    diceRolls,

    // Timestamps
    createdAt: now,
    updatedAt: now,
    createdBy: 'user', // TODO: Replace with actual user ID when auth is implemented
  };

  console.log('🌍 Generated complete world:', {
    name: worldData.name,
    type: worldData.type,
    size: worldData.size,
    gravity: worldData.gravity,
    habitabilityScore: worldData.habitabilityScore,
    starportClass: worldData.starportClass,
    diceRolls,
  });

  return worldData;
}

// =====================
// Specific Generation Functions
// =====================

/**
 * Generate world type from dice roll
 */
export function generateWorldType(
  advantage = 0,
  disadvantage = 0
): { type: WorldType; roll: number } {
  const roll = roll2D6(advantage, disadvantage);
  const type = getWorldTypeFromRoll(roll.total);
  return { type, roll: roll.total };
}

/**
 * Generate world size from dice roll
 */
export function generateWorldSize(
  worldType: WorldType,
  advantage = 0,
  disadvantage = 0
): { size: number; mass: number; roll: number; label: string } {
  const roll = roll2D6(advantage, disadvantage);
  const sizeEntry = getSizeFromRoll(roll.total, worldType);

  return {
    size: roll.total,
    mass: sizeEntry?.massValue || 1.0,
    roll: roll.total,
    label: sizeEntry?.label || 'Standard',
  };
}

/**
 * Generate world gravity from dice roll
 */
export function generateWorldGravity(
  worldType: WorldType,
  advantage = 0,
  disadvantage = 0
): { gravity: number; roll: number } {
  if (worldType === WorldType.HABITAT) {
    return { gravity: 1.0, roll: 7 }; // Habitats have artificial 1G
  }

  const roll = roll2D6(advantage, disadvantage);
  const gravity = getGravityFromRoll(roll.total, worldType);

  return { gravity, roll: roll.total };
}

/**
 * Generate dwarf composition from dice roll
 */
export function generateDwarfComposition(
  advantage = 0,
  disadvantage = 0
): { composition: DwarfComposition; roll: number } {
  const roll = roll2D6(advantage, disadvantage);
  const composition = getCompositionFromRoll(roll.total);

  return { composition, roll: roll.total };
}

// =====================
// Helper Functions
// =====================

/**
 * Generate a default world name based on type
 */
function generateDefaultWorldName(worldType: WorldType): string {
  const typeLabel =
    worldType === WorldType.HABITAT
      ? 'Habitat'
      : worldType === WorldType.DWARF
        ? 'Lesser Earth'
        : 'Terrestrial';

  // Generate a random number for uniqueness
  const randomNum = Math.floor(Math.random() * 1000);
  return `${typeLabel} ${randomNum}`;
}

/**
 * Get development modifier for Port Value Score calculation
 * Reference: Mneme World Generator page 32
 */
function getDevelopmentModifierForPVS(developmentLevel: string): number {
  switch (developmentLevel) {
    case 'underdeveloped':
      return -2;
    case 'developing':
      return -1;
    case 'mature':
      return 0;
    case 'developed':
      return 1;
    case 'well_developed':
      return 2;
    case 'very_developed':
      return 3;
    default:
      return 0;
  }
}

/**
 * Calculate average size for a world type
 * Useful for UI displays and comparisons
 */
export function getAverageSizeForType(worldType: WorldType): number {
  if (worldType === WorldType.HABITAT) {
    return HABITAT_SIZE_TABLE[5].roll; // "Very Large" habitat
  } else if (worldType === WorldType.DWARF) {
    return DWARF_SIZE_TABLE[5].roll; // "Average" dwarf
  } else {
    return TERRESTRIAL_SIZE_TABLE[5].roll; // "Average" terrestrial
  }
}

/**
 * Get size description for display
 */
export function getSizeDescription(size: number, worldType: WorldType): string {
  const sizeEntry = getSizeFromRoll(size, worldType);
  return sizeEntry
    ? `${sizeEntry.label} (${sizeEntry.mass})`
    : `Size ${size}`;
}

/**
 * Validate world data consistency
 * Ensures generated world follows Mneme rules
 */
export function validateWorldData(worldData: WorldData): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check required fields
  if (!worldData.id) errors.push('Missing world ID');
  if (!worldData.name) errors.push('Missing world name');
  if (!worldData.starSystemId) errors.push('Missing star system ID');
  if (!worldData.type) errors.push('Missing world type');

  // Check dice roll ranges (2-12 for 2D6)
  const { diceRolls } = worldData;
  if (diceRolls?.typeRoll && (diceRolls.typeRoll < 2 || diceRolls.typeRoll > 12)) {
    errors.push('Invalid type roll (must be 2-12)');
  }
  if (diceRolls?.sizeRoll && (diceRolls.sizeRoll < 2 || diceRolls.sizeRoll > 12)) {
    errors.push('Invalid size roll (must be 2-12)');
  }
  if (diceRolls?.gravityRoll && (diceRolls.gravityRoll < 2 || diceRolls.gravityRoll > 12)) {
    errors.push('Invalid gravity roll (must be 2-12)');
  }

  // Check type-specific requirements
  if (worldData.type === WorldType.DWARF && !worldData.composition) {
    errors.push('Dwarf worlds must have composition');
  }
  if (worldData.type === WorldType.HABITAT && worldData.gravity !== 1.0) {
    errors.push('Habitats must have 1.0G artificial gravity');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
