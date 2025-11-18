/**
 * Star Data Query and Mutation Utilities
 *
 * Provides CRUD operations for user-created stars in IndexedDB.
 * Handles persistence of primary stars and companion stars.
 */

import { db } from '../database';
import type { StarData, StarSystem } from '@/models/stellar/types/interface';

// =====================
// Star CRUD Operations
// =====================

/**
 * Save a single star to the database
 *
 * @param star - Star data to save
 * @returns The ID of the saved star
 * @throws Error if save operation fails
 */
export async function saveStar(star: StarData): Promise<string> {
  try {
    await db.open();
    await db.stars.put(star);
    console.debug(`💾 Saved star: ${star.name} (${star.id})`);
    return star.id;
  } catch (error) {
    console.error(`❌ Error saving star ${star.name}:`, error);
    throw new Error(`Failed to save star: ${star.name}`);
  }
}

/**
 * Save multiple stars to the database (bulk operation)
 *
 * @param stars - Array of stars to save
 * @returns Number of stars saved
 * @throws Error if bulk save fails
 */
export async function saveStars(stars: StarData[]): Promise<number> {
  try {
    await db.open();
    await db.stars.bulkPut(stars);
    console.debug(`💾 Saved ${stars.length} stars`);
    return stars.length;
  } catch (error) {
    console.error('❌ Error saving stars:', error);
    throw new Error('Failed to save stars');
  }
}

/**
 * Retrieve a star by its ID
 *
 * @param id - Star ID
 * @returns Star data or undefined if not found
 * @throws Error if query fails
 */
export async function getStarById(id: string): Promise<StarData | undefined> {
  try {
    await db.open();
    const star = await db.stars.get(id);
    if (star) {
      console.debug(`🔍 Found star: ${star.name} (${id})`);
    } else {
      console.debug(`🔍 Star not found: ${id}`);
    }
    return star;
  } catch (error) {
    console.error(`❌ Error retrieving star ${id}:`, error);
    throw new Error(`Failed to retrieve star: ${id}`);
  }
}

/**
 * Get all saved stars from the database
 *
 * @returns Array of all stars, sorted by creation date (newest first)
 * @throws Error if query fails
 */
export async function getAllStars(): Promise<StarData[]> {
  try {
    await db.open();
    const stars = await db.stars.orderBy('createdAt').reverse().toArray();
    console.debug(`📊 Loaded ${stars.length} stars from database`);
    return stars;
  } catch (error) {
    console.error('❌ Error loading all stars:', error);
    throw new Error('Failed to load saved stars');
  }
}

/**
 * Get stars by stellar class
 *
 * @param stellarClass - Stellar class to filter by
 * @returns Array of stars with the specified class
 * @throws Error if query fails
 */
export async function getStarsByClass(
  stellarClass: string
): Promise<StarData[]> {
  try {
    await db.open();
    const stars = await db.stars
      .where('stellarClass')
      .equals(stellarClass)
      .toArray();
    console.debug(
      `📊 Found ${stars.length} stars of class ${stellarClass}`
    );
    return stars;
  } catch (error) {
    console.error(`❌ Error querying stars by class ${stellarClass}:`, error);
    throw new Error(`Failed to load stars of class ${stellarClass}`);
  }
}

/**
 * Update an existing star
 *
 * @param id - ID of the star to update
 * @param updates - Partial star data to update
 * @returns Updated star data
 * @throws Error if star not found or update fails
 */
export async function updateStar(
  id: string,
  updates: Partial<Omit<StarData, 'id' | 'createdAt' | 'createdBy'>>
): Promise<StarData> {
  try {
    await db.open();

    const existingStar = await db.stars.get(id);
    if (!existingStar) {
      throw new Error(`Star not found: ${id}`);
    }

    const updatedStar: StarData = {
      ...existingStar,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await db.stars.put(updatedStar);
    console.debug(`✏️ Updated star: ${updatedStar.name} (${id})`);
    return updatedStar;
  } catch (error) {
    console.error(`❌ Error updating star ${id}:`, error);
    throw error instanceof Error
      ? error
      : new Error(`Failed to update star: ${id}`);
  }
}

/**
 * Delete a star from the database
 *
 * @param id - ID of the star to delete
 * @throws Error if delete fails
 */
export async function deleteStar(id: string): Promise<void> {
  try {
    await db.open();
    await db.stars.delete(id);
    console.debug(`🗑️ Deleted star: ${id}`);
  } catch (error) {
    console.error(`❌ Error deleting star ${id}:`, error);
    throw new Error(`Failed to delete star: ${id}`);
  }
}

/**
 * Delete multiple stars from the database
 *
 * @param ids - Array of star IDs to delete
 * @throws Error if delete fails
 */
export async function deleteStars(ids: string[]): Promise<void> {
  try {
    await db.open();
    await db.stars.bulkDelete(ids);
    console.debug(`🗑️ Deleted ${ids.length} stars`);
  } catch (error) {
    console.error('❌ Error deleting stars:', error);
    throw new Error('Failed to delete stars');
  }
}

// =====================
// Star System Operations
// =====================

/**
 * Save a complete star system (primary star + companions)
 * Saves to both the starSystems table and individual stars table
 *
 * @param system - Star system to save
 * @returns The system ID
 * @throws Error if save fails
 */
export async function saveStarSystem(system: StarSystem): Promise<string> {
  try {
    await db.open();

    // Save the complete system to starSystems table
    await db.starSystems.put(system);

    // Also save individual stars to stars table for backward compatibility
    await saveStar(system.primaryStar);

    // Save companion stars if any
    if (system.companionStars.length > 0) {
      await saveStars(system.companionStars);
    }

    console.debug(
      `💾 Saved star system: ${system.name} (1 primary + ${system.companionStars.length} companions)`
    );
    return system.id;
  } catch (error) {
    console.error(`❌ Error saving star system ${system.name}:`, error);
    throw new Error(`Failed to save star system: ${system.name}`);
  }
}

/**
 * Get all saved star systems from the database
 *
 * @returns Array of all star systems, sorted by creation date (newest first)
 * @throws Error if query fails
 */
export async function getAllStarSystems(): Promise<StarSystem[]> {
  try {
    await db.open();
    const systems = await db.starSystems.orderBy('createdAt').reverse().toArray();
    console.debug(`📊 Loaded ${systems.length} star systems from database`);
    return systems;
  } catch (error) {
    console.error('❌ Error loading all star systems:', error);
    throw new Error('Failed to load saved star systems');
  }
}

/**
 * Get a star system by its ID
 *
 * @param id - Star system ID
 * @returns Star system data or undefined if not found
 * @throws Error if query fails
 */
export async function getStarSystemById(id: string): Promise<StarSystem | undefined> {
  try {
    await db.open();
    const system = await db.starSystems.get(id);
    if (system) {
      console.debug(`🔍 Found star system: ${system.name} (${id})`);
    } else {
      console.debug(`🔍 Star system not found: ${id}`);
    }
    return system;
  } catch (error) {
    console.error(`❌ Error retrieving star system ${id}:`, error);
    throw new Error(`Failed to retrieve star system: ${id}`);
  }
}

/**
 * Update an existing star system
 *
 * @param id - ID of the star system to update
 * @param updates - Partial star system data to update
 * @returns Updated star system data
 * @throws Error if system not found or update fails
 */
export async function updateStarSystem(
  id: string,
  updates: Partial<Omit<StarSystem, 'id' | 'createdAt' | 'createdBy'>>
): Promise<StarSystem> {
  try {
    await db.open();

    const existingSystem = await db.starSystems.get(id);
    if (!existingSystem) {
      throw new Error(`Star system not found: ${id}`);
    }

    const updatedSystem: StarSystem = {
      ...existingSystem,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await db.starSystems.put(updatedSystem);
    console.debug(`✏️ Updated star system: ${updatedSystem.name} (${id})`);
    return updatedSystem;
  } catch (error) {
    console.error(`❌ Error updating star system ${id}:`, error);
    throw error instanceof Error
      ? error
      : new Error(`Failed to update star system: ${id}`);
  }
}

/**
 * Delete a star system from the database
 * Also deletes associated stars from the stars table
 *
 * @param id - ID of the star system to delete
 * @throws Error if delete fails
 */
export async function deleteStarSystem(id: string): Promise<void> {
  try {
    await db.open();

    // Get the system first to find associated star IDs
    const system = await db.starSystems.get(id);

    if (system) {
      // Delete associated stars
      const starIds = [
        system.primaryStar.id,
        ...system.companionStars.map(star => star.id)
      ];
      await deleteStars(starIds);
    }

    // Delete the system itself
    await db.starSystems.delete(id);
    console.debug(`🗑️ Deleted star system: ${id}`);
  } catch (error) {
    console.error(`❌ Error deleting star system ${id}:`, error);
    throw new Error(`Failed to delete star system: ${id}`);
  }
}

/**
 * Get count of saved star systems
 *
 * @returns Number of star systems in database
 * @throws Error if count fails
 */
export async function getStarSystemCount(): Promise<number> {
  try {
    await db.open();
    const count = await db.starSystems.count();
    console.debug(`📊 Total star systems in database: ${count}`);
    return count;
  } catch (error) {
    console.error('❌ Error counting star systems:', error);
    throw new Error('Failed to count star systems');
  }
}

/**
 * Clear all saved star systems from the database
 *
 * WARNING: This will delete all user star system data!
 *
 * @throws Error if clear fails
 */
export async function clearAllStarSystems(): Promise<void> {
  try {
    await db.open();
    await db.starSystems.clear();
    console.warn('⚠️ Cleared all star systems from database');
  } catch (error) {
    console.error('❌ Error clearing star systems:', error);
    throw new Error('Failed to clear star systems');
  }
}

/**
 * Get count of saved stars
 *
 * @returns Number of stars in database
 * @throws Error if count fails
 */
export async function getStarCount(): Promise<number> {
  try {
    await db.open();
    const count = await db.stars.count();
    console.debug(`📊 Total stars in database: ${count}`);
    return count;
  } catch (error) {
    console.error('❌ Error counting stars:', error);
    throw new Error('Failed to count stars');
  }
}

/**
 * Clear all saved stars from the database
 *
 * WARNING: This will delete all user star data!
 *
 * @throws Error if clear fails
 */
export async function clearAllStars(): Promise<void> {
  try {
    await db.open();
    await db.stars.clear();
    console.warn('⚠️ Cleared all stars from database');
  } catch (error) {
    console.error('❌ Error clearing stars:', error);
    throw new Error('Failed to clear stars');
  }
}

/**
 * Generate a unique ID for a new star
 *
 * Uses timestamp + random suffix for uniqueness
 *
 * @returns Unique star ID
 */
export function generateStarId(): string {
  const timestamp = Date.now().toString(36);
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `star_${timestamp}_${randomSuffix}`;
}

/**
 * Generate a unique ID for a new star system
 *
 * @returns Unique system ID
 */
export function generateSystemId(): string {
  const timestamp = Date.now().toString(36);
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `sys_${timestamp}_${randomSuffix}`;
}
