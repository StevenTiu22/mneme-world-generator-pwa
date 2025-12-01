/**
 * World Query Utilities
 *
 * Provides CRUD operations for world data in IndexedDB.
 * Handles saving, loading, and deleting user-created worlds.
 */

import { db } from '../database';
import type { WorldData } from '@/models/world';

// =====================
// Save Operations
// =====================

/**
 * Save or update a world in the database
 *
 * Uses upsert pattern - creates new record if doesn't exist, updates if it does
 *
 * @param worldData - Complete world data to save
 * @returns The saved world data with updated timestamp
 * @throws Error if save operation fails
 */
export async function saveWorld(worldData: WorldData): Promise<WorldData> {
  try {
    // Update the updatedAt timestamp
    const updatedWorld: WorldData = {
      ...worldData,
      updatedAt: new Date().toISOString(),
    };

    // Use put() for upsert behavior (insert or update)
    await db.worlds.put(updatedWorld);

    console.log(`💾 World saved: ${updatedWorld.name} (${updatedWorld.id})`);
    return updatedWorld;
  } catch (error) {
    console.error('Error saving world:', error);
    throw new Error(`Failed to save world: ${worldData.name}`);
  }
}

// =====================
// Read Operations
// =====================

/**
 * Get a world by its ID
 *
 * @param id - World ID
 * @returns World data or undefined if not found
 * @throws Error if database query fails
 */
export async function getWorldById(id: string): Promise<WorldData | undefined> {
  try {
    const world = await db.worlds.get(id);
    return world;
  } catch (error) {
    console.error('Error fetching world by ID:', error);
    throw new Error(`Failed to fetch world with ID: ${id}`);
  }
}

/**
 * Get all worlds for a specific star system
 *
 * @param starSystemId - Star system ID
 * @returns Array of worlds in the system (may be empty)
 * @throws Error if database query fails
 */
export async function getWorldsByStarSystem(
  starSystemId: string
): Promise<WorldData[]> {
  try {
    const worlds = await db.worlds
      .where('starSystemId')
      .equals(starSystemId)
      .sortBy('createdAt');

    return worlds;
  } catch (error) {
    console.error('Error fetching worlds by star system:', error);
    throw new Error(`Failed to fetch worlds for system: ${starSystemId}`);
  }
}

/**
 * Get all worlds in the database
 *
 * @returns Array of all worlds (may be empty)
 * @throws Error if database query fails
 */
export async function getAllWorlds(): Promise<WorldData[]> {
  try {
    const worlds = await db.worlds.orderBy('createdAt').reverse().toArray();
    return worlds;
  } catch (error) {
    console.error('Error fetching all worlds:', error);
    throw new Error('Failed to fetch worlds');
  }
}

/**
 * Get worlds by name (case-insensitive search)
 *
 * @param searchTerm - Name or partial name to search for
 * @returns Array of matching worlds
 * @throws Error if database query fails
 */
export async function getWorldsByName(searchTerm: string): Promise<WorldData[]> {
  try {
    const normalizedSearch = searchTerm.toLowerCase();
    const worlds = await db.worlds
      .filter((world) => world.name.toLowerCase().includes(normalizedSearch))
      .toArray();

    return worlds;
  } catch (error) {
    console.error('Error searching worlds by name:', error);
    throw new Error(`Failed to search worlds with term: ${searchTerm}`);
  }
}

// =====================
// Delete Operations
// =====================

/**
 * Delete a world from the database
 *
 * @param id - World ID to delete
 * @returns True if deleted, false if not found
 * @throws Error if delete operation fails
 */
export async function deleteWorld(id: string): Promise<boolean> {
  try {
    const world = await db.worlds.get(id);
    if (!world) {
      console.warn(`World not found for deletion: ${id}`);
      return false;
    }

    await db.worlds.delete(id);
    console.log(`🗑️ World deleted: ${world.name} (${id})`);
    return true;
  } catch (error) {
    console.error('Error deleting world:', error);
    throw new Error(`Failed to delete world with ID: ${id}`);
  }
}

/**
 * Delete all worlds for a specific star system
 *
 * @param starSystemId - Star system ID
 * @returns Number of worlds deleted
 * @throws Error if delete operation fails
 */
export async function deleteWorldsByStarSystem(
  starSystemId: string
): Promise<number> {
  try {
    const count = await db.worlds.where('starSystemId').equals(starSystemId).delete();
    console.log(`🗑️ Deleted ${count} worlds from system: ${starSystemId}`);
    return count;
  } catch (error) {
    console.error('Error deleting worlds by star system:', error);
    throw new Error(`Failed to delete worlds for system: ${starSystemId}`);
  }
}

// =====================
// Utility Functions
// =====================

/**
 * Count total worlds in database
 *
 * @returns Total number of worlds
 */
export async function getWorldCount(): Promise<number> {
  try {
    return await db.worlds.count();
  } catch (error) {
    console.error('Error counting worlds:', error);
    throw new Error('Failed to count worlds');
  }
}

/**
 * Check if a world exists
 *
 * @param id - World ID
 * @returns True if exists, false otherwise
 */
export async function worldExists(id: string): Promise<boolean> {
  try {
    const world = await db.worlds.get(id);
    return world !== undefined;
  } catch (error) {
    console.error('Error checking world existence:', error);
    return false;
  }
}
