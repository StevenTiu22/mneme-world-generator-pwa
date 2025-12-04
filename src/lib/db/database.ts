/**
 * Dexie.js Database Configuration
 *
 * Central database for Mneme World Generator PWA.
 * Uses IndexedDB via Dexie.js for offline-first data storage.
 *
 * Focus: Primary Star lookup values (read-only reference data)
 */

import Dexie, { type EntityTable } from 'dexie';
import type { StellarProperty } from '@/models/stellar/data/constants';
import type { StarData, StarSystem } from '@/models/stellar/types/interface';
import type { WorldData } from '@/models/world';
import type { MoonData } from '@/models/world/moon';
import type { PlanetData } from '@/models/world/planet';
import type { StarportData } from '@/models/world/starport';

// =====================
// Database Schema
// =====================

/**
 * MnemeDB - Main database class
 *
 * Version 1: Stellar reference data for Primary Star lookups
 * Version 2: Added starSystems table for persistent user-created star systems
 * Version 3: Added worlds table for planetary data
 * Version 4: Added moons and planets tables for complete system modeling
 * Version 5: Added starports table for starport facilities data
 */
export class MnemeDB extends Dexie {
  // Reference data tables (read-only, seeded once on first load)
  stellarProperties!: EntityTable<StellarProperty, 'id'>;

  // User data tables
  stars!: EntityTable<StarData, 'id'>;
  starSystems!: EntityTable<StarSystem, 'id'>;
  worlds!: EntityTable<WorldData, 'id'>;
  moons!: EntityTable<MoonData, 'id'>;
  planets!: EntityTable<PlanetData, 'id'>;
  starports!: EntityTable<StarportData, 'id'>;

  constructor() {
    super('MnemeDB');

    // Define database schema v1
    this.version(1).stores({
      // Reference data - indexed by id (e.g., "G5")
      // Compound index on [stellarClass+stellarGrade] for efficient queries
      stellarProperties: 'id, [stellarClass+stellarGrade]',

      // User stars - indexed by id, searchable by stellar properties
      stars: 'id, name, stellarClass, stellarGrade, createdAt',
    });

    // Database schema v2 - Add starSystems table
    this.version(2).stores({
      // Reference data (unchanged)
      stellarProperties: 'id, [stellarClass+stellarGrade]',

      // User stars (unchanged)
      stars: 'id, name, stellarClass, stellarGrade, createdAt',

      // User star systems - complete systems with primary + companions
      starSystems: 'id, name, createdAt',
    });

    // Database schema v3 - Add worlds table
    this.version(3).stores({
      // Reference data (unchanged)
      stellarProperties: 'id, [stellarClass+stellarGrade]',

      // User stars (unchanged)
      stars: 'id, name, stellarClass, stellarGrade, createdAt',

      // User star systems (unchanged)
      starSystems: 'id, name, createdAt',

      // User worlds - planets/habitats linked to star systems
      worlds: 'id, name, starSystemId, createdAt',
    });

    // Database schema v4 - Add moons and planets tables
    this.version(4).stores({
      // Reference data (unchanged)
      stellarProperties: 'id, [stellarClass+stellarGrade]',

      // User stars (unchanged)
      stars: 'id, name, stellarClass, stellarGrade, createdAt',

      // User star systems (unchanged)
      starSystems: 'id, name, createdAt',

      // User worlds (unchanged)
      worlds: 'id, name, starSystemId, createdAt',

      // User moons - natural satellites linked to specific worlds
      // Indexed by worldId for efficient world-specific queries
      // Indexed by starSystemId for system-wide queries
      moons: 'id, name, worldId, starSystemId, createdAt',

      // User planets - secondary planets (gas giants, ice giants, belts)
      // Indexed by starSystemId and orbitPosition for orbital organization
      planets: 'id, name, starSystemId, orbitPosition, createdAt',
    });

    // Database schema v5 - Add starports table
    this.version(5).stores({
      // Reference data (unchanged)
      stellarProperties: 'id, [stellarClass+stellarGrade]',

      // User stars (unchanged)
      stars: 'id, name, stellarClass, stellarGrade, createdAt',

      // User star systems (unchanged)
      starSystems: 'id, name, createdAt',

      // User worlds (unchanged)
      worlds: 'id, name, starSystemId, createdAt',

      // User moons (unchanged)
      moons: 'id, name, worldId, starSystemId, createdAt',

      // User planets (unchanged)
      planets: 'id, name, starSystemId, orbitPosition, createdAt',

      // User starports - port facilities linked to specific worlds
      // Indexed by worldId for efficient world-specific queries
      starports: 'id, worldId, createdAt',
    });
  }
}

// =====================
// Database Instance
// =====================

/**
 * Singleton database instance
 * Import and use this instance throughout the app
 */
export const db = new MnemeDB();

// =====================
// Database Initialization
// =====================

/**
 * Check if database has been seeded with reference data
 */
export async function isDatabaseSeeded(): Promise<boolean> {
  try {
    const count = await db.stellarProperties.count();
    return count > 0;
  } catch (error) {
    console.error('Error checking database seed status:', error);
    throw new Error('Failed to check database initialization status');
  }
}

/**
 * Initialize database with reference data
 * Called on app startup if database is empty
 */
export async function initializeDatabase(): Promise<void> {
  try {
    // Ensure database is open before performing operations
    await db.open();
    console.log('🗄️ Database connection opened');

    const isSeeded = await isDatabaseSeeded();

    if (!isSeeded) {
      console.log('🌟 Seeding Mneme database with stellar reference data...');

      // Import seeding function dynamically to avoid circular dependencies
      const { seedStellarProperties } = await import('./seed');
      await seedStellarProperties();

      console.log('✅ Database seeded with 70 stellar property records');
    } else {
      console.log('✅ Database already initialized');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw new Error('Failed to initialize database. Please refresh the page.');
  }
}

/**
 * Reset database (useful for development/testing)
 * WARNING: This will delete all user data!
 */
export async function resetDatabase(): Promise<void> {
  try {
    console.warn('⚠️ Resetting database - all data will be lost!');
    await db.delete();
    await db.open();
    await initializeDatabase();
    console.log('✅ Database reset complete');
  } catch (error) {
    console.error('Error resetting database:', error);
    throw new Error('Failed to reset database');
  }
}

// =====================
// Database Initialization
// =====================

// Note: Database initialization is now handled explicitly in main.tsx
// to ensure proper timing and avoid race conditions with useLiveQuery
