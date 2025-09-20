import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { dogsTable } from '../db/schema';
import { type CreateDogInput } from '../schema';
import { deleteDog } from '../handlers/delete_dog';
import { eq } from 'drizzle-orm';

// Test dog data
const testDog: CreateDogInput = {
  name: 'Buddy',
  breed: 'Golden Retriever',
  description: 'A friendly golden retriever',
  logo_url: 'https://example.com/buddy-logo.jpg',
  photo_url: 'https://example.com/buddy-photo.jpg',
  age: 5,
  is_featured: false
};

const featuredDog: CreateDogInput = {
  name: 'Max',
  breed: 'German Shepherd',
  description: 'A loyal guard dog',
  logo_url: null,
  photo_url: null,
  age: 3,
  is_featured: true
};

describe('deleteDog', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing dog', async () => {
    // Create a test dog
    const insertResult = await db.insert(dogsTable)
      .values(testDog)
      .returning({ id: dogsTable.id })
      .execute();
    
    const dogId = insertResult[0].id;

    // Delete the dog
    const result = await deleteDog(dogId);

    // Should return true indicating successful deletion
    expect(result).toBe(true);

    // Verify dog is deleted from database
    const dogs = await db.select()
      .from(dogsTable)
      .where(eq(dogsTable.id, dogId))
      .execute();

    expect(dogs).toHaveLength(0);
  });

  it('should return false when trying to delete non-existent dog', async () => {
    // Try to delete a dog that doesn't exist
    const result = await deleteDog(99999);

    // Should return false since no dog was found
    expect(result).toBe(false);
  });

  it('should delete featured dog successfully', async () => {
    // Create a featured dog
    const insertResult = await db.insert(dogsTable)
      .values(featuredDog)
      .returning({ id: dogsTable.id })
      .execute();
    
    const dogId = insertResult[0].id;

    // Delete the featured dog
    const result = await deleteDog(dogId);

    // Should return true
    expect(result).toBe(true);

    // Verify dog is deleted
    const dogs = await db.select()
      .from(dogsTable)
      .where(eq(dogsTable.id, dogId))
      .execute();

    expect(dogs).toHaveLength(0);
  });

  it('should not affect other dogs when deleting one dog', async () => {
    // Create multiple dogs
    const insertResults = await db.insert(dogsTable)
      .values([testDog, featuredDog])
      .returning({ id: dogsTable.id })
      .execute();
    
    const [firstDogId, secondDogId] = insertResults.map(r => r.id);

    // Delete only the first dog
    const result = await deleteDog(firstDogId);

    // Should return true
    expect(result).toBe(true);

    // Verify first dog is deleted
    const deletedDog = await db.select()
      .from(dogsTable)
      .where(eq(dogsTable.id, firstDogId))
      .execute();
    expect(deletedDog).toHaveLength(0);

    // Verify second dog still exists
    const remainingDog = await db.select()
      .from(dogsTable)
      .where(eq(dogsTable.id, secondDogId))
      .execute();
    expect(remainingDog).toHaveLength(1);
    expect(remainingDog[0].name).toBe('Max');
  });

  it('should handle deletion with null fields correctly', async () => {
    // Create a dog with minimal data (some fields null)
    const minimalDog: CreateDogInput = {
      name: 'Spot',
      breed: 'Mixed',
      description: null,
      logo_url: null,
      photo_url: null,
      age: null,
      is_featured: false
    };

    const insertResult = await db.insert(dogsTable)
      .values(minimalDog)
      .returning({ id: dogsTable.id })
      .execute();
    
    const dogId = insertResult[0].id;

    // Delete the dog with null fields
    const result = await deleteDog(dogId);

    // Should return true
    expect(result).toBe(true);

    // Verify dog is deleted
    const dogs = await db.select()
      .from(dogsTable)
      .where(eq(dogsTable.id, dogId))
      .execute();

    expect(dogs).toHaveLength(0);
  });
});