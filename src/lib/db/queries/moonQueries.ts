/**
 * Moon Queries
 *
 * Database query functions for moon operations.
 * Uses Dexie.js for IndexedDB access.
 */

import { db } from '../database';
import type { MoonData } from '@/models/world/moon';

// =====================
// Create & Update
// =====================

/**
 * Save a moon to the database (create or update)
 *
 * @param moonData - Moon data to save
 * @returns Saved moon data with generated ID
 */
export async function saveMoon(moonData: MoonData): Promise<MoonData> {
  try {
    const now = new Date();
    const dataToSave: MoonData = {
      ...moonData,
      updatedAt: now,
      createdAt: moonData.createdAt || now,
    };

    if (moonData.id) {
      // Update existing moon
      await db.moons.put(dataToSave);
    } else {
      // Create new moon
      const id = await db.moons.add(dataToSave);
      dataToSave.id = String(id);
    }

    return dataToSave;
  } catch (error) {
    console.error('Error saving moon:', error);
    throw new Error(`Failed to save moon: ${moonData.name}`);
  }
}

/**
 * Bulk save multiple moons
 *
 * @param moons - Array of moon data
 * @returns Array of saved moons with IDs
 */
export async function saveMoons(moons: MoonData[]): Promise<MoonData[]> {
  try {
    const now = new Date();
    const moonsToSave = moons.map((moon) => ({
      ...moon,
      updatedAt: now,
      createdAt: moon.createdAt || now,
    }));

    await db.moons.bulkPut(moonsToSave);
    return moonsToSave;
  } catch (error) {
    console.error('Error bulk saving moons:', error);
    throw new Error('Failed to bulk save moons');
  }
}

// =====================
// Read Operations
// =====================

/**
 * Get a moon by its ID
 *
 * @param id - Moon ID
 * @returns Moon data or undefined if not found
 */
export async function getMoonById(id: string): Promise<MoonData | undefined> {
  try {
    return await db.moons.get(id);
  } catch (error) {
    console.error('Error getting moon by ID:', error);
    throw new Error(`Failed to get moon with ID: ${id}`);
  }
}

/**
 * Get all moons for a specific world
 *
 * @param worldId - World ID
 * @returns Array of moons sorted by orbit position
 */
export async function getMoonsByWorld(worldId: string): Promise<MoonData[]> {
  try {
    const moons = await db.moons.where('worldId').equals(worldId).toArray();

    // Sort by orbit position (undefined positions go last)
    return moons.sort((a, b) => {
      if (a.orbitPosition === undefined) return 1;
      if (b.orbitPosition === undefined) return -1;
      return a.orbitPosition - b.orbitPosition;
    });
  } catch (error) {
    console.error('Error getting moons by world:', error);
    throw new Error(`Failed to get moons for world: ${worldId}`);
  }
}

/**
 * Get all moons in a star system
 *
 * @param starSystemId - Star system ID
 * @returns Array of moons sorted by creation date
 */
export async function getMoonsByStarSystem(
  starSystemId: string
): Promise<MoonData[]> {
  try {
    const moons = await db.moons
      .where('starSystemId')
      .equals(starSystemId)
      .toArray();

    // Sort by creation date (newest first)
    return moons.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  } catch (error) {
    console.error('Error getting moons by star system:', error);
    throw new Error(`Failed to get moons for star system: ${starSystemId}`);
  }
}

/**
 * Get all moons in the database
 *
 * @returns Array of all moons sorted by creation date
 */
export async function getAllMoons(): Promise<MoonData[]> {
  try {
    const moons = await db.moons.toArray();
    return moons.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  } catch (error) {
    console.error('Error getting all moons:', error);
    throw new Error('Failed to get all moons');
  }
}

/**
 * Search moons by name (case-insensitive)
 *
 * @param searchTerm - Search term to match against moon names
 * @returns Array of matching moons
 */
export async function getMoonsByName(searchTerm: string): Promise<MoonData[]> {
  try {
    const lowerSearch = searchTerm.toLowerCase();
    const allMoons = await db.moons.toArray();

    return allMoons.filter((moon) =>
      moon.name.toLowerCase().includes(lowerSearch)
    );
  } catch (error) {
    console.error('Error searching moons by name:', error);
    throw new Error(`Failed to search moons: ${searchTerm}`);
  }
}

// =====================
// Delete Operations
// =====================

/**
 * Delete a moon by ID
 *
 * @param id - Moon ID to delete
 */
export async function deleteMoon(id: string): Promise<void> {
  try {
    await db.moons.delete(id);
  } catch (error) {
    console.error('Error deleting moon:', error);
    throw new Error(`Failed to delete moon with ID: ${id}`);
  }
}

/**
 * Delete all moons for a specific world
 *
 * @param worldId - World ID
 * @returns Number of moons deleted
 */
export async function deleteMoonsByWorld(worldId: string): Promise<number> {
  try {
    const moons = await getMoonsByWorld(worldId);
    const moonIds = moons.map((m) => m.id!).filter((id) => id !== undefined);

    if (moonIds.length > 0) {
      await db.moons.bulkDelete(moonIds);
    }

    return moonIds.length;
  } catch (error) {
    console.error('Error deleting moons by world:', error);
    throw new Error(`Failed to delete moons for world: ${worldId}`);
  }
}

/**
 * Delete all moons in a star system
 *
 * @param starSystemId - Star system ID
 * @returns Number of moons deleted
 */
export async function deleteMoonsByStarSystem(
  starSystemId: string
): Promise<number> {
  try {
    const moons = await getMoonsByStarSystem(starSystemId);
    const moonIds = moons.map((m) => m.id!).filter((id) => id !== undefined);

    if (moonIds.length > 0) {
      await db.moons.bulkDelete(moonIds);
    }

    return moonIds.length;
  } catch (error) {
    console.error('Error deleting moons by star system:', error);
    throw new Error(`Failed to delete moons for star system: ${starSystemId}`);
  }
}

// =====================
// Count Operations
// =====================

/**
 * Get the total count of moons
 *
 * @param worldId - Optional world ID to count moons for specific world
 * @returns Number of moons
 */
export async function getMoonCount(worldId?: string): Promise<number> {
  try {
    if (worldId) {
      return await db.moons.where('worldId').equals(worldId).count();
    }
    return await db.moons.count();
  } catch (error) {
    console.error('Error counting moons:', error);
    throw new Error('Failed to count moons');
  }
}

/**
 * Check if a moon exists
 *
 * @param id - Moon ID
 * @returns True if moon exists, false otherwise
 */
export async function moonExists(id: string): Promise<boolean> {
  try {
    const count = await db.moons.where('id').equals(id).count();
    return count > 0;
  } catch (error) {
    console.error('Error checking moon existence:', error);
    return false;
  }
}

/**
 * Get moon count by moon type
 *
 * @param worldId - World ID to filter by
 * @returns Object with counts for each moon type
 */
export async function getMoonCountByType(
  worldId?: string
): Promise<{ major: number; minor: number; captured: number }> {
  try {
    const moons = worldId
      ? await getMoonsByWorld(worldId)
      : await getAllMoons();

    const counts = {
      major: 0,
      minor: 0,
      captured: 0,
    };

    for (const moon of moons) {
      if (moon.moonType === 'major') counts.major++;
      else if (moon.moonType === 'minor') counts.minor++;
      else if (moon.moonType === 'captured_asteroid') counts.captured++;
    }

    return counts;
  } catch (error) {
    console.error('Error counting moons by type:', error);
    throw new Error('Failed to count moons by type');
  }
}
