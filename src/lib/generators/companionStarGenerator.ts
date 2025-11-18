import { roll2D6, roll3D6, type DiceRollResult } from '@/lib/dice';
import type { StellarClass, StellarGrade } from '@/models/stellar/types/enums';
import { GenerationMethod } from '@/models/common/types';
import { getStellarProperty } from '@/lib/db/queries/stellarQueries';
import {
  COMPANION_STAR_TABLE,
  STELLAR_CLASS_ORDER,
  getValidCompanionClasses,
  isCompanionSmallerThanPrimary,
  getOrbitalDistance,
} from './companionStarTables';

/**
 * Dice rolls for companion star generation
 */
export interface CompanionDiceRolls {
  companionRoll: number;      // 2D6 roll to determine if companion exists
  classRoll?: number;         // Roll used to determine stellar class
  gradeRoll?: number;         // Roll used to determine stellar grade
  orbitRoll: number;          // 3D6 roll for orbital distance
}

/**
 * Generated companion star data
 */
export interface GeneratedCompanion {
  id: string;
  name: string;
  stellarClass: StellarClass;
  stellarGrade: StellarGrade;
  orbitalDistance: number;    // in AU
  generationMethod: GenerationMethod;
  diceRolls: CompanionDiceRolls;
  mass?: number;              // in solar masses (from database)
  luminosity?: number;        // in solar luminosities (from database)
  radius?: number;            // in solar radii (from database)
  temperature?: number;       // in Kelvin (from database)
}

/**
 * Result of companion generation attempt
 */
export interface CompanionGenerationResult {
  companions: GeneratedCompanion[];
  totalRolls: number;         // Number of 2D6 rolls made
  maxReached: boolean;        // True if max companions (3) reached
}

/**
 * Roll 2D6 for companion star generation
 * Mneme rules: Compare to target number in COMPANION_STAR_TABLE
 * Rolling exactly 12 allows recursive roll for additional companions (max 3 total)
 *
 * @returns Dice roll result
 */
export function rollForCompanion(): DiceRollResult {
  return roll2D6();
}

/**
 * Check if companion roll succeeded
 * @param roll - 2D6 dice roll result
 * @param primaryClass - Primary star's stellar class
 * @returns true if companion should be generated
 */
export function isCompanionRollSuccessful(roll: DiceRollResult, primaryClass: StellarClass): boolean {
  const targetNumber = COMPANION_STAR_TABLE[primaryClass];
  return roll.total >= targetNumber;
}

/**
 * Check if another companion can be rolled (only on natural 12)
 * @param roll - 2D6 dice roll result
 * @returns true if can roll for additional companion
 */
export function canRollAnotherCompanion(roll: DiceRollResult): boolean {
  return roll.total === 12;
}

/**
 * Generate a random stellar grade (0-9)
 * @returns Random stellar grade
 */
function generateRandomGrade(): StellarGrade {
  // Grades 0-9, weighted towards middle values
  const roll = roll2D6();
  const grade = Math.floor((roll.total - 2) * 9 / 10); // Map 2-12 to 0-9
  return Math.max(0, Math.min(9, grade)) as StellarGrade;
}

/**
 * Generate companion stellar class and grade
 * Ensures companion is smaller than primary (later class or same class with higher grade)
 *
 * @param primaryClass - Primary star's stellar class
 * @param primaryGrade - Primary star's stellar grade
 * @returns Object with stellarClass and stellarGrade
 */
export function generateCompanionClassGrade(
  primaryClass: StellarClass,
  primaryGrade: StellarGrade
): { stellarClass: StellarClass; stellarGrade: StellarGrade } {
  const validClasses = getValidCompanionClasses(primaryClass);

  // Randomly select from valid classes
  const classIndex = Math.floor(Math.random() * validClasses.length);
  const stellarClass = validClasses[classIndex];

  let stellarGrade: StellarGrade;

  if (stellarClass === primaryClass) {
    // Same class: must have higher grade (dimmer)
    const validGrades = Array.from(
      { length: 9 - primaryGrade },
      (_, i) => (primaryGrade + 1 + i) as StellarGrade
    );

    if (validGrades.length === 0) {
      // Primary is already grade 9 in this class, move to next class
      const nextClassIndex = STELLAR_CLASS_ORDER.indexOf(primaryClass) + 1;
      if (nextClassIndex >= STELLAR_CLASS_ORDER.length) {
        throw new Error('Cannot generate companion: primary is M9');
      }
      return generateCompanionClassGrade(
        STELLAR_CLASS_ORDER[nextClassIndex],
        0 as StellarGrade
      );
    }

    stellarGrade = validGrades[Math.floor(Math.random() * validGrades.length)];
  } else {
    // Different class (cooler): any grade is valid
    stellarGrade = generateRandomGrade();
  }

  // Verify the companion is valid
  if (!isCompanionSmallerThanPrimary(stellarClass, stellarGrade, primaryClass, primaryGrade)) {
    throw new Error(
      `Generated invalid companion: ${stellarClass}${stellarGrade} for primary ${primaryClass}${primaryGrade}`
    );
  }

  return { stellarClass, stellarGrade };
}

/**
 * Generate orbital distance for companion star
 * Uses 3D6 roll on Orbit Distance Table (Mneme PDF page 15)
 *
 * @param primaryClass - Primary star's stellar class
 * @returns Object with orbital distance in AU and dice roll
 */
export function generateOrbitalDistance(primaryClass: StellarClass): {
  distance: number;
  roll: DiceRollResult;
} {
  const roll = roll3D6();
  const distance = getOrbitalDistance(roll.total, primaryClass);

  return { distance, roll };
}

/**
 * Generate a single companion star
 *
 * @param primaryClass - Primary star's stellar class
 * @param primaryGrade - Primary star's stellar grade
 * @param companionNumber - Number of this companion (1-3)
 * @param companionRoll - 2D6 roll that triggered this companion
 * @returns Generated companion star data
 */
export async function generateSingleCompanion(
  primaryClass: StellarClass,
  primaryGrade: StellarGrade,
  companionNumber: number,
  companionRoll: number
): Promise<GeneratedCompanion> {
  // Generate class and grade
  const { stellarClass, stellarGrade } = generateCompanionClassGrade(primaryClass, primaryGrade);

  // Generate orbital distance
  const { distance, roll: orbitRoll } = generateOrbitalDistance(primaryClass);

  // Fetch stellar properties from database
  const stellarProperty = await getStellarProperty(stellarClass, stellarGrade);

  // Generate unique ID
  const id = `companion-${Date.now()}-${companionNumber}`;

  // Generate unique incremental name
  const counterKey = 'companionNameCounter';
  const currentCounter = parseInt(localStorage.getItem(counterKey) || '0', 10);
  const nextNumber = currentCounter + 1;
  localStorage.setItem(counterKey, nextNumber.toString());
  const name = `Companion #${nextNumber}`;

  return {
    id,
    name,
    stellarClass,
    stellarGrade,
    orbitalDistance: distance,
    generationMethod: GenerationMethod.PROCEDURAL,
    diceRolls: {
      companionRoll,
      orbitRoll: orbitRoll.total,
    },
    mass: stellarProperty?.mass,
    luminosity: stellarProperty?.luminosity,
    radius: stellarProperty?.radius,
    temperature: stellarProperty?.temperature,
  };
}

/**
 * Generate companion stars for a primary star
 * Follows Mneme rules for companion generation (PDF page 14)
 *
 * @param primaryClass - Primary star's stellar class
 * @param primaryGrade - Primary star's stellar grade
 * @returns Companion generation result with all generated companions
 */
export async function generateCompanionStars(
  primaryClass: StellarClass,
  primaryGrade: StellarGrade
): Promise<CompanionGenerationResult> {
  const companions: GeneratedCompanion[] = [];
  const maxCompanions = 3;
  let totalRolls = 0;
  let maxReached = false;

  while (companions.length < maxCompanions) {
    // Roll for companion
    const roll = rollForCompanion();
    totalRolls++;

    // Check if companion exists
    if (!isCompanionRollSuccessful(roll, primaryClass)) {
      // Failed to generate companion, stop
      break;
    }

    // Generate companion
    try {
      const companion = await generateSingleCompanion(
        primaryClass,
        primaryGrade,
        companions.length + 1,
        roll.total
      );
      companions.push(companion);
    } catch (error) {
      console.error('Failed to generate companion:', error);
      break;
    }

    // Check if we can roll for another companion (only on natural 12)
    if (!canRollAnotherCompanion(roll)) {
      break;
    }

    // Check if we've reached max companions
    if (companions.length >= maxCompanions) {
      maxReached = true;
      break;
    }
  }

  return {
    companions,
    totalRolls,
    maxReached,
  };
}

/**
 * Validate that a companion is smaller than the primary star
 * Useful for manual companion creation
 *
 * @param companionClass - Companion stellar class
 * @param companionGrade - Companion stellar grade
 * @param primaryClass - Primary stellar class
 * @param primaryGrade - Primary stellar grade
 * @returns true if valid, false otherwise
 */
export function validateCompanion(
  companionClass: StellarClass,
  companionGrade: StellarGrade,
  primaryClass: StellarClass,
  primaryGrade: StellarGrade
): boolean {
  return isCompanionSmallerThanPrimary(companionClass, companionGrade, primaryClass, primaryGrade);
}
