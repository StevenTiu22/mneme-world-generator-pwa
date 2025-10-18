// Types and enums
export const StarType = {
    PRIMARY: 'primary',
    COMPANION: 'companion',
} as const;

export type StarType = typeof StarType[keyof typeof StarType];

export const StellarClass = {
    O: 'O',
    B: 'B',
    A: 'A',
    F: 'F',
    G: 'G',
    K: 'K',
    M: 'M',
} as const;

export type StellarClass = typeof StellarClass[keyof typeof StellarClass];

export const StellarGrade = {
    GRADE_0: 0,
    GRADE_1: 1,
    GRADE_2: 2,
    GRADE_3: 3,
    GRADE_4: 4,
    GRADE_5: 5,
    GRADE_6: 6,
    GRADE_7: 7,
    GRADE_8: 8,
    GRADE_9: 9,
} as const;

export type StellarGrade = typeof StellarGrade[keyof typeof StellarGrade];

export const YerkesLuminosityGrade = {
    ZERO_IA_PLUS: '0/Ia+',
    IA: 'Ia',
    IAB: 'Iab',
    IB: 'Ib',
    II: 'II',
    III: 'III',
    IV: 'IV',
    V: 'V',
    sd: 'sd',
    VI: 'VI',
    C: 'c',
}

export type YerkesLuminosityGrade = typeof YerkesLuminosityGrade[keyof typeof YerkesLuminosityGrade];

// =====================
// Utility Functions
// =====================

export const getAllStellarClasses = (): StellarClass[] => {
    return Object.values(StellarClass);
};

export const getAllStellarGrades = (): StellarGrade[] => {
    return Object.values(StellarGrade);
};

export const isValidStellarClass = (value: string): value is StellarClass => {
    return Object.values(StellarClass).includes(value as StellarClass);
}

export const isValidStellarGrade = (value: number): value is StellarGrade => {
    return Object.values(StellarGrade).includes(value as StellarGrade);
}

export const isValidYerkesLuminosityGrade = (value: string): value is YerkesLuminosityGrade => {
    return Object.values(YerkesLuminosityGrade).includes(value as YerkesLuminosityGrade);
}

