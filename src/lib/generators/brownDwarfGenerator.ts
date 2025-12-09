import { v4 as uuidv4 } from 'uuid';
import { roll2D6 } from '@/lib/dice';
import { GenerationMethod } from '@/models/common/types';
import type {
  BrownDwarfData,
  BrownDwarfDiceRolls,
} from '@/models/world/brownDwarf';
import {
  generateDefaultBrownDwarfName,
  validateBrownDwarfData,
} from '@/models/world/brownDwarf';
import {
  getMassFromRoll,
  getSpectralFromRoll,
  getRandomMass,
  getRandomTemperature,
} from './brownDwarfTables';

/**
 * Options for brown dwarf generation
 */
export interface GenerateBrownDwarfOptions {
  starSystemId: string;
  orbitPosition: number;
  brownDwarfName?: string;
  advantage?: number;
  disadvantage?: number;
}

/**
 * Generate a brown dwarf using procedural 2D6 rolls
 *
 * Brown dwarfs are substellar objects (13-80 Jupiter masses) that are too small
 * to sustain hydrogen fusion but larger than gas giants.
 *
 * @param options Generation options
 * @returns Complete BrownDwarfData object
 */
export function generateBrownDwarf(options: GenerateBrownDwarfOptions): BrownDwarfData {
  const {
    starSystemId,
    orbitPosition,
    brownDwarfName,
    advantage = 0,
    disadvantage = 0,
  } = options;

  const diceRolls: BrownDwarfDiceRolls = {};

  // Step 1: Roll for mass (2D6)
  const massRollResult = roll2D6(advantage, disadvantage);
  diceRolls.massRoll = massRollResult.total;
  const massEntry = getMassFromRoll(massRollResult.total);
  const mass = getRandomMass(massEntry.minMass, massEntry.maxMass);

  // Step 2: Roll for spectral type and temperature (2D6)
  const spectralRollResult = roll2D6(advantage, disadvantage);
  diceRolls.spectralRoll = spectralRollResult.total;
  const spectralEntry = getSpectralFromRoll(spectralRollResult.total);
  const temperature = getRandomTemperature(spectralEntry.minTemp, spectralEntry.maxTemp);

  // Generate name if not provided
  const name = brownDwarfName || generateDefaultBrownDwarfName(spectralEntry.spectralType, orbitPosition);

  // Create timestamps
  const now = new Date().toISOString();

  // Assemble brown dwarf data
  const brownDwarf: BrownDwarfData = {
    id: uuidv4(),
    name,
    starSystemId,
    orbitPosition,
    mass,
    temperature,
    spectralType: spectralEntry.spectralType,
    generationMethod: GenerationMethod.PROCEDURAL,
    diceRolls,
    createdAt: now,
    updatedAt: now,
    createdBy: 'user',
  };

  // Validate before returning
  const validation = validateBrownDwarfData(brownDwarf);
  if (!validation.isValid) {
    console.error('Generated invalid brown dwarf:', validation.errors);
    throw new Error(`Brown dwarf validation failed: ${validation.errors.join(', ')}`);
  }

  console.log('🎲 Generated brown dwarf:', {
    name: brownDwarf.name,
    mass: `${brownDwarf.mass} JM`,
    temperature: `${brownDwarf.temperature} K`,
    spectralType: brownDwarf.spectralType,
    orbitPosition: brownDwarf.orbitPosition,
    diceRolls: {
      massRoll: diceRolls.massRoll,
      spectralRoll: diceRolls.spectralRoll,
    },
  });

  return brownDwarf;
}

/**
 * Generate brown dwarf mass only (for custom generation)
 */
export function generateBrownDwarfMass(advantage = 0, disadvantage = 0): {
  mass: number;
  roll: number;
  label: string;
} {
  const rollResult = roll2D6(advantage, disadvantage);
  const entry = getMassFromRoll(rollResult.total);
  const mass = getRandomMass(entry.minMass, entry.maxMass);

  return {
    mass,
    roll: rollResult.total,
    label: entry.label,
  };
}

/**
 * Generate brown dwarf spectral type only (for custom generation)
 */
export function generateBrownDwarfSpectralType(advantage = 0, disadvantage = 0): {
  spectralType: string;
  temperature: number;
  roll: number;
  color: string;
  description: string;
} {
  const rollResult = roll2D6(advantage, disadvantage);
  const entry = getSpectralFromRoll(rollResult.total);
  const temperature = getRandomTemperature(entry.minTemp, entry.maxTemp);

  return {
    spectralType: entry.spectralType,
    temperature,
    roll: rollResult.total,
    color: entry.color,
    description: entry.description,
  };
}

/**
 * Get average mass for brown dwarfs
 */
export function getAverageBrownDwarfMass(): number {
  return 45; // Average of the 40-45 JM range (roll 7)
}

/**
 * Get mass description based on value
 */
export function getMassDescription(mass: number): string {
  if (mass < 20) return 'Very Small';
  if (mass < 30) return 'Small';
  if (mass < 40) return 'Below Average';
  if (mass < 50) return 'Average';
  if (mass < 65) return 'Large';
  if (mass < 75) return 'Very Large';
  return 'Near Stellar';
}
