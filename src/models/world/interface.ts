/**
 * World data interfaces for Mneme World Generator
 * Represents complete world/planet data with generation metadata
 */

import { GenerationMethod } from '@/models/common/types';
import { WorldDevelopmentLevel } from './types';

/**
 * World type classification
 */
export const WorldType = {
  HABITAT: 'habitat',
  TERRESTRIAL: 'terrestrial',
  DWARF: 'dwarf',
} as const;

export type WorldType = typeof WorldType[keyof typeof WorldType];

/**
 * Composition types for dwarf worlds
 */
export const DwarfComposition = {
  CARBONACEOUS: 'carbonaceous',
  SILICACEOUS: 'silicaceous',
  METALLIC: 'metallic',
  OTHER: 'other',
} as const;

export type DwarfComposition = typeof DwarfComposition[keyof typeof DwarfComposition];

/**
 * Dice rolls used to generate a world
 * Tracks all procedural generation rolls for transparency
 */
export interface WorldDiceRolls {
  // Basic properties
  typeRoll?: number;
  sizeRoll?: number;
  gravityRoll?: number;
  compositionRoll?: number;

  // Habitability rolls
  atmosphereRoll?: number;
  temperatureRoll?: number;
  hazardTypeRoll?: number;
  hazardIntensityRoll?: number;
  resourceRoll?: number;

  // Inhabitants rolls
  wealthRoll?: number;
  powerStructureRoll?: number;
  governanceRoll?: number;
  sourceOfPowerRoll?: number;

  // Culture rolls (D66 results as strings like "3-5")
  cultureRolls?: string[];
}

/**
 * Complete world data structure
 * Represents a planet or habitat with all properties and metadata
 */
export interface WorldData {
  // Identity
  id: string;
  name: string;
  starSystemId: string; // Link to parent star system

  // Basic properties
  type: WorldType;
  size: number; // 2D6 roll result or custom value
  mass: number; // In Earth masses
  gravity: number; // Surface gravity in G

  // Composition (for dwarf worlds)
  composition?: DwarfComposition;

  // Habitability properties (Milestone 4)
  atmosphericPressure?: string; // None, Trace, Thin, Standard, Dense, Very Dense
  temperature?: string; // Frozen, Cold, Temperate, Hot, Very Hot
  hazardType?: string; // None, Seismic, Volcanic, Weather, Radiation, etc.
  hazardIntensity?: number; // 1-5 scale if hazard exists
  biochemicalResources?: string; // None, Poor, Moderate, Rich, Very Rich
  habitabilityScore?: number; // Calculated total

  // Inhabitants properties (Milestone 4)
  population?: number; // Total inhabitants
  wealth?: number; // 2D6 + modifiers
  powerStructure?: string; // Autocracy, Oligarchy, Democracy, etc.
  governance?: string; // Chaotic, Weak, Moderate, Strong, Totalitarian
  sourceOfPower?: string; // Military, Religious, Corporate, etc.

  // Starport properties (Milestone 4)
  portValueScore?: number; // PVS = (Hab/4) + (TL-7) + Wealth + Development
  starportClass?: string; // A, B, C, D, E, or X (none)
  starportFeatures?: string[];

  // Culture properties (Milestone 4)
  culturalTraits?: string[]; // From D66 culture table

  // Development
  techLevel: number; // From world context page
  developmentLevel?: WorldDevelopmentLevel;

  // Generation metadata
  generationMethod: GenerationMethod;
  diceRolls?: WorldDiceRolls;

  // Timestamps
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
  createdBy: string; // User identifier
}

/**
 * Type guard for WorldType
 */
export function isValidWorldType(value: unknown): value is WorldType {
  return (
    typeof value === 'string' &&
    Object.values(WorldType).includes(value as WorldType)
  );
}

/**
 * Type guard for DwarfComposition
 */
export function isValidDwarfComposition(value: unknown): value is DwarfComposition {
  return (
    typeof value === 'string' &&
    Object.values(DwarfComposition).includes(value as DwarfComposition)
  );
}

/**
 * Helper function to get all world types
 */
export function getAllWorldTypes(): WorldType[] {
  return Object.values(WorldType);
}

/**
 * Helper function to get all dwarf composition types
 */
export function getAllDwarfCompositions(): DwarfComposition[] {
  return Object.values(DwarfComposition);
}
