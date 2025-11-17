import type { StellarClass, StellarGrade } from './enums';

import type { GenerationMethod } from '@/models/common/types';

export interface ZoneRange {
    innerBoundary: number;
    outerBoundary: number;
}

export interface StellarZones {
    infernal: ZoneRange;
    hot: ZoneRange;
    conservativeHabitable: ZoneRange;
    cold: ZoneRange;
    outer: ZoneRange;
    frostline: number;
}

export interface StarDiceRolls {
    classRoll?: number;
    gradeRoll?: number;
    companionRoll?: number;
    orbitRoll?: number;
    orbitDecisionRoll?: number;
}

export interface StarData {
    id: string;
    name: string;
    uiaName?: string;
    stellarClass: StellarClass;
    stellarGrade: StellarGrade;
    generationMethod: GenerationMethod;
    diceRolls?: StarDiceRolls;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
}

/**
 * StarSystem - Groups a primary star with its companion stars
 * This represents a complete star system that can be saved/exported
 */
export interface StarSystem {
    id: string;
    name: string;
    primaryStar: StarData;
    companionStars: StarData[];
    createdAt: string;
    updatedAt: string;
    createdBy: string;
}

/**
 * Export metadata for star system files
 * Includes version info for future compatibility
 */
export interface StarSystemExport {
    version: string;
    exportDate: string;
    system: StarSystem;
}