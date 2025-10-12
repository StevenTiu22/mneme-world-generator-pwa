import type { DiceRollResult } from '@/lib/types/star-system';

/**
 * Roll a single die with specified number of sides
 */
function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

/**
 * Roll multiple dice and return array of results
 */
function rollMultipleDice(count: number, sides: number): number[] {
  return Array.from({ length: count }, () => rollDie(sides));
}

/**
 * Apply advantage/disadvantage rules from Mneme (page 11 of PDF)
 * 
 * Advantage: Roll extra dice, drop lowest
 * Disadvantage: Roll extra dice, drop highest
 * 
 * @param dice - Base number of dice to roll
 * @param sides - Number of sides on each die
 * @param advantage - Number of additional dice to roll and drop lowest
 * @param disadvantage - Number of additional dice to roll and drop highest
 */
function rollWithAdvantage(
  dice: number,
  sides: number,
  advantage: number = 0,
  disadvantage: number = 0
): DiceRollResult {
  // Net advantage/disadvantage (they cancel each other)
  const netAdvantage = advantage - disadvantage;
  
  if (netAdvantage === 0) {
    // Standard roll, no advantage/disadvantage
    const rolls = rollMultipleDice(dice, sides);
    return {
      total: rolls.reduce((sum, val) => sum + val, 0),
      dice: rolls,
    };
  }
  
  if (netAdvantage > 0) {
    // Roll with advantage: drop lowest dice
    const totalDice = dice + netAdvantage;
    const rolls = rollMultipleDice(totalDice, sides);
    
    // Sort to find lowest values
    const sorted = [...rolls].sort((a, b) => a - b);
    
    // Keep only the highest 'dice' number of rolls
    const kept = sorted.slice(netAdvantage);
    
    return {
      total: kept.reduce((sum, val) => sum + val, 0),
      dice: rolls,
      advantage: netAdvantage,
    };
  } else {
    // Roll with disadvantage: drop highest dice
    const totalDice = dice + Math.abs(netAdvantage);
    const rolls = rollMultipleDice(totalDice, sides);
    
    // Sort to find highest values
    const sorted = [...rolls].sort((a, b) => b - a);
    
    // Keep only the lowest 'dice' number of rolls
    const kept = sorted.slice(Math.abs(netAdvantage));
    
    return {
      total: kept.reduce((sum, val) => sum + val, 0),
      dice: rolls,
      disadvantage: Math.abs(netAdvantage),
    };
  }
}

/**
 * Roll 2D6
 */
export function roll2D6(advantage: number = 0, disadvantage: number = 0): DiceRollResult {
  return rollWithAdvantage(2, 6, advantage, disadvantage);
}

/**
 * Roll 3D6
 */
export function roll3D6(advantage: number = 0, disadvantage: number = 0): DiceRollResult {
  return rollWithAdvantage(3, 6, advantage, disadvantage);
}

/**
 * Roll 5D6 (used for stellar class and grade)
 */
export function roll5D6(advantage: number = 0, disadvantage: number = 0): DiceRollResult {
  return rollWithAdvantage(5, 6, advantage, disadvantage);
}

/**
 * Roll D66 (roll 2d6, first die is tens, second is ones)
 * Returns string like "1-1", "3-5", "6-6", etc.
 */
export function rollD66(): string {
  const tens = rollDie(6);
  const ones = rollDie(6);
  return `${tens}-${ones}`;
}

/**
 * Roll 1D6 (single die)
 */
export function roll1D6(): number {
  return rollDie(6);
}

/**
 * Roll custom dice (for special cases)
 */
export function rollCustom(count: number, sides: number): number[] {
  return rollMultipleDice(count, sides);
}

/**
 * Get just the total from a 2D6 roll (convenience function)
 */
export function roll2D6Total(advantage: number = 0, disadvantage: number = 0): number {
  return roll2D6(advantage, disadvantage).total;
}

/**
 * Get just the total from a 3D6 roll (convenience function)
 */
export function roll3D6Total(advantage: number = 0, disadvantage: number = 0): number {
  return roll3D6(advantage, disadvantage).total;
}

/**
 * Get just the total from a 5D6 roll (convenience function)
 */
export function roll5D6Total(advantage: number = 0, disadvantage: number = 0): number {
  return roll5D6(advantage, disadvantage).total;
}