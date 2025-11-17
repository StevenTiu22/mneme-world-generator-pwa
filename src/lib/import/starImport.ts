/**
 * Star System Import Utilities
 *
 * Provides import functionality for star systems from JSON and CSV files.
 * Includes validation to ensure data integrity.
 */

import type {
  StarData,
  StarSystem,
  StarSystemExport,
} from '@/models/stellar/types/interface';
import {
  isValidStellarClass,
  isValidStellarGrade,
} from '@/models/stellar/types/enums';
import { isValidGenerationMethod } from '@/models/common/types';

// =====================
// Validation Types
// =====================

export interface ImportResult<T> {
  success: boolean;
  data?: T;
  errors: string[];
  warnings: string[];
}

// =====================
// Star Validation
// =====================

/**
 * Validate a star data object
 *
 * @param star - Object to validate
 * @returns Array of validation errors (empty if valid)
 */
export function validateStarData(star: unknown): string[] {
  const errors: string[] = [];

  if (!star || typeof star !== 'object') {
    errors.push('Star data must be an object');
    return errors;
  }

  const s = star as Record<string, unknown>;

  // Required fields
  if (!s.id || typeof s.id !== 'string') {
    errors.push('Star must have a valid string ID');
  }

  if (!s.name || typeof s.name !== 'string') {
    errors.push('Star must have a valid name');
  }

  if (!s.stellarClass || typeof s.stellarClass !== 'string') {
    errors.push('Star must have a stellar class');
  } else if (!isValidStellarClass(s.stellarClass)) {
    errors.push(
      `Invalid stellar class: ${s.stellarClass}. Must be O, B, A, F, G, K, or M`
    );
  }

  if (s.stellarGrade === undefined || s.stellarGrade === null) {
    errors.push('Star must have a stellar grade');
  } else if (typeof s.stellarGrade !== 'number') {
    errors.push('Stellar grade must be a number');
  } else if (!isValidStellarGrade(s.stellarGrade)) {
    errors.push(`Invalid stellar grade: ${s.stellarGrade}. Must be 0-9`);
  }

  if (!s.generationMethod || typeof s.generationMethod !== 'string') {
    errors.push('Star must have a generation method');
  } else if (!isValidGenerationMethod(s.generationMethod)) {
    errors.push(
      `Invalid generation method: ${s.generationMethod}. Must be PROCEDURAL or CUSTOM`
    );
  }

  if (!s.createdAt || typeof s.createdAt !== 'string') {
    errors.push('Star must have a createdAt timestamp');
  }

  if (!s.updatedAt || typeof s.updatedAt !== 'string') {
    errors.push('Star must have an updatedAt timestamp');
  }

  if (!s.createdBy || typeof s.createdBy !== 'string') {
    errors.push('Star must have a createdBy field');
  }

  // Optional fields validation
  if (s.uiaName !== undefined && typeof s.uiaName !== 'string') {
    errors.push('UIA name must be a string if provided');
  }

  return errors;
}

/**
 * Validate a star system object
 *
 * @param system - Object to validate
 * @returns Array of validation errors (empty if valid)
 */
export function validateStarSystem(system: unknown): string[] {
  const errors: string[] = [];

  if (!system || typeof system !== 'object') {
    errors.push('Star system must be an object');
    return errors;
  }

  const sys = system as Record<string, unknown>;

  // System metadata
  if (!sys.id || typeof sys.id !== 'string') {
    errors.push('System must have a valid ID');
  }

  if (!sys.name || typeof sys.name !== 'string') {
    errors.push('System must have a valid name');
  }

  if (!sys.createdAt || typeof sys.createdAt !== 'string') {
    errors.push('System must have a createdAt timestamp');
  }

  if (!sys.updatedAt || typeof sys.updatedAt !== 'string') {
    errors.push('System must have an updatedAt timestamp');
  }

  if (!sys.createdBy || typeof sys.createdBy !== 'string') {
    errors.push('System must have a createdBy field');
  }

  // Primary star validation
  if (!sys.primaryStar) {
    errors.push('System must have a primary star');
  } else {
    const primaryErrors = validateStarData(sys.primaryStar);
    primaryErrors.forEach((err) => errors.push(`Primary star: ${err}`));
  }

  // Companion stars validation
  if (!Array.isArray(sys.companionStars)) {
    errors.push('Companion stars must be an array');
  } else {
    sys.companionStars.forEach((companion, index) => {
      const companionErrors = validateStarData(companion);
      companionErrors.forEach((err) =>
        errors.push(`Companion star ${index + 1}: ${err}`)
      );
    });
  }

  return errors;
}

// =====================
// JSON Import
// =====================

/**
 * Parse and validate JSON file content as star system
 *
 * @param jsonString - JSON string to parse
 * @returns Import result with star system or errors
 */
export function importStarSystemFromJSON(
  jsonString: string
): ImportResult<StarSystem> {
  const result: ImportResult<StarSystem> = {
    success: false,
    errors: [],
    warnings: [],
  };

  // Parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    result.errors.push('Invalid JSON format. Could not parse file.');
    return result;
  }

  // Check if it's an export wrapper
  if (
    typeof parsed === 'object' &&
    parsed !== null &&
    'version' in parsed &&
    'system' in parsed
  ) {
    const exportWrapper = parsed as StarSystemExport;

    // Check version compatibility
    if (exportWrapper.version !== '1.0.0') {
      result.warnings.push(
        `File was exported with version ${exportWrapper.version}. Current version is 1.0.0. Some features may not work correctly.`
      );
    }

    parsed = exportWrapper.system;
  }

  // Validate star system
  const validationErrors = validateStarSystem(parsed);
  if (validationErrors.length > 0) {
    result.errors = validationErrors;
    return result;
  }

  result.success = true;
  result.data = parsed as StarSystem;
  return result;
}

/**
 * Import star system from a File object
 *
 * @param file - File to import
 * @returns Promise resolving to import result
 */
export async function importStarSystemFromFile(
  file: File
): Promise<ImportResult<StarSystem>> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content !== 'string') {
        resolve({
          success: false,
          errors: ['Failed to read file content'],
          warnings: [],
        });
        return;
      }

      if (file.name.endsWith('.json')) {
        resolve(importStarSystemFromJSON(content));
      } else if (file.name.endsWith('.csv')) {
        resolve(importStarSystemFromCSV(content));
      } else {
        resolve({
          success: false,
          errors: [`Unsupported file type: ${file.name}. Use .json or .csv`],
          warnings: [],
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        errors: ['Error reading file'],
        warnings: [],
      });
    };

    reader.readAsText(file);
  });
}

// =====================
// CSV Import
// =====================

/**
 * Parse CSV string into rows and columns
 *
 * @param csvString - CSV content
 * @returns Array of rows, each containing array of cell values
 */
function parseCSV(csvString: string): string[][] {
  const rows: string[][] = [];
  const lines = csvString.split('\n');

  for (const line of lines) {
    if (line.trim() === '') {
      rows.push([]);
      continue;
    }

    const cells: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i++;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        cells.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    cells.push(current.trim());
    rows.push(cells);
  }

  return rows;
}

/**
 * Import star system from CSV format
 * Note: Stellar traits (mass, luminosity, etc.) are computed from class/grade,
 * so they are not stored - only the core star data is imported.
 *
 * @param csvString - CSV content
 * @returns Import result with star system or errors
 */
export function importStarSystemFromCSV(
  csvString: string
): ImportResult<StarSystem> {
  const result: ImportResult<StarSystem> = {
    success: false,
    errors: [],
    warnings: [],
  };

  const rows = parseCSV(csvString);

  // Extract metadata from comment rows
  let systemId = '';
  let systemName = '';
  let dataRowsStart = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (row.length === 0) {
      continue;
    }

    if (row[0]?.startsWith('#')) {
      if (row[0] === '# System ID' && row[1]) {
        systemId = row[1];
      } else if (row[0] === '# System Name' && row[1]) {
        systemName = row[1];
      }
    } else if (row[0] === 'Type') {
      // Found header row
      dataRowsStart = i + 1;
      break;
    }
  }

  if (dataRowsStart === 0) {
    result.errors.push('Could not find header row in CSV');
    return result;
  }

  // Parse star data rows
  // CSV columns: Type, ID, Name, UIA Name, Stellar Class, Stellar Grade,
  // Mass, Luminosity, Radius, Temperature, Color, Generation Method,
  // Created At, Updated At, Created By
  const stars: Array<{ type: string; star: StarData }> = [];

  for (let i = dataRowsStart; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 15) {
      continue; // Skip incomplete rows
    }

    const type = row[0];
    const star: StarData = {
      id: row[1],
      name: row[2],
      uiaName: row[3] || undefined,
      stellarClass: row[4] as StarData['stellarClass'],
      stellarGrade: parseInt(row[5], 10) as StarData['stellarGrade'],
      // Skip columns 6-10 (mass, luminosity, radius, temperature, color) - these are computed
      generationMethod: row[11] as StarData['generationMethod'],
      createdAt: row[12],
      updatedAt: row[13],
      createdBy: row[14],
    };

    // Validate individual star
    const starErrors = validateStarData(star);
    if (starErrors.length > 0) {
      result.warnings.push(`Row ${i + 1} (${type}): ${starErrors.join(', ')}`);
    }

    stars.push({ type, star });
  }

  // Build star system
  const primaryStars = stars.filter((s) => s.type === 'Primary');
  const companionStars = stars.filter((s) => s.type.startsWith('Companion'));

  if (primaryStars.length === 0) {
    result.errors.push('No primary star found in CSV');
    return result;
  }

  if (primaryStars.length > 1) {
    result.warnings.push('Multiple primary stars found. Using the first one.');
  }

  const now = new Date().toISOString();
  const system: StarSystem = {
    id: systemId || `sys_imported_${Date.now().toString(36)}`,
    name: systemName || primaryStars[0].star.name,
    primaryStar: primaryStars[0].star,
    companionStars: companionStars.map((c) => c.star),
    createdAt: now,
    updatedAt: now,
    createdBy: 'import',
  };

  // Final validation
  const systemErrors = validateStarSystem(system);
  if (systemErrors.length > 0) {
    result.errors = systemErrors;
    return result;
  }

  result.success = true;
  result.data = system;
  return result;
}

/**
 * Sanitize imported star system
 * Ensures all required fields have valid values
 *
 * @param system - Star system to sanitize
 * @returns Sanitized star system
 */
export function sanitizeImportedSystem(system: StarSystem): StarSystem {
  const now = new Date().toISOString();

  // Ensure timestamps are valid ISO strings
  const sanitizeStar = (star: StarData): StarData => ({
    ...star,
    createdAt: star.createdAt || now,
    updatedAt: star.updatedAt || now,
    createdBy: star.createdBy || 'import',
  });

  return {
    ...system,
    primaryStar: sanitizeStar(system.primaryStar),
    companionStars: system.companionStars.map(sanitizeStar),
    createdAt: system.createdAt || now,
    updatedAt: now,
    createdBy: system.createdBy || 'import',
  };
}
