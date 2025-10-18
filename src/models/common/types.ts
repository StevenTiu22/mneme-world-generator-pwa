/** 
 * Common Model Types
 */

export const GenerationMethod = {
    PROCEDURAL: 'procedural',
    CUSTOM: 'custom',
} as const;

export type GenerationMethod = typeof GenerationMethod[keyof typeof GenerationMethod];

export const isValidGenerationMethod = (value: string): value is GenerationMethod => {
    return Object.values(GenerationMethod).includes(value as GenerationMethod);
}