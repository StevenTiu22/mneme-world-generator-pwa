/**
 * Starport data types for Mneme World Generator
 * Represents starport facilities, classification, and base presence
 */

/**
 * Starport classification (Traveller-style)
 * X = No starport
 * E = Frontier port (minimal)
 * D = Poor port (limited services)
 * C = Routine port (standard services)
 * B = Good port (excellent services)
 * A = Excellent port (best services)
 */
export type StarportClass = 'X' | 'E' | 'D' | 'C' | 'B' | 'A';

/**
 * Base presence types
 */
export const BaseType = {
  NAVAL: 'naval',
  SCOUT: 'scout',
  PIRATE: 'pirate',
  RESEARCH: 'research',
  MILITARY: 'military',
} as const;

export type BaseType = typeof BaseType[keyof typeof BaseType];

/**
 * Base presence information
 */
export interface BasePresence {
  type: BaseType;
  present: boolean;
  roll?: number; // The 2D6 roll result
}

/**
 * Complete starport data
 */
export interface StarportData {
  id: string;
  worldId: string; // Link to parent world

  // Classification
  starportClass: StarportClass;
  portValueScore: number; // PVS calculation result

  // Facilities and capabilities
  label: string; // e.g., "Excellent Port"
  description: string;
  capabilities: string[];

  // Base presence
  bases: BasePresence[];

  // Generation metadata
  generationMethod: 'procedural' | 'custom';
  diceRolls?: StarportDiceRolls;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

/**
 * Dice rolls used to generate starport
 */
export interface StarportDiceRolls {
  navalBaseRoll?: number;
  scoutBaseRoll?: number;
  pirateBaseRoll?: number;
}

/**
 * Type guard for StarportClass
 */
export function isValidStarportClass(value: unknown): value is StarportClass {
  return (
    typeof value === 'string' &&
    ['X', 'E', 'D', 'C', 'B', 'A'].includes(value)
  );
}

/**
 * Type guard for BaseType
 */
export function isValidBaseType(value: unknown): value is BaseType {
  return (
    typeof value === 'string' &&
    Object.values(BaseType).includes(value as BaseType)
  );
}

/**
 * Get all starport classes
 */
export function getAllStarportClasses(): StarportClass[] {
  return ['X', 'E', 'D', 'C', 'B', 'A'];
}

/**
 * Get all base types
 */
export function getAllBaseTypes(): BaseType[] {
  return Object.values(BaseType);
}

/**
 * Get starport class label
 */
export function getStarportClassLabel(starportClass: StarportClass): string {
  const labels: Record<StarportClass, string> = {
    'X': 'No Starport',
    'E': 'Frontier Port',
    'D': 'Poor Port',
    'C': 'Routine Port',
    'B': 'Good Port',
    'A': 'Excellent Port',
  };
  return labels[starportClass];
}

/**
 * Get starport class color scheme for UI
 */
export function getStarportClassColor(starportClass: StarportClass): {
  bg: string;
  border: string;
  badge: string;
  text: string;
} {
  const colors: Record<StarportClass, { bg: string; border: string; badge: string; text: string }> = {
    'X': {
      bg: 'bg-gray-50 dark:bg-gray-950/30',
      border: 'border-gray-200 dark:border-gray-900',
      badge: 'border-gray-600 text-gray-600',
      text: 'text-gray-600',
    },
    'E': {
      bg: 'bg-red-50 dark:bg-red-950/30',
      border: 'border-red-200 dark:border-red-900',
      badge: 'border-red-600 text-red-600',
      text: 'text-red-600',
    },
    'D': {
      bg: 'bg-orange-50 dark:bg-orange-950/30',
      border: 'border-orange-200 dark:border-orange-900',
      badge: 'border-orange-600 text-orange-600',
      text: 'text-orange-600',
    },
    'C': {
      bg: 'bg-yellow-50 dark:bg-yellow-950/30',
      border: 'border-yellow-200 dark:border-yellow-900',
      badge: 'border-yellow-600 text-yellow-600',
      text: 'text-yellow-600',
    },
    'B': {
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      border: 'border-blue-200 dark:border-blue-900',
      badge: 'border-blue-600 text-blue-600',
      text: 'text-blue-600',
    },
    'A': {
      bg: 'bg-green-50 dark:bg-green-950/30',
      border: 'border-green-200 dark:border-green-900',
      badge: 'border-green-600 text-green-600',
      text: 'text-green-600',
    },
  };
  return colors[starportClass];
}
