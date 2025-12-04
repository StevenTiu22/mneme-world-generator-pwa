/**
 * Planet Queries
 *
 * Database query functions for planet operations.
 * Uses Dexie.js for IndexedDB access.
 */

import { db } from '../database';
import type { PlanetData } from '@/models/world/planet';

// =====================
// Create & Update
// =====================

/**
 * Save a planet to the database (create or update)
 *
 * @param planetData - Planet data to save
 * @returns Saved planet data with generated ID
 */
export async function savePlanet(planetData: PlanetData): Promise<PlanetData> {
  try {
    const now = new Date();
    const dataToSave: PlanetData = {
      ...planetData,
      updatedAt: now,
      createdAt: planetData.createdAt || now,
    };

    if (planetData.id) {
      // Update existing planet
      await db.planets.put(dataToSave);
    } else {
      // Create new planet
      const id = await db.planets.add(dataToSave);
      dataToSave.id = String(id);
    }

    return dataToSave;
  } catch (error) {
    console.error('Error saving planet:', error);
    throw new Error(`Failed to save planet: ${planetData.name}`);
  }
}

/**
 * Bulk save multiple planets
 *
 * @param planets - Array of planet data
 * @returns Array of saved planets with IDs
 */
export async function savePlanets(
  planets: PlanetData[]
): Promise<PlanetData[]> {
  try {
    const now = new Date();
    const planetsToSave = planets.map((planet) => ({
      ...planet,
      updatedAt: now,
      createdAt: planet.createdAt || now,
    }));

    await db.planets.bulkPut(planetsToSave);
    return planetsToSave;
  } catch (error) {
    console.error('Error bulk saving planets:', error);
    throw new Error('Failed to bulk save planets');
  }
}

// =====================
// Read Operations
// =====================

/**
 * Get a planet by its ID
 *
 * @param id - Planet ID
 * @returns Planet data or undefined if not found
 */
export async function getPlanetById(
  id: string
): Promise<PlanetData | undefined> {
  try {
    return await db.planets.get(id);
  } catch (error) {
    console.error('Error getting planet by ID:', error);
    throw new Error(`Failed to get planet with ID: ${id}`);
  }
}

/**
 * Get all planets in a star system, sorted by orbit position
 *
 * @param starSystemId - Star system ID
 * @returns Array of planets sorted by orbit position
 */
export async function getPlanetsByStarSystem(
  starSystemId: string
): Promise<PlanetData[]> {
  try {
    const planets = await db.planets
      .where('starSystemId')
      .equals(starSystemId)
      .toArray();

    // Sort by orbit position (innermost first)
    return planets.sort((a, b) => a.orbitPosition - b.orbitPosition);
  } catch (error) {
    console.error('Error getting planets by star system:', error);
    throw new Error(`Failed to get planets for star system: ${starSystemId}`);
  }
}

/**
 * Get all planets in the database
 *
 * @returns Array of all planets sorted by creation date
 */
export async function getAllPlanets(): Promise<PlanetData[]> {
  try {
    const planets = await db.planets.toArray();
    return planets.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  } catch (error) {
    console.error('Error getting all planets:', error);
    throw new Error('Failed to get all planets');
  }
}

/**
 * Get planet at specific orbit position in a star system
 *
 * @param starSystemId - Star system ID
 * @param orbitPosition - Orbit position number
 * @returns Planet data or undefined if not found
 */
export async function getPlanetByOrbit(
  starSystemId: string,
  orbitPosition: number
): Promise<PlanetData | undefined> {
  try {
    const planets = await db.planets
      .where('starSystemId')
      .equals(starSystemId)
      .toArray();

    return planets.find((p) => p.orbitPosition === orbitPosition);
  } catch (error) {
    console.error('Error getting planet by orbit:', error);
    throw new Error(
      `Failed to get planet at orbit ${orbitPosition} in system ${starSystemId}`
    );
  }
}

/**
 * Search planets by name (case-insensitive)
 *
 * @param searchTerm - Search term to match against planet names
 * @returns Array of matching planets
 */
export async function getPlanetsByName(
  searchTerm: string
): Promise<PlanetData[]> {
  try {
    const lowerSearch = searchTerm.toLowerCase();
    const allPlanets = await db.planets.toArray();

    return allPlanets.filter((planet) =>
      planet.name.toLowerCase().includes(lowerSearch)
    );
  } catch (error) {
    console.error('Error searching planets by name:', error);
    throw new Error(`Failed to search planets: ${searchTerm}`);
  }
}

// =====================
// Delete Operations
// =====================

/**
 * Delete a planet by ID
 *
 * @param id - Planet ID to delete
 */
export async function deletePlanet(id: string): Promise<void> {
  try {
    await db.planets.delete(id);
  } catch (error) {
    console.error('Error deleting planet:', error);
    throw new Error(`Failed to delete planet with ID: ${id}`);
  }
}

/**
 * Delete all planets in a star system
 *
 * @param starSystemId - Star system ID
 * @returns Number of planets deleted
 */
export async function deletePlanetsByStarSystem(
  starSystemId: string
): Promise<number> {
  try {
    const planets = await getPlanetsByStarSystem(starSystemId);
    const planetIds = planets
      .map((p) => p.id!)
      .filter((id) => id !== undefined);

    if (planetIds.length > 0) {
      await db.planets.bulkDelete(planetIds);
    }

    return planetIds.length;
  } catch (error) {
    console.error('Error deleting planets by star system:', error);
    throw new Error(
      `Failed to delete planets for star system: ${starSystemId}`
    );
  }
}

// =====================
// Count Operations
// =====================

/**
 * Get the total count of planets
 *
 * @param starSystemId - Optional star system ID to count planets for specific system
 * @returns Number of planets
 */
export async function getPlanetCount(starSystemId?: string): Promise<number> {
  try {
    if (starSystemId) {
      return await db.planets.where('starSystemId').equals(starSystemId).count();
    }
    return await db.planets.count();
  } catch (error) {
    console.error('Error counting planets:', error);
    throw new Error('Failed to count planets');
  }
}

/**
 * Check if a planet exists
 *
 * @param id - Planet ID
 * @returns True if planet exists, false otherwise
 */
export async function planetExists(id: string): Promise<boolean> {
  try {
    const count = await db.planets.where('id').equals(id).count();
    return count > 0;
  } catch (error) {
    console.error('Error checking planet existence:', error);
    return false;
  }
}

/**
 * Check if an orbit position is occupied in a star system
 *
 * @param starSystemId - Star system ID
 * @param orbitPosition - Orbit position to check
 * @returns True if occupied, false otherwise
 */
export async function isOrbitOccupied(
  starSystemId: string,
  orbitPosition: number
): Promise<boolean> {
  try {
    const planet = await getPlanetByOrbit(starSystemId, orbitPosition);
    return planet !== undefined;
  } catch (error) {
    console.error('Error checking orbit occupation:', error);
    return false;
  }
}

/**
 * Get planet count by planet type
 *
 * @param starSystemId - Optional star system ID to filter by
 * @returns Object with counts for each planet type
 */
export async function getPlanetCountByType(
  starSystemId?: string
): Promise<{
  gasGiant: number;
  iceGiant: number;
  asteroidBelt: number;
  planetoidBelt: number;
}> {
  try {
    const planets = starSystemId
      ? await getPlanetsByStarSystem(starSystemId)
      : await getAllPlanets();

    const counts = {
      gasGiant: 0,
      iceGiant: 0,
      asteroidBelt: 0,
      planetoidBelt: 0,
    };

    for (const planet of planets) {
      if (planet.planetType === 'gas_giant') counts.gasGiant++;
      else if (planet.planetType === 'ice_giant') counts.iceGiant++;
      else if (planet.planetType === 'asteroid_belt') counts.asteroidBelt++;
      else if (planet.planetType === 'planetoid_belt') counts.planetoidBelt++;
    }

    return counts;
  } catch (error) {
    console.error('Error counting planets by type:', error);
    throw new Error('Failed to count planets by type');
  }
}

/**
 * Get available orbit positions in a star system
 *
 * @param starSystemId - Star system ID
 * @param maxOrbits - Maximum number of orbits (default 10)
 * @returns Array of available orbit positions
 */
export async function getAvailableOrbits(
  starSystemId: string,
  maxOrbits: number = 10
): Promise<number[]> {
  try {
    const planets = await getPlanetsByStarSystem(starSystemId);
    const occupiedOrbits = planets.map((p) => p.orbitPosition);

    const availableOrbits: number[] = [];
    for (let i = 1; i <= maxOrbits; i++) {
      if (!occupiedOrbits.includes(i)) {
        availableOrbits.push(i);
      }
    }

    return availableOrbits;
  } catch (error) {
    console.error('Error getting available orbits:', error);
    throw new Error('Failed to get available orbits');
  }
}
