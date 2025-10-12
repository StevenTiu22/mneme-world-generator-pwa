// Stellar classification types
export type StellarClass = 'O' | 'B' | 'A' | 'F' | 'G' | 'K' | 'M';

export type StellarGrade = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

// Color representation for UI
export type StellarColor = 
  | 'blue'           // O
  | 'blue-white'     // B
  | 'white'          // A, F
  | 'yellow-white'   // G
  | 'yellow'         // G
  | 'orange'         // K
  | 'red';           // M

// Primary star data structure
export interface Star {
  name: string;
  class: StellarClass;
  grade: StellarGrade;
  mass: number;        // In solar masses (M☉)
  luminosity: number;  // In solar luminosities (L☉)
  color: StellarColor;
}

// Companion star with orbital data
export interface CompanionStar extends Star {
  orbitDistance: number;  // In AU
  orbitDistanceRange: string;  // e.g., "50 to <100"
}

// System zones with boundaries
export interface SystemZones {
  infernalZone: {
    start: number;  // Always 0
    end: number;    // √L☉ × 0.4 AU
  };
  hotZone: {
    start: number;  // √L☉ × 0.4 AU
    end: number;    // √L☉ × 0.8 AU
  };
  conservativeHabitableZone: {
    start: number;  // √L☉ × 0.8 AU
    end: number;    // √L☉ × 1.2 AU
  };
  coldZone: {
    start: number;  // √L☉ × 1.2 AU
    end: number;    // √L☉ × 4.85 AU
  };
  outerSolarSystem: {
    start: number;  // √L☉ × 4.85 AU
    end: null;      // Extends indefinitely
  };
}

export interface StarSystemData {
  primary: Star;
  companions: CompanionStar[];
  zones: SystemZones;
  techLevel?: number;
}

// Generation settings
export interface StarGenerationSettings {
  mode: 'random' | 'manual';
  allowCompanions: boolean;
  applyModifiers: boolean;  // For F/G star advantages
}

// For dice rolling results
export interface DiceRollResult {
  total: number;
  dice: number[];
  advantage?: number;
  disadvantage?: number;
}