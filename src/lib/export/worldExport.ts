/**
 * Complete World Export Utilities
 *
 * Provides comprehensive export functionality for entire world configurations
 * including star systems, worlds, planets, moons, and brown dwarfs.
 */

import type { StarSystem } from '@/models/stellar/types/interface';
import type { WorldData } from '@/models/world';
import type { PlanetData } from '@/models/world/planet';
import type { MoonData } from '@/models/world/moon';
import type { BrownDwarfData } from '@/models/world/brownDwarf';
import { getWorldsByStarSystem } from '@/lib/db/queries/worldQueries';
import { getPlanetsByStarSystem } from '@/lib/db/queries/planetQueries';
import { getMoonsByStarSystem } from '@/lib/db/queries/moonQueries';
import { getBrownDwarfsByStarSystem } from '@/lib/db/queries/brownDwarfQueries';
import { generateTimestampedFilename } from './starExport';

// =====================
// Types
// =====================

/**
 * Complete world configuration export structure
 */
export interface CompleteWorldExport {
  version: string;
  exportDate: string;
  starSystem: StarSystem;
  worlds: WorldData[];
  planets: PlanetData[];
  moons: MoonData[];
  brownDwarfs: BrownDwarfData[];
}

// =====================
// Data Collection
// =====================

/**
 * Fetch all data for a complete world configuration
 *
 * @param starSystem - Star system to export
 * @returns Complete world data including all related entities
 */
export async function fetchCompleteWorldData(
  starSystem: StarSystem
): Promise<CompleteWorldExport> {
  try {
    // Fetch all related data in parallel for better performance
    const [worlds, planets, moons, brownDwarfs] = await Promise.all([
      getWorldsByStarSystem(starSystem.id),
      getPlanetsByStarSystem(starSystem.id),
      getMoonsByStarSystem(starSystem.id),
      getBrownDwarfsByStarSystem(starSystem.id),
    ]);

    return {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      starSystem,
      worlds,
      planets,
      moons,
      brownDwarfs,
    };
  } catch (error) {
    console.error('Error fetching complete world data:', error);
    throw new Error('Failed to fetch complete world configuration data');
  }
}

// =====================
// JSON Export
// =====================

/**
 * Export complete world configuration to JSON
 *
 * @param starSystem - Star system to export
 * @returns JSON string with complete world configuration
 */
export async function exportCompleteWorldToJSON(
  starSystem: StarSystem
): Promise<string> {
  const completeData = await fetchCompleteWorldData(starSystem);
  return JSON.stringify(completeData, null, 2);
}

/**
 * Download complete world configuration as JSON file
 *
 * @param starSystem - Star system to download
 * @param customFilename - Optional custom filename (without extension)
 */
export async function downloadCompleteWorldAsJSON(
  starSystem: StarSystem,
  customFilename?: string
): Promise<void> {
  try {
    const jsonString = await exportCompleteWorldToJSON(starSystem);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const filename = customFilename
      ? `${customFilename}.json`
      : generateTimestampedFilename(
          `${starSystem.name.replace(/\s+/g, '-').toLowerCase()}-complete`,
          'json'
        );

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
    console.debug(`📥 Downloaded complete world configuration as JSON: ${filename}`);
  } catch (error) {
    console.error('Error downloading complete world as JSON:', error);
    throw new Error('Failed to download complete world configuration');
  }
}

// =====================
// CSV Export
// =====================

/**
 * Export complete world configuration to CSV format
 * Creates a multi-section CSV with all data
 *
 * @param starSystem - Star system to export
 * @returns CSV string with complete world configuration
 */
export async function exportCompleteWorldToCSV(
  starSystem: StarSystem
): Promise<string> {
  const completeData = await fetchCompleteWorldData(starSystem);
  const rows: string[] = [];

  // Helper to escape CSV values
  const escape = (value: string | number | boolean | null | undefined): string => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('\n') || str.includes('"')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Metadata section
  rows.push('# COMPLETE WORLD CONFIGURATION EXPORT');
  rows.push(`# System Name,${escape(starSystem.name)}`);
  rows.push(`# System ID,${escape(starSystem.id)}`);
  rows.push(`# Export Date,${escape(completeData.exportDate)}`);
  rows.push(`# Version,${escape(completeData.version)}`);
  rows.push('');

  // Star System section
  rows.push('# STAR SYSTEM');
  rows.push('Type,ID,Name,UIA Name,Stellar Class,Stellar Grade,Created At,Updated At');
  rows.push(
    [
      'Primary',
      escape(starSystem.primaryStar.id),
      escape(starSystem.primaryStar.name),
      escape(starSystem.primaryStar.uiaName || ''),
      escape(starSystem.primaryStar.stellarClass),
      escape(starSystem.primaryStar.stellarGrade),
      escape(starSystem.primaryStar.createdAt),
      escape(starSystem.primaryStar.updatedAt),
    ].join(',')
  );

  starSystem.companionStars.forEach((companion, idx) => {
    rows.push(
      [
        `Companion ${idx + 1}`,
        escape(companion.id),
        escape(companion.name),
        escape(companion.uiaName || ''),
        escape(companion.stellarClass),
        escape(companion.stellarGrade),
        escape(companion.createdAt),
        escape(companion.updatedAt),
      ].join(',')
    );
  });
  rows.push('');

  // Worlds section
  if (completeData.worlds.length > 0) {
    rows.push('# WORLDS');
    rows.push(
      'ID,Name,Type,Size,Mass,Gravity,Tech Level,Habitability Score,Starport Class,Population,Wealth,Created At'
    );
    completeData.worlds.forEach((world) => {
      rows.push(
        [
          escape(world.id),
          escape(world.name),
          escape(world.type),
          escape(world.size),
          escape(world.mass),
          escape(world.gravity),
          escape(world.techLevel),
          escape(world.habitabilityScore || ''),
          escape(world.starportClass || 'None'),
          escape(world.population || ''),
          escape(world.wealth || ''),
          escape(world.createdAt),
        ].join(',')
      );
    });
    rows.push('');
  }

  // Planets section
  if (completeData.planets.length > 0) {
    rows.push('# PLANETS');
    rows.push('ID,Name,Type,Orbit Position,Size (Jupiter Masses),Mass,Created At');
    completeData.planets.forEach((planet) => {
      rows.push(
        [
          escape(planet.id || ''),
          escape(planet.name),
          escape(planet.planetType),
          escape(planet.orbitPosition),
          escape(planet.size || ''),
          escape(planet.mass || ''),
          escape(planet.createdAt.toISOString()),
        ].join(',')
      );
    });
    rows.push('');
  }

  // Moons section
  if (completeData.moons.length > 0) {
    rows.push('# MOONS');
    rows.push('ID,Name,Type,World ID,Orbit Position,Size (Lunar Masses),Mass,Gravity,Created At');
    completeData.moons.forEach((moon) => {
      rows.push(
        [
          escape(moon.id || ''),
          escape(moon.name),
          escape(moon.moonType),
          escape(moon.worldId),
          escape(moon.orbitPosition || ''),
          escape(moon.size),
          escape(moon.mass),
          escape(moon.gravity),
          escape(moon.createdAt.toISOString()),
        ].join(',')
      );
    });
    rows.push('');
  }

  // Brown Dwarfs section
  if (completeData.brownDwarfs.length > 0) {
    rows.push('# BROWN DWARFS');
    rows.push('ID,Name,Spectral Type,Orbit Position,Mass (Jupiter Masses),Temperature (K),Created At');
    completeData.brownDwarfs.forEach((brownDwarf) => {
      rows.push(
        [
          escape(brownDwarf.id),
          escape(brownDwarf.name),
          escape(brownDwarf.spectralType),
          escape(brownDwarf.orbitPosition),
          escape(brownDwarf.mass),
          escape(brownDwarf.temperature),
          escape(brownDwarf.createdAt),
        ].join(',')
      );
    });
    rows.push('');
  }

  return rows.join('\n');
}

/**
 * Download complete world configuration as CSV file
 *
 * @param starSystem - Star system to download
 * @param customFilename - Optional custom filename (without extension)
 */
export async function downloadCompleteWorldAsCSV(
  starSystem: StarSystem,
  customFilename?: string
): Promise<void> {
  try {
    const csvString = await exportCompleteWorldToCSV(starSystem);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const filename = customFilename
      ? `${customFilename}.csv`
      : generateTimestampedFilename(
          `${starSystem.name.replace(/\s+/g, '-').toLowerCase()}-complete`,
          'csv'
        );

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
    console.debug(`📥 Downloaded complete world configuration as CSV: ${filename}`);
  } catch (error) {
    console.error('Error downloading complete world as CSV:', error);
    throw new Error('Failed to download complete world configuration');
  }
}
