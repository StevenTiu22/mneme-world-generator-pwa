/**
 * Culture Generator
 *
 * Procedural culture generation using d66 tables following Mneme rules.
 * Generates cultural traits for worlds using three aspects:
 * - Social Values
 * - Economic Focus
 * - Technological Attitude
 */

import { v4 as uuidv4 } from 'uuid';
import { rollD66 } from '@/lib/dice';
import {
  type CultureTrait,
  type CultureData,
  type CultureDiceRolls,
  CultureCategory,
} from '@/models/world/culture';
import { getCultureTrait } from './worldTables';

/**
 * Generation options for culture
 */
export interface CultureGenerationOptions {
  worldId: string;
  advantage?: number;
  disadvantage?: number;
}

/**
 * Generate complete culture data using d66 rolls
 *
 * Rolls three d66 dice for:
 * 1. Social Values (how the culture organizes and values relationships)
 * 2. Economic Focus (primary economic activities and trade)
 * 3. Technological Attitude (how the culture views and uses technology)
 *
 * @param options - Generation configuration
 * @returns Complete CultureData with all traits
 */
export function generateCulture(options: CultureGenerationOptions): CultureData {
  const { worldId } = options;

  // Track dice rolls for transparency
  const diceRolls: CultureDiceRolls = {};
  const traits: CultureTrait[] = [];

  // 1. Roll for Social Values
  const socialRoll = rollD66();
  diceRolls.socialRoll = socialRoll;
  const socialEntry = getCultureTrait(socialRoll, 'social');
  traits.push({
    category: CultureCategory.SOCIAL,
    trait: socialEntry.trait,
    description: socialEntry.description,
    roll: socialRoll,
  });

  // 2. Roll for Economic Focus
  const economicRoll = rollD66();
  diceRolls.economicRoll = economicRoll;
  const economicEntry = getCultureTrait(economicRoll, 'economic');
  traits.push({
    category: CultureCategory.ECONOMIC,
    trait: economicEntry.trait,
    description: economicEntry.description,
    roll: economicRoll,
  });

  // 3. Roll for Technological Attitude
  const techRoll = rollD66();
  diceRolls.technologicalRoll = techRoll;
  const techEntry = getCultureTrait(techRoll, 'tech');
  traits.push({
    category: CultureCategory.TECHNOLOGICAL,
    trait: techEntry.trait,
    description: techEntry.description,
    roll: techRoll,
  });

  // Create complete culture data
  const now = new Date().toISOString();
  const cultureData: CultureData = {
    id: uuidv4(),
    worldId,
    traits,
    generationMethod: 'procedural',
    createdAt: now,
    updatedAt: now,
  };

  console.log('🎭 Generated culture:', {
    worldId,
    traits: traits.map(t => `${t.category}: ${t.trait}`),
    rolls: diceRolls,
  });

  return cultureData;
}

/**
 * Generate a single culture trait
 * Useful for re-rolling specific aspects
 */
export function generateCultureTrait(
  category: CultureCategory
): { trait: CultureTrait; roll: string } {
  const roll = rollD66();

  let categoryKey: 'social' | 'economic' | 'tech';
  switch (category) {
    case CultureCategory.SOCIAL:
      categoryKey = 'social';
      break;
    case CultureCategory.ECONOMIC:
      categoryKey = 'economic';
      break;
    case CultureCategory.TECHNOLOGICAL:
      categoryKey = 'tech';
      break;
    default:
      categoryKey = 'social';
  }

  const entry = getCultureTrait(roll, categoryKey);

  const trait: CultureTrait = {
    category,
    trait: entry.trait,
    description: entry.description,
    roll,
  };

  return { trait, roll };
}

/**
 * Get culture trait from a specific d66 roll
 * Useful for manual/custom trait selection
 */
export function getCultureTraitFromRoll(
  roll: string,
  category: CultureCategory
): CultureTrait {
  let categoryKey: 'social' | 'economic' | 'tech';
  switch (category) {
    case CultureCategory.SOCIAL:
      categoryKey = 'social';
      break;
    case CultureCategory.ECONOMIC:
      categoryKey = 'economic';
      break;
    case CultureCategory.TECHNOLOGICAL:
      categoryKey = 'tech';
      break;
    default:
      categoryKey = 'social';
  }

  const entry = getCultureTrait(roll, categoryKey);

  return {
    category,
    trait: entry.trait,
    description: entry.description,
    roll,
  };
}

/**
 * Format culture traits for display
 */
export function formatCultureTraits(traits: CultureTrait[]): string[] {
  return traits.map(t => `${t.trait}: ${t.description}`);
}

/**
 * Get all possible d66 values (1-1 through 6-6)
 * Useful for dropdowns/selection UIs
 */
export function getAllD66Values(): string[] {
  const values: string[] = [];
  for (let tens = 1; tens <= 6; tens++) {
    for (let ones = 1; ones <= 6; ones++) {
      values.push(`${tens}-${ones}`);
    }
  }
  return values;
}
