/**
 * World Generation Tables
 *
 * Lookup tables for procedural world generation following Mneme rules.
 * All tables use 2D6 roll results (2-12) unless otherwise specified.
 *
 * Reference: Mneme World Generator documentation
 */

import { WorldType, DwarfComposition } from '@/models/world';

// =====================
// World Type Generation
// =====================

/**
 * World type probabilities based on 2D6 roll
 * Note: In actual implementation, this can be weighted by orbital zone
 */
export interface WorldTypeResult {
  roll: number;
  type: WorldType;
  description: string;
}

export const WORLD_TYPE_TABLE: WorldTypeResult[] = [
  { roll: 2, type: WorldType.DWARF, description: 'Lesser Earth/Moon' },
  { roll: 3, type: WorldType.DWARF, description: 'Lesser Earth/Moon' },
  { roll: 4, type: WorldType.DWARF, description: 'Lesser Earth/Moon' },
  { roll: 5, type: WorldType.TERRESTRIAL, description: 'Terrestrial Planet' },
  { roll: 6, type: WorldType.TERRESTRIAL, description: 'Terrestrial Planet' },
  { roll: 7, type: WorldType.TERRESTRIAL, description: 'Terrestrial Planet' },
  { roll: 8, type: WorldType.TERRESTRIAL, description: 'Terrestrial Planet' },
  { roll: 9, type: WorldType.TERRESTRIAL, description: 'Terrestrial Planet' },
  { roll: 10, type: WorldType.HABITAT, description: 'Orbital Habitat' },
  { roll: 11, type: WorldType.HABITAT, description: 'Orbital Habitat' },
  { roll: 12, type: WorldType.HABITAT, description: 'Orbital Habitat' },
];

/**
 * Get world type from 2D6 roll
 */
export function getWorldTypeFromRoll(roll: number): WorldType {
  const result = WORLD_TYPE_TABLE.find((entry) => entry.roll === roll);
  return result ? result.type : WorldType.TERRESTRIAL;
}

// =====================
// Size Tables
// =====================

export interface SizeTableEntry {
  roll: number;
  label: string;
  mass: string;
  massValue: number; // Numeric value for calculations
  description: string;
}

/**
 * Habitat size table (2D6)
 * Mass in MVT (Million Volume Tons) or GVT (Billion Volume Tons)
 */
export const HABITAT_SIZE_TABLE: SizeTableEntry[] = [
  { roll: 2, label: 'Tiny', mass: '1 MVT', massValue: 0.001, description: '10K-33K people' },
  { roll: 3, label: 'Small', mass: '3 MVT', massValue: 0.003, description: '30K-99K people' },
  { roll: 4, label: 'Medium', mass: '10 MVT', massValue: 0.01, description: '100K-333K people' },
  { roll: 5, label: 'Large', mass: '30 MVT', massValue: 0.03, description: '300K-999K people' },
  { roll: 6, label: 'Very Large', mass: '100 MVT', massValue: 0.1, description: '1M-3M people' },
  { roll: 7, label: 'Huge', mass: '300 MVT', massValue: 0.3, description: '3M-9M people' },
  { roll: 8, label: 'Massive', mass: '1 GVT', massValue: 1, description: '10M-33M people' },
  { roll: 9, label: 'Giant', mass: '3 GVT', massValue: 3, description: '30M-99M people' },
  { roll: 10, label: 'Enormous', mass: '10 GVT', massValue: 10, description: '100M-333M people' },
  { roll: 11, label: 'Colossal', mass: '30 GVT', massValue: 30, description: '300M-999M people' },
  { roll: 12, label: 'Mega', mass: '100 GVT', massValue: 100, description: '1B-3B people' },
];

/**
 * Dwarf world size table (2D6)
 * Mass in LM (Lunar Masses) - Luna = 0.0123 EM
 */
export const DWARF_SIZE_TABLE: SizeTableEntry[] = [
  { roll: 2, label: 'Micro', mass: '0.1 LM', massValue: 0.00123, description: 'Very small dwarf' },
  { roll: 3, label: 'Tiny', mass: '0.2 LM', massValue: 0.00246, description: 'Small dwarf' },
  { roll: 4, label: 'Small', mass: '0.3 LM', massValue: 0.00369, description: 'Below average' },
  { roll: 5, label: 'Below Average', mass: '0.5 LM', massValue: 0.00615, description: 'Moderately small' },
  { roll: 6, label: 'Average', mass: '0.7 LM', massValue: 0.00861, description: 'Average dwarf' },
  { roll: 7, label: 'Standard', mass: '1.0 LM', massValue: 0.0123, description: 'Luna-sized' },
  { roll: 8, label: 'Large', mass: '1.5 LM', massValue: 0.01845, description: 'Large dwarf' },
  { roll: 9, label: 'Very Large', mass: '2.0 LM', massValue: 0.0246, description: 'Very large dwarf' },
  { roll: 10, label: 'Huge', mass: '3.0 LM', massValue: 0.0369, description: 'Huge dwarf' },
  { roll: 11, label: 'Massive', mass: '5.0 LM', massValue: 0.0615, description: 'Massive dwarf' },
  { roll: 12, label: 'Giant', mass: '7.0 LM', massValue: 0.0861, description: 'Giant dwarf' },
];

/**
 * Terrestrial world size table (2D6)
 * Mass in EM (Earth Masses)
 */
export const TERRESTRIAL_SIZE_TABLE: SizeTableEntry[] = [
  { roll: 2, label: 'Micro', mass: '0.1 EM', massValue: 0.1, description: 'Mars-sized' },
  { roll: 3, label: 'Tiny', mass: '0.2 EM', massValue: 0.2, description: 'Very small' },
  { roll: 4, label: 'Small', mass: '0.3 EM', massValue: 0.3, description: 'Below average' },
  { roll: 5, label: 'Below Average', mass: '0.5 EM', massValue: 0.5, description: 'Moderately small' },
  { roll: 6, label: 'Average', mass: '0.7 EM', massValue: 0.7, description: 'Below Earth' },
  { roll: 7, label: 'Standard', mass: '1.0 EM', massValue: 1.0, description: 'Earth-sized' },
  { roll: 8, label: 'Large', mass: '1.5 EM', massValue: 1.5, description: 'Super Earth' },
  { roll: 9, label: 'Very Large', mass: '2.0 EM', massValue: 2.0, description: 'Large super Earth' },
  { roll: 10, label: 'Huge', mass: '3.0 EM', massValue: 3.0, description: 'Huge terrestrial' },
  { roll: 11, label: 'Massive', mass: '5.0 EM', massValue: 5.0, description: 'Massive terrestrial' },
  { roll: 12, label: 'Mega Earth', mass: '7.0 EM', massValue: 7.0, description: 'Mega Earth' },
];

/**
 * Get size table entry from roll and world type
 */
export function getSizeFromRoll(roll: number, worldType: WorldType): SizeTableEntry | undefined {
  if (worldType === WorldType.HABITAT) {
    return HABITAT_SIZE_TABLE.find((entry) => entry.roll === roll);
  } else if (worldType === WorldType.DWARF) {
    return DWARF_SIZE_TABLE.find((entry) => entry.roll === roll);
  } else if (worldType === WorldType.TERRESTRIAL) {
    return TERRESTRIAL_SIZE_TABLE.find((entry) => entry.roll === roll);
  }
  return undefined;
}

// =====================
// Gravity Tables
// =====================

export interface GravityTableEntry {
  roll: number;
  dwarfGravity: number; // In G (Earth gravities)
  terrestrialGravity: number; // In G (Earth gravities)
  habitabilityModifier: number;
  label: string;
}

/**
 * Gravity table (2D6)
 * Different values for dwarf vs terrestrial worlds
 * Habitats don't use this table (they have artificial gravity)
 *
 * Distribution follows 2D6 probability:
 * - Low rolls (2-4): Low gravity for terrestrials (Mars-like worlds)
 * - Mid rolls (5-9): Normal gravity for terrestrials (Earth-like, most common)
 * - High rolls (10-12): High gravity for terrestrials (Super-Earths)
 */
export const GRAVITY_TABLE: GravityTableEntry[] = [
  { roll: 2, dwarfGravity: 0.001, terrestrialGravity: 0.3, habitabilityModifier: -2, label: '0.001 G / 0.3 G' },
  { roll: 3, dwarfGravity: 0.02, terrestrialGravity: 0.4, habitabilityModifier: -1.5, label: '0.02 G / 0.4 G' },
  { roll: 4, dwarfGravity: 0.04, terrestrialGravity: 0.5, habitabilityModifier: -1, label: '0.04 G / 0.5 G' },
  { roll: 5, dwarfGravity: 0.06, terrestrialGravity: 0.7, habitabilityModifier: -0.5, label: '0.06 G / 0.7 G' },
  { roll: 6, dwarfGravity: 0.08, terrestrialGravity: 0.9, habitabilityModifier: 0, label: '0.08 G / 0.9 G' },
  { roll: 7, dwarfGravity: 0.10, terrestrialGravity: 1.0, habitabilityModifier: 0, label: '0.10 G / 1.0 G' },
  { roll: 8, dwarfGravity: 0.12, terrestrialGravity: 1.0, habitabilityModifier: 0, label: '0.12 G / 1.0 G' },
  { roll: 9, dwarfGravity: 0.14, terrestrialGravity: 1.2, habitabilityModifier: 0, label: '0.14 G / 1.2 G' },
  { roll: 10, dwarfGravity: 0.16, terrestrialGravity: 1.5, habitabilityModifier: -0.5, label: '0.16 G / 1.5 G' },
  { roll: 11, dwarfGravity: 0.18, terrestrialGravity: 2.0, habitabilityModifier: -1.5, label: '0.18 G / 2.0 G' },
  { roll: 12, dwarfGravity: 0.20, terrestrialGravity: 3.0, habitabilityModifier: -2.5, label: '0.20 G / 3.0 G' },
];

/**
 * Get gravity from roll and world type
 */
export function getGravityFromRoll(roll: number, worldType: WorldType): number {
  const entry = GRAVITY_TABLE.find((e) => e.roll === roll);
  if (!entry) return 1.0; // Default to 1G

  if (worldType === WorldType.HABITAT) {
    return 1.0; // Habitats have artificial gravity (assume 1G)
  } else if (worldType === WorldType.DWARF) {
    return entry.dwarfGravity;
  } else {
    return entry.terrestrialGravity;
  }
}

/**
 * Get habitability modifier from gravity roll
 */
export function getGravityHabitabilityModifier(roll: number): number {
  const entry = GRAVITY_TABLE.find((e) => e.roll === roll);
  return entry ? entry.habitabilityModifier : 0;
}

// =====================
// Dwarf Composition Tables
// =====================

export interface CompositionTableEntry {
  roll: number;
  composition: DwarfComposition;
  label: string;
  description: string;
  modifier: number;
}

/**
 * Dwarf world composition table (2D6)
 * Only applies to dwarf/lesser earth worlds
 */
export const DWARF_COMPOSITION_TABLE: CompositionTableEntry[] = [
  { roll: 2, composition: DwarfComposition.METALLIC, label: 'Metallic', description: 'Dense, found near star', modifier: -1 },
  { roll: 3, composition: DwarfComposition.METALLIC, label: 'Metallic', description: 'Dense, found near star', modifier: -1 },
  { roll: 4, composition: DwarfComposition.SILICACEOUS, label: 'Silicaceous', description: 'Stony, moderate density', modifier: 0 },
  { roll: 5, composition: DwarfComposition.SILICACEOUS, label: 'Silicaceous', description: 'Stony, moderate density', modifier: 0 },
  { roll: 6, composition: DwarfComposition.SILICACEOUS, label: 'Silicaceous', description: 'Stony, moderate density', modifier: 0 },
  { roll: 7, composition: DwarfComposition.SILICACEOUS, label: 'Silicaceous', description: 'Stony, moderate density', modifier: 0 },
  { roll: 8, composition: DwarfComposition.SILICACEOUS, label: 'Silicaceous', description: 'Stony, moderate density', modifier: 0 },
  { roll: 9, composition: DwarfComposition.CARBONACEOUS, label: 'Carbonaceous', description: 'Volatile-rich, found in outer zones', modifier: 1 },
  { roll: 10, composition: DwarfComposition.CARBONACEOUS, label: 'Carbonaceous', description: 'Volatile-rich, found in outer zones', modifier: 1 },
  { roll: 11, composition: DwarfComposition.CARBONACEOUS, label: 'Carbonaceous', description: 'Volatile-rich, found in outer zones', modifier: 1 },
  { roll: 12, composition: DwarfComposition.OTHER, label: 'Other', description: 'Unusual composition', modifier: 0 },
];

/**
 * Get dwarf composition from 2D6 roll
 */
export function getCompositionFromRoll(roll: number): DwarfComposition {
  const entry = DWARF_COMPOSITION_TABLE.find((e) => e.roll === roll);
  return entry ? entry.composition : DwarfComposition.SILICACEOUS;
}

/**
 * Get composition entry details
 */
export function getCompositionEntry(roll: number): CompositionTableEntry | undefined {
  return DWARF_COMPOSITION_TABLE.find((e) => e.roll === roll);
}

// =====================
// Habitability Tables (Milestone 4)
// =====================

/**
 * Atmospheric pressure table (2D6)
 * Reference: Mneme World Generator page 22
 */
export interface AtmosphereTableEntry {
  roll: number;
  pressure: string;
  label: string;
  description: string;
  habitabilityModifier: number;
}

export const ATMOSPHERE_TABLE: AtmosphereTableEntry[] = [
  { roll: 2, pressure: 'None', label: 'None', description: 'Vacuum or trace atmosphere', habitabilityModifier: -3 },
  { roll: 3, pressure: 'None', label: 'None', description: 'Vacuum or trace atmosphere', habitabilityModifier: -3 },
  { roll: 4, pressure: 'Trace', label: 'Trace', description: 'Very thin atmosphere', habitabilityModifier: -2 },
  { roll: 5, pressure: 'Trace', label: 'Trace', description: 'Very thin atmosphere', habitabilityModifier: -2 },
  { roll: 6, pressure: 'Thin', label: 'Thin', description: 'Breathable but thin', habitabilityModifier: -1 },
  { roll: 7, pressure: 'Thin', label: 'Thin', description: 'Breathable but thin', habitabilityModifier: -1 },
  { roll: 8, pressure: 'Standard', label: 'Standard', description: 'Earth-like pressure', habitabilityModifier: 2 },
  { roll: 9, pressure: 'Standard', label: 'Standard', description: 'Earth-like pressure', habitabilityModifier: 2 },
  { roll: 10, pressure: 'Dense', label: 'Dense', description: 'Heavy but breathable', habitabilityModifier: 0 },
  { roll: 11, pressure: 'Dense', label: 'Dense', description: 'Heavy but breathable', habitabilityModifier: 0 },
  { roll: 12, pressure: 'Very Dense', label: 'Very Dense', description: 'Crushing atmosphere', habitabilityModifier: -2 },
];

export function getAtmosphereFromRoll(roll: number): AtmosphereTableEntry {
  const entry = ATMOSPHERE_TABLE.find((e) => e.roll === roll);
  return entry || ATMOSPHERE_TABLE[7]; // Default to Standard
}

/**
 * Temperature table (2D6)
 * Reference: Mneme World Generator page 23
 * Note: Temperature can be modified by orbital zone and star type
 */
export interface TemperatureTableEntry {
  roll: number;
  temperature: string;
  label: string;
  description: string;
  habitabilityModifier: number;
}

export const TEMPERATURE_TABLE: TemperatureTableEntry[] = [
  { roll: 2, temperature: 'Frozen', label: 'Frozen', description: 'Below -50°C', habitabilityModifier: -2 },
  { roll: 3, temperature: 'Frozen', label: 'Frozen', description: 'Below -50°C', habitabilityModifier: -2 },
  { roll: 4, temperature: 'Cold', label: 'Cold', description: '-20°C to 0°C', habitabilityModifier: -1 },
  { roll: 5, temperature: 'Cold', label: 'Cold', description: '-20°C to 0°C', habitabilityModifier: -1 },
  { roll: 6, temperature: 'Cool', label: 'Cool', description: '0°C to 15°C', habitabilityModifier: 0 },
  { roll: 7, temperature: 'Temperate', label: 'Temperate', description: '15°C to 25°C', habitabilityModifier: 2 },
  { roll: 8, temperature: 'Temperate', label: 'Temperate', description: '15°C to 25°C', habitabilityModifier: 2 },
  { roll: 9, temperature: 'Warm', label: 'Warm', description: '25°C to 35°C', habitabilityModifier: 0 },
  { roll: 10, temperature: 'Hot', label: 'Hot', description: '35°C to 50°C', habitabilityModifier: -1 },
  { roll: 11, temperature: 'Hot', label: 'Hot', description: '35°C to 50°C', habitabilityModifier: -1 },
  { roll: 12, temperature: 'Very Hot', label: 'Very Hot', description: 'Above 50°C', habitabilityModifier: -2 },
];

export function getTemperatureFromRoll(roll: number): TemperatureTableEntry {
  const entry = TEMPERATURE_TABLE.find((e) => e.roll === roll);
  return entry || TEMPERATURE_TABLE[6]; // Default to Temperate
}

/**
 * Hazard type table (2D6)
 * Reference: Mneme World Generator page 24
 */
export interface HazardTypeTableEntry {
  roll: number;
  hazardType: string;
  label: string;
  description: string;
  requiresIntensity: boolean;
}

export const HAZARD_TYPE_TABLE: HazardTypeTableEntry[] = [
  { roll: 2, hazardType: 'None', label: 'None', description: 'No environmental hazards', requiresIntensity: false },
  { roll: 3, hazardType: 'None', label: 'None', description: 'No environmental hazards', requiresIntensity: false },
  { roll: 4, hazardType: 'None', label: 'None', description: 'No environmental hazards', requiresIntensity: false },
  { roll: 5, hazardType: 'None', label: 'None', description: 'No environmental hazards', requiresIntensity: false },
  { roll: 6, hazardType: 'None', label: 'None', description: 'No environmental hazards', requiresIntensity: false },
  { roll: 7, hazardType: 'None', label: 'None', description: 'No environmental hazards', requiresIntensity: false },
  { roll: 8, hazardType: 'Seismic', label: 'Seismic', description: 'Earthquakes and tremors', requiresIntensity: true },
  { roll: 9, hazardType: 'Volcanic', label: 'Volcanic', description: 'Active volcanoes and lava flows', requiresIntensity: true },
  { roll: 10, hazardType: 'Weather', label: 'Weather', description: 'Severe storms and weather events', requiresIntensity: true },
  { roll: 11, hazardType: 'Radiation', label: 'Radiation', description: 'Dangerous radiation levels', requiresIntensity: true },
  { roll: 12, hazardType: 'Other', label: 'Other', description: 'Unusual or exotic hazard', requiresIntensity: true },
];

export function getHazardTypeFromRoll(roll: number): HazardTypeTableEntry {
  const entry = HAZARD_TYPE_TABLE.find((e) => e.roll === roll);
  return entry || HAZARD_TYPE_TABLE[0]; // Default to None
}

/**
 * Hazard intensity table (2D6)
 * Only applies if hazard type is not "None"
 * Reference: Mneme World Generator page 24
 */
export interface HazardIntensityTableEntry {
  roll: number;
  intensity: number;
  label: string;
  description: string;
  habitabilityModifier: number;
}

export const HAZARD_INTENSITY_TABLE: HazardIntensityTableEntry[] = [
  { roll: 2, intensity: 1, label: 'Mild', description: 'Minor inconvenience', habitabilityModifier: -0.5 },
  { roll: 3, intensity: 1, label: 'Mild', description: 'Minor inconvenience', habitabilityModifier: -0.5 },
  { roll: 4, intensity: 2, label: 'Mild', description: 'Minor inconvenience', habitabilityModifier: -0.5 },
  { roll: 5, intensity: 2, label: 'Mild', description: 'Minor inconvenience', habitabilityModifier: -0.5 },
  { roll: 6, intensity: 3, label: 'Moderate', description: 'Noticeable danger', habitabilityModifier: -1 },
  { roll: 7, intensity: 3, label: 'Moderate', description: 'Noticeable danger', habitabilityModifier: -1 },
  { roll: 8, intensity: 3, label: 'Moderate', description: 'Noticeable danger', habitabilityModifier: -1 },
  { roll: 9, intensity: 4, label: 'Severe', description: 'Serious threat', habitabilityModifier: -1.5 },
  { roll: 10, intensity: 4, label: 'Severe', description: 'Serious threat', habitabilityModifier: -1.5 },
  { roll: 11, intensity: 5, label: 'Extreme', description: 'Life-threatening', habitabilityModifier: -2 },
  { roll: 12, intensity: 5, label: 'Extreme', description: 'Life-threatening', habitabilityModifier: -2 },
];

export function getHazardIntensityFromRoll(roll: number): HazardIntensityTableEntry {
  const entry = HAZARD_INTENSITY_TABLE.find((e) => e.roll === roll);
  return entry || HAZARD_INTENSITY_TABLE[5]; // Default to Moderate
}

/**
 * Biochemical resources table (2D6)
 * Reference: Mneme World Generator page 24
 */
export interface BiochemicalResourcesTableEntry {
  roll: number;
  resources: string;
  label: string;
  description: string;
  habitabilityModifier: number;
}

export const BIOCHEMICAL_RESOURCES_TABLE: BiochemicalResourcesTableEntry[] = [
  { roll: 2, resources: 'None', label: 'None', description: 'No organic chemistry', habitabilityModifier: -2 },
  { roll: 3, resources: 'None', label: 'None', description: 'No organic chemistry', habitabilityModifier: -2 },
  { roll: 4, resources: 'Poor', label: 'Poor', description: 'Minimal organic compounds', habitabilityModifier: -1 },
  { roll: 5, resources: 'Poor', label: 'Poor', description: 'Minimal organic compounds', habitabilityModifier: -1 },
  { roll: 6, resources: 'Moderate', label: 'Moderate', description: 'Some organic chemistry', habitabilityModifier: 0 },
  { roll: 7, resources: 'Moderate', label: 'Moderate', description: 'Some organic chemistry', habitabilityModifier: 0 },
  { roll: 8, resources: 'Moderate', label: 'Moderate', description: 'Some organic chemistry', habitabilityModifier: 0 },
  { roll: 9, resources: 'Rich', label: 'Rich', description: 'Abundant organic compounds', habitabilityModifier: 1 },
  { roll: 10, resources: 'Rich', label: 'Rich', description: 'Abundant organic compounds', habitabilityModifier: 1 },
  { roll: 11, resources: 'Very Rich', label: 'Very Rich', description: 'Thriving biosphere', habitabilityModifier: 2 },
  { roll: 12, resources: 'Very Rich', label: 'Very Rich', description: 'Thriving biosphere', habitabilityModifier: 2 },
];

export function getBiochemicalResourcesFromRoll(roll: number): BiochemicalResourcesTableEntry {
  const entry = BIOCHEMICAL_RESOURCES_TABLE.find((e) => e.roll === roll);
  return entry || BIOCHEMICAL_RESOURCES_TABLE[5]; // Default to Moderate
}

// =====================
// Inhabitants Tables (Milestone 4)
// =====================

/**
 * Wealth table (2D6)
 * Reference: Mneme World Generator page 28
 * Can be modified by habitability, resources, and other factors
 */
export interface WealthTableEntry {
  roll: number;
  wealth: number;
  label: string;
  description: string;
}

export const WEALTH_TABLE: WealthTableEntry[] = [
  { roll: 2, wealth: -2, label: 'Destitute', description: 'Extreme poverty' },
  { roll: 3, wealth: -1, label: 'Very Poor', description: 'Struggling economy' },
  { roll: 4, wealth: 0, label: 'Poor', description: 'Below average wealth' },
  { roll: 5, wealth: 0, label: 'Poor', description: 'Below average wealth' },
  { roll: 6, wealth: 1, label: 'Moderate', description: 'Average wealth' },
  { roll: 7, wealth: 1, label: 'Moderate', description: 'Average wealth' },
  { roll: 8, wealth: 2, label: 'Comfortable', description: 'Above average wealth' },
  { roll: 9, wealth: 2, label: 'Comfortable', description: 'Above average wealth' },
  { roll: 10, wealth: 3, label: 'Prosperous', description: 'Well-off' },
  { roll: 11, wealth: 4, label: 'Rich', description: 'Wealthy world' },
  { roll: 12, wealth: 5, label: 'Very Rich', description: 'Extremely wealthy' },
];

export function getWealthFromRoll(roll: number): WealthTableEntry {
  const entry = WEALTH_TABLE.find((e) => e.roll === roll);
  return entry || WEALTH_TABLE[5]; // Default to Moderate
}

/**
 * Power structure table (2D6)
 * Reference: Mneme World Generator page 29
 */
export interface PowerStructureTableEntry {
  roll: number;
  structure: string;
  label: string;
  description: string;
}

export const POWER_STRUCTURE_TABLE: PowerStructureTableEntry[] = [
  { roll: 2, structure: 'Anarchy', label: 'Anarchy', description: 'No central authority' },
  { roll: 3, structure: 'Feudal', label: 'Feudal', description: 'Local lords and vassals' },
  { roll: 4, structure: 'Autocracy', label: 'Autocracy', description: 'Single ruler with absolute power' },
  { roll: 5, structure: 'Oligarchy', label: 'Oligarchy', description: 'Rule by elite few' },
  { roll: 6, structure: 'Oligarchy', label: 'Oligarchy', description: 'Rule by elite few' },
  { roll: 7, structure: 'Representative', label: 'Representative', description: 'Elected representatives' },
  { roll: 8, structure: 'Representative', label: 'Representative', description: 'Elected representatives' },
  { roll: 9, structure: 'Democracy', label: 'Democracy', description: 'Direct democratic rule' },
  { roll: 10, structure: 'Meritocracy', label: 'Meritocracy', description: 'Rule by the most capable' },
  { roll: 11, structure: 'Technocracy', label: 'Technocracy', description: 'Rule by technical experts' },
  { roll: 12, structure: 'AI/Synthetic', label: 'AI/Synthetic', description: 'Governed by artificial intelligence' },
];

export function getPowerStructureFromRoll(roll: number): PowerStructureTableEntry {
  const entry = POWER_STRUCTURE_TABLE.find((e) => e.roll === roll);
  return entry || POWER_STRUCTURE_TABLE[6]; // Default to Representative
}

/**
 * Governance quality table (2D6)
 * Reference: Mneme World Generator page 30
 * Can be modified by development level
 */
export interface GovernanceTableEntry {
  roll: number;
  governance: string;
  label: string;
  description: string;
  modifier: string;
}

export const GOVERNANCE_TABLE: GovernanceTableEntry[] = [
  { roll: 2, governance: 'Chaotic', label: 'Chaotic', description: 'Collapsed or ineffective', modifier: 'Dis+2' },
  { roll: 3, governance: 'Chaotic', label: 'Chaotic', description: 'Collapsed or ineffective', modifier: 'Dis+2' },
  { roll: 4, governance: 'Weak', label: 'Weak', description: 'Corrupt or incompetent', modifier: 'Dis+1' },
  { roll: 5, governance: 'Weak', label: 'Weak', description: 'Corrupt or incompetent', modifier: 'Dis+1' },
  { roll: 6, governance: 'Moderate', label: 'Moderate', description: 'Functional but flawed', modifier: 'Standard' },
  { roll: 7, governance: 'Moderate', label: 'Moderate', description: 'Functional but flawed', modifier: 'Standard' },
  { roll: 8, governance: 'Moderate', label: 'Moderate', description: 'Functional but flawed', modifier: 'Standard' },
  { roll: 9, governance: 'Strong', label: 'Strong', description: 'Effective and fair', modifier: 'Adv+1' },
  { roll: 10, governance: 'Strong', label: 'Strong', description: 'Effective and fair', modifier: 'Adv+1' },
  { roll: 11, governance: 'Totalitarian', label: 'Totalitarian', description: 'Highly efficient but oppressive', modifier: 'Adv+2' },
  { roll: 12, governance: 'Totalitarian', label: 'Totalitarian', description: 'Highly efficient but oppressive', modifier: 'Adv+2' },
];

export function getGovernanceFromRoll(roll: number): GovernanceTableEntry {
  const entry = GOVERNANCE_TABLE.find((e) => e.roll === roll);
  return entry || GOVERNANCE_TABLE[6]; // Default to Moderate
}

/**
 * Source of power table (2D6)
 * Reference: Mneme World Generator page 31
 */
export interface SourceOfPowerTableEntry {
  roll: number;
  source: string;
  label: string;
  description: string;
}

export const SOURCE_OF_POWER_TABLE: SourceOfPowerTableEntry[] = [
  { roll: 2, source: 'Military', label: 'Military', description: 'Armed forces hold power' },
  { roll: 3, source: 'Military', label: 'Military', description: 'Armed forces hold power' },
  { roll: 4, source: 'Religious', label: 'Religious', description: 'Faith-based authority' },
  { roll: 5, source: 'Religious', label: 'Religious', description: 'Faith-based authority' },
  { roll: 6, source: 'Corporate', label: 'Corporate', description: 'Megacorporation control' },
  { roll: 7, source: 'Popular', label: 'Popular', description: 'Will of the people' },
  { roll: 8, source: 'Popular', label: 'Popular', description: 'Will of the people' },
  { roll: 9, source: 'Hereditary', label: 'Hereditary', description: 'Inherited positions' },
  { roll: 10, source: 'Bureaucratic', label: 'Bureaucratic', description: 'Civil service power' },
  { roll: 11, source: 'Academic', label: 'Academic', description: 'Educational institutions' },
  { roll: 12, source: 'Other', label: 'Other', description: 'Unusual power source' },
];

export function getSourceOfPowerFromRoll(roll: number): SourceOfPowerTableEntry {
  const entry = SOURCE_OF_POWER_TABLE.find((e) => e.roll === roll);
  return entry || SOURCE_OF_POWER_TABLE[6]; // Default to Popular
}

// =====================
// Starport Tables (Milestone 4)
// =====================

/**
 * Calculate Port Value Score (PVS)
 * Reference: Mneme World Generator page 32
 * PVS = (Habitability/4) + (TL-7) + Wealth + Development
 */
export function calculatePortValueScore(
  habitabilityScore: number,
  techLevel: number,
  wealth: number,
  developmentModifier: number
): number {
  const habComponent = Math.floor(habitabilityScore / 4);
  const tlComponent = techLevel - 7;
  const pvsTotal = habComponent + tlComponent + wealth + developmentModifier;
  return pvsTotal;
}

/**
 * Starport class based on Port Value Score
 * Reference: Mneme World Generator page 32
 */
export interface StarportClassEntry {
  minPVS: number;
  maxPVS: number | null;
  starportClass: string;
  label: string;
  description: string;
  capabilities: string[];
}

export const STARPORT_CLASS_TABLE: StarportClassEntry[] = [
  {
    minPVS: -Infinity,
    maxPVS: -1,
    starportClass: 'X',
    label: 'No Starport',
    description: 'No port facilities',
    capabilities: [],
  },
  {
    minPVS: 0,
    maxPVS: 3,
    starportClass: 'E',
    label: 'Frontier Port',
    description: 'Minimal facilities',
    capabilities: ['Basic landing pad', 'No fuel', 'No repair'],
  },
  {
    minPVS: 4,
    maxPVS: 7,
    starportClass: 'D',
    label: 'Poor Port',
    description: 'Limited services',
    capabilities: ['Landing facilities', 'Unrefined fuel', 'Limited repair'],
  },
  {
    minPVS: 8,
    maxPVS: 11,
    starportClass: 'C',
    label: 'Routine Port',
    description: 'Standard services',
    capabilities: ['Good facilities', 'Refined fuel', 'Shipyard (small craft)'],
  },
  {
    minPVS: 12,
    maxPVS: 15,
    starportClass: 'B',
    label: 'Good Port',
    description: 'Excellent services',
    capabilities: ['Excellent facilities', 'Refined fuel', 'Shipyard (spacecraft)'],
  },
  {
    minPVS: 16,
    maxPVS: null,
    starportClass: 'A',
    label: 'Excellent Port',
    description: 'Best possible services',
    capabilities: [
      'Best facilities',
      'Refined fuel',
      'Shipyard (all classes)',
      'Naval base possible',
    ],
  },
];

export function getStarportClassFromPVS(pvs: number): StarportClassEntry {
  for (const entry of STARPORT_CLASS_TABLE) {
    if (pvs >= entry.minPVS && (entry.maxPVS === null || pvs <= entry.maxPVS)) {
      return entry;
    }
  }
  return STARPORT_CLASS_TABLE[0]; // Default to X (no port)
}

// =====================
// D66 Culture Tables (Milestone 4)
// =====================

/**
 * D66 Culture table entry
 * Reference: Mneme World Generator pages 40-43
 */
export interface CultureTableEntry {
  d66: string; // "1-1" to "6-6"
  trait: string;
  description: string;
}

/**
 * Social Values - D66 Table
 * Defines the core values and beliefs of the culture
 */
export const CULTURE_SOCIAL_VALUES: CultureTableEntry[] = [
  { d66: '1-1', trait: 'Individualistic', description: 'Personal freedom and autonomy highly valued' },
  { d66: '1-2', trait: 'Collectivist', description: 'Group harmony and consensus prioritized' },
  { d66: '1-3', trait: 'Hierarchical', description: 'Strict social order and respect for authority' },
  { d66: '1-4', trait: 'Egalitarian', description: 'Equality and fairness emphasized' },
  { d66: '1-5', trait: 'Meritocratic', description: 'Achievement and capability determine status' },
  { d66: '1-6', trait: 'Traditional', description: 'Ancient customs and heritage preserved' },
  { d66: '2-1', trait: 'Progressive', description: 'Innovation and change embraced' },
  { d66: '2-2', trait: 'Religious', description: 'Faith and spirituality central to life' },
  { d66: '2-3', trait: 'Secular', description: 'Reason and science guide decisions' },
  { d66: '2-4', trait: 'Militaristic', description: 'Martial prowess and discipline honored' },
  { d66: '2-5', trait: 'Pacifistic', description: 'Non-violence and diplomacy preferred' },
  { d66: '2-6', trait: 'Pragmatic', description: 'Practical solutions over ideals' },
  { d66: '3-1', trait: 'Idealistic', description: 'High principles and moral standards' },
  { d66: '3-2', trait: 'Competitive', description: 'Rivalry and striving for excellence' },
  { d66: '3-3', trait: 'Cooperative', description: 'Mutual aid and collaboration valued' },
  { d66: '3-4', trait: 'Isolationist', description: 'Self-sufficiency and privacy preferred' },
  { d66: '3-5', trait: 'Cosmopolitan', description: 'Diversity and external contact welcomed' },
  { d66: '3-6', trait: 'Xenophobic', description: 'Outsiders viewed with suspicion' },
  { d66: '4-1', trait: 'Hospitable', description: 'Strangers treated with warmth' },
  { d66: '4-2', trait: 'Scholarly', description: 'Knowledge and learning revered' },
  { d66: '4-3', trait: 'Anti-intellectual', description: 'Practical skills over book learning' },
  { d66: '4-4', trait: 'Artistic', description: 'Creative expression celebrated' },
  { d66: '4-5', trait: 'Utilitarian', description: 'Function over form' },
  { d66: '4-6', trait: 'Hedonistic', description: 'Pleasure and enjoyment prioritized' },
  { d66: '5-1', trait: 'Ascetic', description: 'Simplicity and self-denial practiced' },
  { d66: '5-2', trait: 'Materialistic', description: 'Wealth and possessions valued' },
  { d66: '5-3', trait: 'Environmentalist', description: 'Nature and ecology protected' },
  { d66: '5-4', trait: 'Expansionist', description: 'Growth and territorial ambition' },
  { d66: '5-5', trait: 'Fatalistic', description: 'Acceptance of destiny and fate' },
  { d66: '5-6', trait: 'Ambitious', description: 'Drive to improve and advance' },
  { d66: '6-1', trait: 'Conservative', description: 'Cautious and risk-averse' },
  { d66: '6-2', trait: 'Adventurous', description: 'Bold and willing to take chances' },
  { d66: '6-3', trait: 'Communitarian', description: 'Strong community bonds' },
  { d66: '6-4', trait: 'Nomadic', description: 'Mobile and adaptable lifestyle' },
  { d66: '6-5', trait: 'Settled', description: 'Attachment to place and roots' },
  { d66: '6-6', trait: 'Syncretic', description: 'Blending multiple traditions' },
];

/**
 * Economic Focus - D66 Table
 * Primary economic activities and trade orientation
 */
export const CULTURE_ECONOMIC_FOCUS: CultureTableEntry[] = [
  { d66: '1-1', trait: 'Agricultural', description: 'Farming and food production' },
  { d66: '1-2', trait: 'Industrial', description: 'Manufacturing and production' },
  { d66: '1-3', trait: 'Post-Industrial', description: 'Services and information' },
  { d66: '1-4', trait: 'Resource Extraction', description: 'Mining and harvesting' },
  { d66: '1-5', trait: 'Trading Hub', description: 'Commerce and exchange' },
  { d66: '1-6', trait: 'Financial', description: 'Banking and investment' },
  { d66: '2-1', trait: 'Technology Sector', description: 'Innovation and R&D' },
  { d66: '2-2', trait: 'Tourism', description: 'Hospitality and entertainment' },
  { d66: '2-3', trait: 'Military-Industrial', description: 'Defense production' },
  { d66: '2-4', trait: 'Subsistence', description: 'Basic needs only' },
  { d66: '2-5', trait: 'Artisanal', description: 'Crafts and specialty goods' },
  { d66: '2-6', trait: 'Intellectual Property', description: 'Ideas and patents' },
  { d66: '3-1', trait: 'Energy Production', description: 'Power generation' },
  { d66: '3-2', trait: 'Pharmaceutical', description: 'Medicine and biotech' },
  { d66: '3-3', trait: 'Entertainment', description: 'Media and arts' },
  { d66: '3-4', trait: 'Education', description: 'Training and knowledge' },
  { d66: '3-5', trait: 'Transportation', description: 'Shipping and logistics' },
  { d66: '3-6', trait: 'Communication', description: 'Networks and data' },
  { d66: '4-1', trait: 'Construction', description: 'Building and infrastructure' },
  { d66: '4-2', trait: 'Recycling', description: 'Waste processing' },
  { d66: '4-3', trait: 'Luxury Goods', description: 'High-end products' },
  { d66: '4-4', trait: 'Food Processing', description: 'Cuisine and beverages' },
  { d66: '4-5', trait: 'Textile', description: 'Clothing and fabrics' },
  { d66: '4-6', trait: 'Shipbuilding', description: 'Spacecraft construction' },
  { d66: '5-1', trait: 'Research', description: 'Scientific exploration' },
  { d66: '5-2', trait: 'Healthcare', description: 'Medical services' },
  { d66: '5-3', trait: 'Legal Services', description: 'Law and justice' },
  { d66: '5-4', trait: 'Security', description: 'Protection and defense' },
  { d66: '5-5', trait: 'Gambling', description: 'Gaming and chance' },
  { d66: '5-6', trait: 'Black Market', description: 'Underground economy' },
  { d66: '6-1', trait: 'Religious Services', description: 'Faith-based activities' },
  { d66: '6-2', trait: 'Genetic Engineering', description: 'Biological modification' },
  { d66: '6-3', trait: 'Cybernetics', description: 'Human-machine integration' },
  { d66: '6-4', trait: 'Virtual Reality', description: 'Simulated environments' },
  { d66: '6-5', trait: 'Terraforming', description: 'World modification' },
  { d66: '6-6', trait: 'Mixed Economy', description: 'Diversified activities' },
];

/**
 * Technology Attitude - D66 Table
 * How the culture views and uses technology
 */
export const CULTURE_TECH_ATTITUDE: CultureTableEntry[] = [
  { d66: '1-1', trait: 'Technophile', description: 'Embraces all new technology' },
  { d66: '1-2', trait: 'Technophobe', description: 'Rejects modern technology' },
  { d66: '1-3', trait: 'Balanced', description: 'Pragmatic tech adoption' },
  { d66: '1-4', trait: 'Selective', description: 'Careful technology choices' },
  { d66: '1-5', trait: 'Traditional Methods', description: 'Prefers old ways' },
  { d66: '1-6', trait: 'Cutting Edge', description: 'Always seeks latest tech' },
  { d66: '2-1', trait: 'Bio-focused', description: 'Biological over mechanical' },
  { d66: '2-2', trait: 'Cyber-focused', description: 'Digital and robotic preference' },
  { d66: '2-3', trait: 'Regulated', description: 'Strict tech controls' },
  { d66: '2-4', trait: 'Laissez-faire', description: 'Minimal tech restrictions' },
  { d66: '2-5', trait: 'Militarized', description: 'Tech for defense priority' },
  { d66: '2-6', trait: 'Medical Priority', description: 'Health tech emphasized' },
  { d66: '3-1', trait: 'Environmental Tech', description: 'Eco-friendly solutions' },
  { d66: '3-2', trait: 'Exploitative', description: 'Tech without regard for cost' },
  { d66: '3-3', trait: 'Artisanal Tech', description: 'Handcrafted devices' },
  { d66: '3-4', trait: 'Mass Production', description: 'Standardized tech' },
  { d66: '3-5', trait: 'Open Source', description: 'Shared technology' },
  { d66: '3-6', trait: 'Proprietary', description: 'Protected tech secrets' },
  { d66: '4-1', trait: 'AI Integration', description: 'Artificial intelligence common' },
  { d66: '4-2', trait: 'AI Prohibition', description: 'No artificial minds' },
  { d66: '4-3', trait: 'Augmentation', description: 'Human enhancement accepted' },
  { d66: '4-4', trait: 'Purist', description: 'Unmodified biology valued' },
  { d66: '4-5', trait: 'Automation', description: 'Robots do most work' },
  { d66: '4-6', trait: 'Manual Labor', description: 'Human work preferred' },
  { d66: '5-1', trait: 'Nanotech', description: 'Molecular-scale engineering' },
  { d66: '5-2', trait: 'Quantum Tech', description: 'Quantum computing focus' },
  { d66: '5-3', trait: 'Psionic', description: 'Mental powers developed' },
  { d66: '5-4', trait: 'Anti-Psionic', description: 'Mental powers forbidden' },
  { d66: '5-5', trait: 'Fusion Power', description: 'Clean energy abundant' },
  { d66: '5-6', trait: 'Renewable Focus', description: 'Sustainable energy only' },
  { d66: '6-1', trait: 'Archeotech', description: 'Ancient technology revered' },
  { d66: '6-2', trait: 'Experimental', description: 'Risky tech testing' },
  { d66: '6-3', trait: 'Conservative Tech', description: 'Proven methods only' },
  { d66: '6-4', trait: 'Scavenged', description: 'Salvaged and repurposed' },
  { d66: '6-5', trait: 'Imported', description: 'Tech from off-world' },
  { d66: '6-6', trait: 'Indigenous', description: 'Locally developed tech' },
];

/**
 * Get culture trait from D66 roll
 */
export function getCultureTrait(d66: string, category: 'social' | 'economic' | 'tech'): CultureTableEntry {
  let table: CultureTableEntry[];

  switch (category) {
    case 'social':
      table = CULTURE_SOCIAL_VALUES;
      break;
    case 'economic':
      table = CULTURE_ECONOMIC_FOCUS;
      break;
    case 'tech':
      table = CULTURE_TECH_ATTITUDE;
      break;
    default:
      table = CULTURE_SOCIAL_VALUES;
  }

  const entry = table.find((e) => e.d66 === d66);
  return entry || table[0];
}
