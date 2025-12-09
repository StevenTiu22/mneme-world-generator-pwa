import { db } from '../database';
import type { BrownDwarfData } from '@/models/world/brownDwarf';

/**
 * Save or update a brown dwarf
 * @param brownDwarfData Brown dwarf to save
 * @returns Promise<BrownDwarfData> The saved brown dwarf
 */
export async function saveBrownDwarf(brownDwarfData: BrownDwarfData): Promise<BrownDwarfData> {
  try {
    const now = new Date().toISOString();
    const dataToSave: BrownDwarfData = {
      ...brownDwarfData,
      updatedAt: now,
    };

    // If no ID, this is a new brown dwarf
    if (!dataToSave.id) {
      throw new Error('Brown dwarf must have an ID');
    }

    await db.brownDwarfs.put(dataToSave);
    console.log('✅ Brown dwarf saved:', dataToSave.name);
    return dataToSave;
  } catch (error) {
    console.error('❌ Failed to save brown dwarf:', error);
    throw error;
  }
}

/**
 * Get a brown dwarf by ID
 * @param id Brown dwarf ID
 * @returns Promise<BrownDwarfData | undefined>
 */
export async function getBrownDwarfById(id: string): Promise<BrownDwarfData | undefined> {
  try {
    const brownDwarf = await db.brownDwarfs.get(id);
    return brownDwarf;
  } catch (error) {
    console.error('❌ Failed to get brown dwarf by ID:', error);
    throw error;
  }
}

/**
 * Get all brown dwarfs in a star system
 * @param starSystemId Star system ID
 * @returns Promise<BrownDwarfData[]> Array of brown dwarfs sorted by orbit position
 */
export async function getBrownDwarfsByStarSystem(starSystemId: string): Promise<BrownDwarfData[]> {
  try {
    const brownDwarfs = await db.brownDwarfs
      .where('starSystemId')
      .equals(starSystemId)
      .toArray();

    // Sort by orbit position
    return brownDwarfs.sort((a, b) => a.orbitPosition - b.orbitPosition);
  } catch (error) {
    console.error('❌ Failed to get brown dwarfs by star system:', error);
    throw error;
  }
}

/**
 * Get all brown dwarfs
 * @returns Promise<BrownDwarfData[]> Array of all brown dwarfs
 */
export async function getAllBrownDwarfs(): Promise<BrownDwarfData[]> {
  try {
    const brownDwarfs = await db.brownDwarfs.orderBy('createdAt').reverse().toArray();
    return brownDwarfs;
  } catch (error) {
    console.error('❌ Failed to get all brown dwarfs:', error);
    throw error;
  }
}

/**
 * Get brown dwarfs by name (search)
 * @param searchTerm Search term (case-insensitive)
 * @returns Promise<BrownDwarfData[]>
 */
export async function getBrownDwarfsByName(searchTerm: string): Promise<BrownDwarfData[]> {
  try {
    const lowerSearch = searchTerm.toLowerCase();
    const brownDwarfs = await db.brownDwarfs
      .filter(bd => bd.name.toLowerCase().includes(lowerSearch))
      .toArray();
    return brownDwarfs;
  } catch (error) {
    console.error('❌ Failed to search brown dwarfs by name:', error);
    throw error;
  }
}

/**
 * Delete a brown dwarf
 * @param id Brown dwarf ID
 * @returns Promise<void>
 */
export async function deleteBrownDwarf(id: string): Promise<void> {
  try {
    await db.brownDwarfs.delete(id);
    console.log('✅ Brown dwarf deleted:', id);
  } catch (error) {
    console.error('❌ Failed to delete brown dwarf:', error);
    throw error;
  }
}

/**
 * Delete all brown dwarfs in a star system
 * @param starSystemId Star system ID
 * @returns Promise<number> Number of deleted brown dwarfs
 */
export async function deleteBrownDwarfsByStarSystem(starSystemId: string): Promise<number> {
  try {
    const count = await db.brownDwarfs
      .where('starSystemId')
      .equals(starSystemId)
      .delete();
    console.log(`✅ Deleted ${count} brown dwarfs from system ${starSystemId}`);
    return count;
  } catch (error) {
    console.error('❌ Failed to delete brown dwarfs by star system:', error);
    throw error;
  }
}

/**
 * Get brown dwarf count
 * @returns Promise<number> Total number of brown dwarfs
 */
export async function getBrownDwarfCount(): Promise<number> {
  try {
    return await db.brownDwarfs.count();
  } catch (error) {
    console.error('❌ Failed to get brown dwarf count:', error);
    throw error;
  }
}

/**
 * Check if a brown dwarf exists
 * @param id Brown dwarf ID
 * @returns Promise<boolean>
 */
export async function brownDwarfExists(id: string): Promise<boolean> {
  try {
    const count = await db.brownDwarfs.where('id').equals(id).count();
    return count > 0;
  } catch (error) {
    console.error('❌ Failed to check if brown dwarf exists:', error);
    throw error;
  }
}

/**
 * Get brown dwarf at specific orbit position
 * @param starSystemId Star system ID
 * @param orbitPosition Orbit position
 * @returns Promise<BrownDwarfData | undefined>
 */
export async function getBrownDwarfByOrbit(
  starSystemId: string,
  orbitPosition: number
): Promise<BrownDwarfData | undefined> {
  try {
    const brownDwarfs = await db.brownDwarfs
      .where('starSystemId')
      .equals(starSystemId)
      .toArray();

    return brownDwarfs.find(bd => bd.orbitPosition === orbitPosition);
  } catch (error) {
    console.error('❌ Failed to get brown dwarf by orbit:', error);
    throw error;
  }
}

/**
 * Check if orbit position is occupied by a brown dwarf
 * @param starSystemId Star system ID
 * @param orbitPosition Orbit position
 * @returns Promise<boolean>
 */
export async function isOrbitOccupiedByBrownDwarf(
  starSystemId: string,
  orbitPosition: number
): Promise<boolean> {
  try {
    const brownDwarf = await getBrownDwarfByOrbit(starSystemId, orbitPosition);
    return brownDwarf !== undefined;
  } catch (error) {
    console.error('❌ Failed to check if orbit occupied by brown dwarf:', error);
    throw error;
  }
}

/**
 * Get brown dwarf count by star system
 * @param starSystemId Star system ID
 * @returns Promise<number>
 */
export async function getBrownDwarfCountByStarSystem(starSystemId: string): Promise<number> {
  try {
    return await db.brownDwarfs.where('starSystemId').equals(starSystemId).count();
  } catch (error) {
    console.error('❌ Failed to get brown dwarf count by star system:', error);
    throw error;
  }
}
