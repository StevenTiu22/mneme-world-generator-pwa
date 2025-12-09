import { BrownDwarfSpectralType } from '@/models/world/brownDwarf';

/**
 * Brown Dwarf Mass Table (2D6)
 * Mass ranges in Jupiter masses (JM)
 *
 * Brown dwarfs range from 13 JM (deuterium burning limit) to 80 JM (hydrogen burning limit)
 * Distribution favors mid-range masses (40-45 JM at roll 7)
 */
export interface BrownDwarfMassEntry {
  roll: number;
  minMass: number;  // Jupiter masses
  maxMass: number;  // Jupiter masses
  label: string;
}

export const BROWN_DWARF_MASS_TABLE: BrownDwarfMassEntry[] = [
  { roll: 2, minMass: 13, maxMass: 20, label: 'Very Small' },
  { roll: 3, minMass: 20, maxMass: 25, label: 'Small' },
  { roll: 4, minMass: 25, maxMass: 30, label: 'Below Average' },
  { roll: 5, minMass: 30, maxMass: 35, label: 'Moderately Small' },
  { roll: 6, minMass: 35, maxMass: 40, label: 'Average' },
  { roll: 7, minMass: 40, maxMass: 45, label: 'Standard' },       // Most common
  { roll: 8, minMass: 45, maxMass: 50, label: 'Above Average' },
  { roll: 9, minMass: 50, maxMass: 55, label: 'Moderately Large' },
  { roll: 10, minMass: 55, maxMass: 65, label: 'Large' },
  { roll: 11, minMass: 65, maxMass: 75, label: 'Very Large' },
  { roll: 12, minMass: 75, maxMass: 80, label: 'Near Stellar' }, // Close to hydrogen fusion
];

/**
 * Get mass entry from 2D6 roll
 */
export function getMassFromRoll(roll: number): BrownDwarfMassEntry {
  const entry = BROWN_DWARF_MASS_TABLE.find(e => e.roll === roll);
  if (!entry) {
    throw new Error(`Invalid brown dwarf mass roll: ${roll}`);
  }
  return entry;
}

/**
 * Brown Dwarf Spectral Type and Temperature Table (2D6)
 *
 * Spectral types correlate with temperature:
 * - Y Class: <600 K (coolest, ammonia clouds)
 * - T Class: 600-1300 K (methane absorption)
 * - L Class: 1300-2500 K (hottest, red/brown color)
 */
export interface BrownDwarfSpectralEntry {
  roll: number;
  spectralType: BrownDwarfSpectralType;
  minTemp: number;  // Kelvin
  maxTemp: number;  // Kelvin
  color: string;
  description: string;
}

export const BROWN_DWARF_SPECTRAL_TABLE: BrownDwarfSpectralEntry[] = [
  {
    roll: 2,
    spectralType: BrownDwarfSpectralType.Y_CLASS,
    minTemp: 300,
    maxTemp: 400,
    color: 'Dark Purple',
    description: 'Very cool, ammonia clouds, barely visible'
  },
  {
    roll: 3,
    spectralType: BrownDwarfSpectralType.Y_CLASS,
    minTemp: 400,
    maxTemp: 500,
    color: 'Purple-Gray',
    description: 'Cool, ammonia-dominated atmosphere'
  },
  {
    roll: 4,
    spectralType: BrownDwarfSpectralType.Y_CLASS,
    minTemp: 500,
    maxTemp: 600,
    color: 'Gray-Blue',
    description: 'Cool, transitioning to T class'
  },
  {
    roll: 5,
    spectralType: BrownDwarfSpectralType.T_CLASS,
    minTemp: 600,
    maxTemp: 800,
    color: 'Magenta-Brown',
    description: 'Moderate, strong methane absorption'
  },
  {
    roll: 6,
    spectralType: BrownDwarfSpectralType.T_CLASS,
    minTemp: 800,
    maxTemp: 1000,
    color: 'Brown-Red',
    description: 'Moderate, methane bands prominent'
  },
  {
    roll: 7,
    spectralType: BrownDwarfSpectralType.T_CLASS,
    minTemp: 1000,
    maxTemp: 1200,
    color: 'Burgundy',
    description: 'Warm T class, methane weakening'
  },
  {
    roll: 8,
    spectralType: BrownDwarfSpectralType.T_CLASS,
    minTemp: 1200,
    maxTemp: 1300,
    color: 'Deep Red',
    description: 'Hot T class, transitioning to L'
  },
  {
    roll: 9,
    spectralType: BrownDwarfSpectralType.L_CLASS,
    minTemp: 1300,
    maxTemp: 1600,
    color: 'Crimson',
    description: 'Hot, lithium present, faint glow'
  },
  {
    roll: 10,
    spectralType: BrownDwarfSpectralType.L_CLASS,
    minTemp: 1600,
    maxTemp: 2000,
    color: 'Bright Red',
    description: 'Very hot, dust clouds forming'
  },
  {
    roll: 11,
    spectralType: BrownDwarfSpectralType.L_CLASS,
    minTemp: 2000,
    maxTemp: 2300,
    color: 'Orange-Red',
    description: 'Near stellar, silicate clouds'
  },
  {
    roll: 12,
    spectralType: BrownDwarfSpectralType.L_CLASS,
    minTemp: 2300,
    maxTemp: 2500,
    color: 'Bright Orange',
    description: 'Hottest brown dwarf, close to M dwarf'
  },
];

/**
 * Get spectral entry from 2D6 roll
 */
export function getSpectralFromRoll(roll: number): BrownDwarfSpectralEntry {
  const entry = BROWN_DWARF_SPECTRAL_TABLE.find(e => e.roll === roll);
  if (!entry) {
    throw new Error(`Invalid brown dwarf spectral roll: ${roll}`);
  }
  return entry;
}

/**
 * Get random temperature within range for given spectral type
 */
export function getRandomTemperature(minTemp: number, maxTemp: number): number {
  return Math.floor(Math.random() * (maxTemp - minTemp + 1)) + minTemp;
}

/**
 * Get random mass within range
 */
export function getRandomMass(minMass: number, maxMass: number): number {
  // Return mass with 1 decimal place precision
  return Math.round((Math.random() * (maxMass - minMass) + minMass) * 10) / 10;
}

/**
 * Get spectral type color hex code
 */
export function getSpectralTypeColor(spectralType: BrownDwarfSpectralType): string {
  const colors: Record<BrownDwarfSpectralType, string> = {
    [BrownDwarfSpectralType.Y_CLASS]: '#6B46C1', // Purple
    [BrownDwarfSpectralType.T_CLASS]: '#991B1B', // Dark Red
    [BrownDwarfSpectralType.L_CLASS]: '#DC2626', // Bright Red
  };
  return colors[spectralType];
}
