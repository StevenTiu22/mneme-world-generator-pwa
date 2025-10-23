/**
 * Stellar Property Query Utilities
 *
 * Provides cached, efficient access to stellar reference data.
 * Implements in-memory LRU cache for frequently accessed lookups.
 */

import { db } from '../database';
import type { StellarProperty } from '@/models/stellar/data/constants';
import type { StellarClass, StellarGrade } from '@/models/stellar/types/enums';

// =====================
// Cache Implementation
// =====================

/**
 * Simple LRU (Least Recently Used) cache for stellar properties
 * Caches up to 20 most frequently accessed stellar types
 */
class StellarPropertyCache {
  private cache: Map<string, StellarProperty>;
  private maxSize: number;

  constructor(maxSize = 20) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  /**
   * Get property from cache
   */
  get(key: string): StellarProperty | undefined {
    const value = this.cache.get(key);
    if (value) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  /**
   * Set property in cache
   */
  set(key: string, value: StellarProperty): void {
    // Remove if exists (to update position)
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // Add to end
    this.cache.set(key, value);

    // Evict oldest if over capacity
    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey as string);
    }
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  getStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
    };
  }
}

// Global cache instance
const stellarCache = new StellarPropertyCache(20);

// =====================
// Query Functions
// =====================

/**
 * Get stellar properties for a specific class and grade
 *
 * Uses cache-first strategy for performance
 * Falls back to database if not in cache
 *
 * @param stellarClass - Stellar class (O, B, A, F, G, K, M)
 * @param stellarGrade - Stellar grade (0-9)
 * @returns Stellar property record or undefined if not found
 * @throws Error if database query fails
 */
export async function getStellarProperty(
  stellarClass: StellarClass,
  stellarGrade: StellarGrade
): Promise<StellarProperty | undefined> {
  const id = `${stellarClass}${stellarGrade}`;

  // Check cache first
  const cached = stellarCache.get(id);
  if (cached) {
    console.debug(`🎯 Cache hit for ${id}`);
    return cached;
  }

  // Query database
  try {
    console.debug(`🔍 Cache miss for ${id}, querying database`);

    // Ensure database is open (safe to call multiple times)
    await db.open();

    const property = await db.stellarProperties.get(id as string);

    if (property) {
      // Store in cache for future lookups
      stellarCache.set(id, property);
      console.debug(`💾 Cached ${id}`);
    } else {
      console.warn(`⚠️ Stellar property not found: ${id}`);
    }

    return property;
  } catch (error) {
    console.error(`❌ Error querying stellar property ${id}:`, error);
    throw new Error(
      `Failed to load stellar properties for ${stellarClass}${stellarGrade}`
    );
  }
}

/**
 * Get all stellar properties for a specific class
 *
 * @param stellarClass - Stellar class (O, B, A, F, G, K, M)
 * @returns Array of stellar properties for all grades (0-9)
 * @throws Error if database query fails
 */
export async function getStellarPropertiesByClass(
  stellarClass: StellarClass
): Promise<StellarProperty[]> {
  try {
    const properties = await db.stellarProperties
      .where('stellarClass')
      .equals(stellarClass)
      .sortBy('stellarGrade');

    console.debug(`📊 Loaded ${properties.length} properties for class ${stellarClass}`);
    return properties;
  } catch (error) {
    console.error(`❌ Error querying stellar class ${stellarClass}:`, error);
    throw new Error(`Failed to load stellar properties for class ${stellarClass}`);
  }
}

/**
 * Get all stellar properties (all classes and grades)
 *
 * Warning: This loads all 70 records. Use sparingly.
 *
 * @returns Array of all stellar properties
 * @throws Error if database query fails
 */
export async function getAllStellarProperties(): Promise<StellarProperty[]> {
  try {
    const properties = await db.stellarProperties.toArray();
    console.debug(`📊 Loaded all ${properties.length} stellar properties`);
    return properties;
  } catch (error) {
    console.error('❌ Error loading all stellar properties:', error);
    throw new Error('Failed to load stellar reference data');
  }
}

/**
 * Preload frequently used stellar properties into cache
 *
 * Useful for improving initial page load performance.
 * Call this after database initialization.
 *
 * Default: Preloads common star types (G-class, K-class, M-class)
 */
export async function preloadCommonStellarProperties(): Promise<void> {
  const commonTypes: Array<{ class: StellarClass; grade: StellarGrade }> = [
    { class: 'G', grade: 0 },
    { class: 'G', grade: 2 },
    { class: 'G', grade: 5 }, // Sun-like
    { class: 'K', grade: 0 },
    { class: 'K', grade: 5 },
    { class: 'M', grade: 0 },
    { class: 'M', grade: 3 },
    { class: 'M', grade: 5 },
  ];

  console.log('🚀 Preloading common stellar properties...');

  try {
    await Promise.all(
      commonTypes.map(({ class: stellarClass, grade }) =>
        getStellarProperty(stellarClass, grade)
      )
    );
    console.log('✅ Preloaded common stellar properties');
  } catch (error) {
    console.error('⚠️ Error preloading stellar properties:', error);
    // Non-critical error, continue app execution
  }
}

/**
 * Clear the stellar property cache
 *
 * Useful for development/testing or memory management
 */
export function clearStellarPropertyCache(): void {
  stellarCache.clear();
  console.log('🧹 Stellar property cache cleared');
}

/**
 * Get cache statistics
 *
 * @returns Object with cache size and max size
 */
export function getStellarCacheStats(): { size: number; maxSize: number } {
  return stellarCache.getStats();
}
