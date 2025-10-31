/**
 * World development levels and modifiers based on Mneme World Generator
 * Reference: Pages 27-29 of the Mneme documentation
 */

export const WorldDevelopmentLevel = {
  UNDERDEVELOPED: 'underdeveloped',
  DEVELOPING: 'developing',
  MATURE: 'mature',
  DEVELOPED: 'developed',
  WELL_DEVELOPED: 'well_developed',
  VERY_DEVELOPED: 'very_developed',
} as const;

export type WorldDevelopmentLevel = typeof WorldDevelopmentLevel[keyof typeof WorldDevelopmentLevel];

/**
 * World development characteristics and mechanical effects
 */
export interface WorldDevelopmentInfo {
  level: WorldDevelopmentLevel;
  label: string;
  description: string;
  effects: string[];
  governanceModifier: string;
  portFeeMultiplier: number;
  minTechLevel?: number;
}

/**
 * World development levels with their mechanical effects
 */
export const WORLD_DEVELOPMENT_LEVELS: Record<WorldDevelopmentLevel, WorldDevelopmentInfo> = {
  [WorldDevelopmentLevel.UNDERDEVELOPED]: {
    level: WorldDevelopmentLevel.UNDERDEVELOPED,
    label: 'Underdeveloped',
    description: 'Minimal infrastructure, struggling economy, limited services',
    effects: [
      'DM-2 to all norm checks',
      'Disadvantage+2 to governance checks',
      'Limited medical facilities',
      'Poor communication networks',
    ],
    governanceModifier: 'Dis+2',
    portFeeMultiplier: 0.5,
  },
  [WorldDevelopmentLevel.DEVELOPING]: {
    level: WorldDevelopmentLevel.DEVELOPING,
    label: 'Developing',
    description: 'Growing infrastructure, emerging economy, basic services',
    effects: [
      'DM-1 to all norm checks',
      'Disadvantage+1 to governance checks',
      'Basic medical facilities',
      'Functional communication networks',
    ],
    governanceModifier: 'Dis+1',
    portFeeMultiplier: 1,
  },
  [WorldDevelopmentLevel.MATURE]: {
    level: WorldDevelopmentLevel.MATURE,
    label: 'Mature',
    description: 'Established infrastructure, stable economy, reliable services',
    effects: [
      'Reliable financial transactions',
      'Standard governance',
      'Good medical facilities',
      'Efficient communication networks',
    ],
    governanceModifier: 'Standard',
    portFeeMultiplier: 2,
    minTechLevel: 8,
  },
  [WorldDevelopmentLevel.DEVELOPED]: {
    level: WorldDevelopmentLevel.DEVELOPED,
    label: 'Developed',
    description: 'Advanced infrastructure, prosperous economy, excellent services',
    effects: [
      'Advantage+1 to governance checks',
      'Advanced medical facilities',
      'High-speed communication networks',
      'Strong rule of law',
    ],
    governanceModifier: 'Adv+1',
    portFeeMultiplier: 5,
    minTechLevel: 10,
  },
  [WorldDevelopmentLevel.WELL_DEVELOPED]: {
    level: WorldDevelopmentLevel.WELL_DEVELOPED,
    label: 'Well Developed',
    description: 'Cutting-edge infrastructure, wealthy economy, premium services',
    effects: [
      'Advantage+2 to governance checks',
      'State-of-the-art medical facilities',
      'Instantaneous global communications',
      'Highly efficient bureaucracy',
    ],
    governanceModifier: 'Adv+2',
    portFeeMultiplier: 10,
    minTechLevel: 12,
  },
  [WorldDevelopmentLevel.VERY_DEVELOPED]: {
    level: WorldDevelopmentLevel.VERY_DEVELOPED,
    label: 'Very Developed',
    description: 'Futuristic infrastructure, post-scarcity economy, unparalleled services',
    effects: [
      'Advantage+3 to governance checks',
      'Perfect medical care (life extension available)',
      'Quantum-encrypted global networks',
      'Near-utopian governance',
    ],
    governanceModifier: 'Adv+3',
    portFeeMultiplier: 20,
    minTechLevel: 14,
  },
};

/**
 * Habitability modifier categories
 */
export interface HabitabilityModifiers {
  atmosphericPressure: number;
  temperature: number;
  hazard: number;
  hazardIntensity: number;
  biochemicalResources: number;
  mass: number;
  techLevel: number;
}

/**
 * Calculate total habitability score from modifiers
 */
export function calculateHabitabilityScore(modifiers: Partial<HabitabilityModifiers>): number {
  const {
    atmosphericPressure = 0,
    temperature = 0,
    hazard = 0,
    hazardIntensity = 0,
    biochemicalResources = 0,
    mass = 0,
    techLevel = 0,
  } = modifiers;

  return (
    atmosphericPressure +
    temperature +
    hazard +
    hazardIntensity +
    biochemicalResources +
    mass +
    techLevel
  );
}

/**
 * Get habitability rating based on score
 */
export function getHabitabilityRating(score: number): {
  rating: string;
  color: string;
  description: string;
} {
  if (score >= 8) {
    return {
      rating: 'Paradise',
      color: 'text-green-600 dark:text-green-400',
      description: 'Ideal conditions for human habitation',
    };
  } else if (score >= 4) {
    return {
      rating: 'Excellent',
      color: 'text-green-600 dark:text-green-400',
      description: 'Highly favorable conditions',
    };
  } else if (score >= 0) {
    return {
      rating: 'Good',
      color: 'text-blue-600 dark:text-blue-400',
      description: 'Favorable conditions with minor challenges',
    };
  } else if (score >= -4) {
    return {
      rating: 'Marginal',
      color: 'text-yellow-600 dark:text-yellow-400',
      description: 'Habitable but challenging',
    };
  } else if (score >= -8) {
    return {
      rating: 'Harsh',
      color: 'text-orange-600 dark:text-orange-400',
      description: 'Difficult conditions requiring technology',
    };
  } else {
    return {
      rating: 'Hostile',
      color: 'text-red-600 dark:text-red-400',
      description: 'Extremely hostile environment',
    };
  }
}

/**
 * Determine world development level based on tech level and habitability
 */
export function determineWorldDevelopment(
  techLevel: number,
  habitabilityScore: number
): WorldDevelopmentLevel {
  // Higher tech levels and better habitability = more developed
  const developmentScore = techLevel + Math.max(0, habitabilityScore);

  if (developmentScore >= 20) return WorldDevelopmentLevel.VERY_DEVELOPED;
  if (developmentScore >= 16) return WorldDevelopmentLevel.WELL_DEVELOPED;
  if (developmentScore >= 12) return WorldDevelopmentLevel.DEVELOPED;
  if (developmentScore >= 9) return WorldDevelopmentLevel.MATURE;
  if (developmentScore >= 6) return WorldDevelopmentLevel.DEVELOPING;
  return WorldDevelopmentLevel.UNDERDEVELOPED;
}
