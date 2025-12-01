/**
 * Culture data types for Mneme World Generator
 * Represents cultural traits generated using the d66 system
 */

/**
 * Culture aspect categories from Mneme documentation
 */
export const CultureCategory = {
  SOCIAL: 'social',
  ECONOMIC: 'economic',
  TECHNOLOGICAL: 'technological',
} as const;

export type CultureCategory = typeof CultureCategory[keyof typeof CultureCategory];

/**
 * Individual culture trait
 */
export interface CultureTrait {
  category: CultureCategory;
  trait: string;
  description: string;
  roll: string; // d66 result like "3-5"
}

/**
 * Complete culture data for a world
 */
export interface CultureData {
  id: string;
  worldId: string; // Link to parent world
  traits: CultureTrait[];
  generationMethod: 'procedural' | 'custom';
  createdAt: string;
  updatedAt: string;
}

/**
 * Dice rolls used to generate culture
 */
export interface CultureDiceRolls {
  socialRoll?: string; // d66 result
  economicRoll?: string; // d66 result
  technologicalRoll?: string; // d66 result
}

/**
 * Type guard for CultureCategory
 */
export function isValidCultureCategory(value: unknown): value is CultureCategory {
  return (
    typeof value === 'string' &&
    Object.values(CultureCategory).includes(value as CultureCategory)
  );
}

/**
 * Helper function to get all culture categories
 */
export function getAllCultureCategories(): CultureCategory[] {
  return Object.values(CultureCategory);
}

/**
 * Create a default culture trait
 */
export function createDefaultCultureTrait(
  category: CultureCategory,
  roll: string = '3-5'
): CultureTrait {
  return {
    category,
    trait: 'Unknown',
    description: 'Cultural trait not yet determined',
    roll,
  };
}
