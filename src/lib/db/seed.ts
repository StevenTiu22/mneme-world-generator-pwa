/**
 * Database Seeding Utilities
 *
 * Seeds the Dexie.js database with stellar reference data.
 * This data is read-only and used for lookups when creating Primary Stars.
 */

import { db } from './database';
import { generateAllStellarProperties } from '@/models/stellar/data/constants';

/**
 * Seed stellar properties table with all class/grade combinations
 *
 * Generates 70 records (7 stellar classes × 10 grades)
 * Each record contains: mass, luminosity, radius, temperature, color, description
 *
 * @throws Error if seeding fails
 */
export async function seedStellarProperties(): Promise<void> {
  try {
    // Generate all 70 stellar property records
    const records = generateAllStellarProperties();

    console.log(`📊 Generated ${records.length} stellar property records`);

    // Bulk insert into database
    await db.stellarProperties.bulkAdd(records);

    console.log(`✅ Successfully seeded ${records.length} stellar properties`);
  } catch (error) {
    console.error('❌ Error seeding stellar properties:', error);
    throw new Error('Failed to seed stellar reference data');
  }
}

/**
 * Verify database seeding integrity
 *
 * Checks that all expected records are present
 * @returns true if all records exist, false otherwise
 */
export async function verifyStellarPropertiesSeed(): Promise<boolean> {
  try {
    const count = await db.stellarProperties.count();
    const expectedCount = 70; // 7 classes × 10 grades

    if (count !== expectedCount) {
      console.warn(
        `⚠️ Unexpected record count: expected ${expectedCount}, found ${count}`
      );
      return false;
    }

    // Verify a few key records exist
    const testRecords = [
      'G5', // Sun-like star
      'M0', // Red dwarf
      'O0', // Hot blue star
      'K5', // Cool orange star
    ];

    for (const id of testRecords) {
      const record = await db.stellarProperties.get(id);
      if (!record) {
        console.warn(`⚠️ Missing expected record: ${id}`);
        return false;
      }
    }

    console.log('✅ Database seeding verified successfully');
    return true;
  } catch (error) {
    console.error('Error verifying database seed:', error);
    return false;
  }
}
