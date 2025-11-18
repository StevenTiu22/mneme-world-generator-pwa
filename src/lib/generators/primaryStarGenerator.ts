import { roll5D6, type DiceRollResult } from '@/lib/dice';
import type { StellarClass, StellarGrade } from '@/models/stellar/types/enums';
import { GenerationMethod } from '@/models/common/types';
import type { StarData, StarDiceRolls } from '@/models/stellar/types/interface';
import { getStellarProperty } from '@/lib/db/queries/stellarQueries';
import { generateStarId } from '@/lib/db/queries/starQueries';

/**
 * Stellar class distribution based on 5D6 roll (5-30)
 * Approximates stellar class frequency with preference for G/K/M stars
 */
const STELLAR_CLASS_TABLE: Array<{ minRoll: number; maxRoll: number; class: StellarClass }> = [
  { minRoll: 5, maxRoll: 7, class: 'O' },    // Hottest, rarest (3/26 = 11.5%)
  { minRoll: 8, maxRoll: 10, class: 'B' },   // (3/26 = 11.5%)
  { minRoll: 11, maxRoll: 13, class: 'A' },  // (3/26 = 11.5%)
  { minRoll: 14, maxRoll: 17, class: 'F' },  // (4/26 = 15.4%)
  { minRoll: 18, maxRoll: 22, class: 'G' },  // Sun-like, most common (5/26 = 19.2%)
  { minRoll: 23, maxRoll: 26, class: 'K' },  // (4/26 = 15.4%)
  { minRoll: 27, maxRoll: 30, class: 'M' },  // Coolest, common (4/26 = 15.4%)
];

/**
 * Stellar grade distribution based on 5D6 roll (5-30)
 * Maps to grades 0-9 with bias toward middle values
 */
function rollToGrade(roll: number): StellarGrade {
  // Map 5-30 to 0-9 with bias toward middle grades
  if (roll <= 8) return 0 as StellarGrade;
  if (roll <= 11) return 1 as StellarGrade;
  if (roll <= 14) return 2 as StellarGrade;
  if (roll <= 16) return 3 as StellarGrade;
  if (roll <= 18) return 4 as StellarGrade;
  if (roll <= 20) return 5 as StellarGrade;
  if (roll <= 22) return 6 as StellarGrade;
  if (roll <= 25) return 7 as StellarGrade;
  if (roll <= 28) return 8 as StellarGrade;
  return 9 as StellarGrade;
}

/**
 * Roll for stellar class using 5D6
 * @returns Object with stellar class and dice roll result
 */
export function rollForStellarClass(): { class: StellarClass; roll: DiceRollResult } {
  const roll = roll5D6();

  // Find matching stellar class from table
  const entry = STELLAR_CLASS_TABLE.find(
    (e) => roll.total >= e.minRoll && roll.total <= e.maxRoll
  );

  if (!entry) {
    // Fallback to G-class if roll is out of range (shouldn't happen)
    console.warn(`Unexpected roll ${roll.total} for stellar class, defaulting to G`);
    return { class: 'G', roll };
  }

  return { class: entry.class, roll };
}

/**
 * Roll for stellar grade using 5D6
 * @returns Object with stellar grade and dice roll result
 */
export function rollForStellarGrade(): { grade: StellarGrade; roll: DiceRollResult } {
  const roll = roll5D6();
  const grade = rollToGrade(roll.total);

  return { grade, roll };
}

/**
 * Generate a unique incremental star name
 * Uses timestamp to ensure uniqueness across sessions
 * Pattern: "Star #[number]" where number increments
 * @returns Generated star name
 */
export function generateStarName(): string {
  // Get current counter from localStorage, or start at 1
  const counterKey = 'starNameCounter';
  const currentCounter = parseInt(localStorage.getItem(counterKey) || '0', 10);
  const nextNumber = currentCounter + 1;

  // Save updated counter
  localStorage.setItem(counterKey, nextNumber.toString());

  return `Star #${nextNumber}`;
}

/**
 * Generate a complete primary star using procedural dice-based generation
 * Follows Mneme world generation mechanics
 *
 * @returns Promise resolving to complete StarData object
 */
export async function generatePrimaryStar(): Promise<StarData> {
  // Roll for stellar class
  const { class: stellarClass, roll: classRoll } = rollForStellarClass();

  // Roll for stellar grade
  const { grade: stellarGrade, roll: gradeRoll } = rollForStellarGrade();

  // Generate star name
  const name = generateStarName();

  // Generate unique ID
  const id = generateStarId();

  // Get stellar properties from database for validation
  const stellarProperty = await getStellarProperty(stellarClass, stellarGrade);

  if (!stellarProperty) {
    throw new Error(
      `Failed to query stellar properties for ${stellarClass}${stellarGrade}`
    );
  }

  // Track dice rolls
  const diceRolls: StarDiceRolls = {
    classRoll: classRoll.total,
    gradeRoll: gradeRoll.total,
  };

  // Create complete StarData object
  const now = new Date().toISOString();
  const starData: StarData = {
    id,
    name,
    stellarClass,
    stellarGrade,
    generationMethod: GenerationMethod.PROCEDURAL,
    diceRolls,
    createdAt: now,
    updatedAt: now,
    createdBy: 'user',
  };

  console.log(
    `🎲 Generated primary star: ${name} (${stellarClass}${stellarGrade})`,
    `\n   Class roll: ${classRoll.total} (dice: ${classRoll.dice.join(', ')})`,
    `\n   Grade roll: ${gradeRoll.total} (dice: ${gradeRoll.dice.join(', ')})`
  );

  return starData;
}
