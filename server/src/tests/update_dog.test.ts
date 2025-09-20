import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { dogsTable } from '../db/schema';
import { type UpdateDogInput, type CreateDogInput } from '../schema';
import { updateDog } from '../handlers/update_dog';
import { eq } from 'drizzle-orm';

// Helper function to create a test dog
const createTestDog = async (dogData: CreateDogInput) => {
  const result = await db.insert(dogsTable)
    .values(dogData)
    .returning()
    .execute();
  return result[0];
};

// Test data
const testDogData: CreateDogInput = {
  name: 'Buddy',
  breed: 'Golden Retriever',
  description: 'Friendly and energetic dog',
  logo_url: 'https://example.com/buddy-logo.jpg',
  photo_url: 'https://example.com/buddy-photo.jpg',
  age: 3,
  is_featured: false
};

describe('updateDog', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update a dog with all fields', async () => {
    // Create test dog first
    const createdDog = await createTestDog(testDogData);

    // Update data
    const updateInput: UpdateDogInput = {
      id: createdDog.id,
      name: 'Updated Buddy',
      breed: 'Labrador',
      description: 'Very friendly dog',
      logo_url: 'https://example.com/new-logo.jpg',
      photo_url: 'https://example.com/new-photo.jpg',
      age: 4,
      is_featured: true
    };

    const result = await updateDog(updateInput);

    // Verify the updated dog
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdDog.id);
    expect(result!.name).toEqual('Updated Buddy');
    expect(result!.breed).toEqual('Labrador');
    expect(result!.description).toEqual('Very friendly dog');
    expect(result!.logo_url).toEqual('https://example.com/new-logo.jpg');
    expect(result!.photo_url).toEqual('https://example.com/new-photo.jpg');
    expect(result!.age).toEqual(4);
    expect(result!.is_featured).toEqual(true);
    expect(result!.created_at).toBeInstanceOf(Date);
  });

  it('should update only specified fields', async () => {
    // Create test dog first
    const createdDog = await createTestDog(testDogData);

    // Update only name and age
    const updateInput: UpdateDogInput = {
      id: createdDog.id,
      name: 'New Name',
      age: 5
    };

    const result = await updateDog(updateInput);

    // Verify only specified fields were updated
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdDog.id);
    expect(result!.name).toEqual('New Name');
    expect(result!.age).toEqual(5);
    // These fields should remain unchanged
    expect(result!.breed).toEqual(testDogData.breed);
    expect(result!.description).toEqual(testDogData.description);
    expect(result!.logo_url).toEqual(testDogData.logo_url);
    expect(result!.photo_url).toEqual(testDogData.photo_url);
    expect(result!.is_featured).toEqual(testDogData.is_featured);
  });

  it('should set nullable fields to null', async () => {
    // Create test dog first
    const createdDog = await createTestDog(testDogData);

    // Update nullable fields to null
    const updateInput: UpdateDogInput = {
      id: createdDog.id,
      description: null,
      logo_url: null,
      photo_url: null,
      age: null
    };

    const result = await updateDog(updateInput);

    // Verify nullable fields were set to null
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdDog.id);
    expect(result!.description).toBeNull();
    expect(result!.logo_url).toBeNull();
    expect(result!.photo_url).toBeNull();
    expect(result!.age).toBeNull();
    // Non-nullable fields should remain unchanged
    expect(result!.name).toEqual(testDogData.name);
    expect(result!.breed).toEqual(testDogData.breed);
    expect(result!.is_featured).toEqual(testDogData.is_featured);
  });

  it('should return null when dog does not exist', async () => {
    const updateInput: UpdateDogInput = {
      id: 999, // Non-existent ID
      name: 'Non-existent Dog'
    };

    const result = await updateDog(updateInput);

    expect(result).toBeNull();
  });

  it('should return existing dog when no fields to update', async () => {
    // Create test dog first
    const createdDog = await createTestDog(testDogData);

    // Update with only ID (no fields to update)
    const updateInput: UpdateDogInput = {
      id: createdDog.id
    };

    const result = await updateDog(updateInput);

    // Should return the existing dog unchanged
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdDog.id);
    expect(result!.name).toEqual(testDogData.name);
    expect(result!.breed).toEqual(testDogData.breed);
    expect(result!.description).toEqual(testDogData.description);
    expect(result!.is_featured).toEqual(testDogData.is_featured);
  });

  it('should update dog in database', async () => {
    // Create test dog first
    const createdDog = await createTestDog(testDogData);

    // Update the dog
    const updateInput: UpdateDogInput = {
      id: createdDog.id,
      name: 'Database Test Dog',
      is_featured: true
    };

    await updateDog(updateInput);

    // Query database directly to verify update
    const dogs = await db.select()
      .from(dogsTable)
      .where(eq(dogsTable.id, createdDog.id))
      .execute();

    expect(dogs).toHaveLength(1);
    expect(dogs[0].name).toEqual('Database Test Dog');
    expect(dogs[0].is_featured).toEqual(true);
    expect(dogs[0].breed).toEqual(testDogData.breed); // Unchanged
  });

  it('should handle featured status toggle', async () => {
    // Create featured dog
    const featuredDogData = { ...testDogData, is_featured: true };
    const createdDog = await createTestDog(featuredDogData);

    // Toggle featured status
    const updateInput: UpdateDogInput = {
      id: createdDog.id,
      is_featured: false
    };

    const result = await updateDog(updateInput);

    expect(result).not.toBeNull();
    expect(result!.is_featured).toEqual(false);
  });

  it('should preserve created_at timestamp', async () => {
    // Create test dog first
    const createdDog = await createTestDog(testDogData);
    const originalCreatedAt = createdDog.created_at;

    // Update the dog
    const updateInput: UpdateDogInput = {
      id: createdDog.id,
      name: 'Updated Name'
    };

    const result = await updateDog(updateInput);

    // created_at should remain unchanged
    expect(result).not.toBeNull();
    expect(result!.created_at).toEqual(originalCreatedAt);
  });
});