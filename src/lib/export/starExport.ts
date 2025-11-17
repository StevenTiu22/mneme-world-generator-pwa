/**
 * Star System Export Utilities
 *
 * Provides export functionality for star systems in JSON and CSV formats.
 * Implements timestamped filenames as per Milestone 3 requirements (YYMMDD-HHMMSS).
 */

import type {
  StarData,
  StarSystem,
  StarSystemExport,
} from '@/models/stellar/types/interface';
import {
  STELLAR_MASS,
  STELLAR_LUMINOSITY,
  STELLAR_RADIUS,
  STELLAR_TEMPERATURE,
  STAR_CLASS_INFO,
} from '@/models/stellar/data/constants';
import type { StellarClass, StellarGrade } from '@/models/stellar/types/enums';

// =====================
// Filename Generation
// =====================

/**
 * Generate a timestamped filename in YYMMDD-HHMMSS format
 *
 * @param prefix - Optional prefix for the filename
 * @param extension - File extension (without dot)
 * @returns Formatted filename string
 */
export function generateTimestampedFilename(
  prefix: string = 'star-system',
  extension: string = 'json'
): string {
  const now = new Date();

  // Format: YYMMDD-HHMMSS
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');

  const timestamp = `${year}${month}${day}-${hours}${minutes}${seconds}`;

  return `${prefix}-${timestamp}.${extension}`;
}

// =====================
// JSON Export
// =====================

/**
 * Export a star system to JSON format
 *
 * @param system - Star system to export
 * @returns JSON string with metadata
 */
export function exportStarSystemToJSON(system: StarSystem): string {
  const exportData: StarSystemExport = {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    system,
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Export a single star to JSON format
 *
 * @param star - Star data to export
 * @returns JSON string
 */
export function exportStarToJSON(star: StarData): string {
  return JSON.stringify(star, null, 2);
}

/**
 * Download star system as JSON file
 *
 * @param system - Star system to download
 * @param customFilename - Optional custom filename (without extension)
 */
export function downloadStarSystemAsJSON(
  system: StarSystem,
  customFilename?: string
): void {
  const jsonString = exportStarSystemToJSON(system);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const filename = customFilename
    ? `${customFilename}.json`
    : generateTimestampedFilename(
        system.name.replace(/\s+/g, '-').toLowerCase(),
        'json'
      );

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
  console.debug(`📥 Downloaded star system as JSON: ${filename}`);
}

// =====================
// CSV Export
// =====================

/**
 * Get stellar properties for a star based on its class and grade
 *
 * @param stellarClass - Stellar class (O, B, A, F, G, K, M)
 * @param stellarGrade - Stellar grade (0-9)
 * @returns Object with mass, luminosity, radius, temperature, and color
 */
function getStellarTraits(
  stellarClass: StellarClass,
  stellarGrade: StellarGrade
): {
  mass: number;
  luminosity: number;
  radius: number;
  temperature: number;
  color: string;
} {
  return {
    mass: STELLAR_MASS[stellarClass][stellarGrade],
    luminosity: STELLAR_LUMINOSITY[stellarClass][stellarGrade],
    radius: STELLAR_RADIUS[stellarClass][stellarGrade],
    temperature: STELLAR_TEMPERATURE[stellarClass][stellarGrade],
    color: STAR_CLASS_INFO[stellarClass].color,
  };
}

/**
 * Convert a star to CSV row data
 *
 * @param star - Star data
 * @param type - Star type (Primary/Companion)
 * @returns Array of cell values
 */
function starToCSVRow(star: StarData, type: string): string[] {
  const traits = getStellarTraits(star.stellarClass, star.stellarGrade);

  return [
    type,
    star.id,
    star.name,
    star.uiaName || '',
    star.stellarClass,
    star.stellarGrade.toString(),
    traits.mass.toString(),
    traits.luminosity.toString(),
    traits.radius.toString(),
    traits.temperature.toString(),
    traits.color,
    star.generationMethod,
    star.createdAt,
    star.updatedAt,
    star.createdBy,
  ];
}

/**
 * Escape CSV cell value
 *
 * @param value - Cell value
 * @returns Escaped value safe for CSV
 */
function escapeCSVValue(value: string): string {
  // If value contains comma, newline, or quote, wrap in quotes and escape internal quotes
  if (value.includes(',') || value.includes('\n') || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Export star system to CSV format
 *
 * @param system - Star system to export
 * @returns CSV string
 */
export function exportStarSystemToCSV(system: StarSystem): string {
  const headers = [
    'Type',
    'ID',
    'Name',
    'UIA Name',
    'Stellar Class',
    'Stellar Grade',
    'Mass (Solar Masses)',
    'Luminosity (Solar Luminosities)',
    'Radius (Solar Radii)',
    'Temperature (K)',
    'Color',
    'Generation Method',
    'Created At',
    'Updated At',
    'Created By',
  ];

  const rows: string[][] = [];

  // Add metadata row
  rows.push(['# Star System Export']);
  rows.push(['# System ID', system.id]);
  rows.push(['# System Name', system.name]);
  rows.push(['# Export Date', new Date().toISOString()]);
  rows.push(['# Version', '1.0.0']);
  rows.push([]); // Empty row for spacing

  // Add headers
  rows.push(headers);

  // Add primary star
  rows.push(starToCSVRow(system.primaryStar, 'Primary'));

  // Add companion stars
  system.companionStars.forEach((companion, index) => {
    rows.push(starToCSVRow(companion, `Companion ${index + 1}`));
  });

  // Convert to CSV string
  const csvContent = rows
    .map((row) => row.map(escapeCSVValue).join(','))
    .join('\n');

  return csvContent;
}

/**
 * Export single star to CSV format
 *
 * @param star - Star to export
 * @returns CSV string
 */
export function exportStarToCSV(star: StarData): string {
  const traits = getStellarTraits(star.stellarClass, star.stellarGrade);

  const headers = [
    'ID',
    'Name',
    'UIA Name',
    'Stellar Class',
    'Stellar Grade',
    'Mass (Solar Masses)',
    'Luminosity (Solar Luminosities)',
    'Radius (Solar Radii)',
    'Temperature (K)',
    'Color',
    'Generation Method',
    'Created At',
    'Updated At',
    'Created By',
  ];

  const row = [
    star.id,
    star.name,
    star.uiaName || '',
    star.stellarClass,
    star.stellarGrade.toString(),
    traits.mass.toString(),
    traits.luminosity.toString(),
    traits.radius.toString(),
    traits.temperature.toString(),
    traits.color,
    star.generationMethod,
    star.createdAt,
    star.updatedAt,
    star.createdBy,
  ];

  return [headers.join(','), row.map(escapeCSVValue).join(',')].join('\n');
}

/**
 * Download star system as CSV file
 *
 * @param system - Star system to download
 * @param customFilename - Optional custom filename (without extension)
 */
export function downloadStarSystemAsCSV(
  system: StarSystem,
  customFilename?: string
): void {
  const csvString = exportStarSystemToCSV(system);
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const filename = customFilename
    ? `${customFilename}.csv`
    : generateTimestampedFilename(
        system.name.replace(/\s+/g, '-').toLowerCase(),
        'csv'
      );

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
  console.debug(`📥 Downloaded star system as CSV: ${filename}`);
}

// =====================
// TSV Export (Tab-Separated)
// =====================

/**
 * Export star system to TSV format
 *
 * @param system - Star system to export
 * @returns TSV string
 */
export function exportStarSystemToTSV(system: StarSystem): string {
  const headers = [
    'Type',
    'ID',
    'Name',
    'UIA Name',
    'Stellar Class',
    'Stellar Grade',
    'Mass (Solar Masses)',
    'Luminosity (Solar Luminosities)',
    'Radius (Solar Radii)',
    'Temperature (K)',
    'Color',
    'Generation Method',
    'Created At',
    'Updated At',
    'Created By',
  ];

  const rows: string[][] = [];

  // Add metadata
  rows.push(['# Star System Export']);
  rows.push(['# System ID', system.id]);
  rows.push(['# System Name', system.name]);
  rows.push(['# Export Date', new Date().toISOString()]);
  rows.push(['# Version', '1.0.0']);
  rows.push([]);

  // Add headers and data
  rows.push(headers);
  rows.push(starToCSVRow(system.primaryStar, 'Primary'));
  system.companionStars.forEach((companion, index) => {
    rows.push(starToCSVRow(companion, `Companion ${index + 1}`));
  });

  // Join with tabs instead of commas
  return rows.map((row) => row.join('\t')).join('\n');
}

/**
 * Download star system as TSV file
 *
 * @param system - Star system to download
 * @param customFilename - Optional custom filename (without extension)
 */
export function downloadStarSystemAsTSV(
  system: StarSystem,
  customFilename?: string
): void {
  const tsvString = exportStarSystemToTSV(system);
  const blob = new Blob([tsvString], {
    type: 'text/tab-separated-values;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);

  const filename = customFilename
    ? `${customFilename}.tsv`
    : generateTimestampedFilename(
        system.name.replace(/\s+/g, '-').toLowerCase(),
        'tsv'
      );

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
  console.debug(`📥 Downloaded star system as TSV: ${filename}`);
}
