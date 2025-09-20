import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { dogsTable } from '../db/schema';
import { type CreateDogInput } from '../schema';
import { getDogById } from '../handlers/get_dog_by_id';

// Test dog data
const testDogInput: CreateDogInput = {
  name: 'Buddy',
  breed: 'Golden Retriever',
  description: 'A friendly and loyal companion',
  logo_url: 'https://example.com/buddy-logo.jpg',
  photo_url: 'https://example.com/buddy-photo.jpg',
  age: 3,
  is_featured: true
};

const secondTestDogInput: CreateDogInput = {
  name: 'Max',
  breed: 'German Shepherd',
  description: null,
  logo_url: null,
  photo_url: null,
  age: null,
  is_featured: false
};

describe('getDogById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return a dog when found by ID', async () => {
    // Create a test dog
    const insertResult = await db.insert(dogsTable)
      .values(testDogInput)
      .returning()
      .execute();

    const createdDog = insertResult[0];

    // Get the dog by ID
    const result = await getDogById(createdDog.id);

    // Verify the result
    expect(result).not.toBeNull();
    expect(result!.id).toBe(createdDog.id);
    expect(result!.name).toBe('Buddy');
    expect(result!.breed).toBe('Golden Retriever');
    expect(result!.description).toBe('A friendly and loyal companion');
    expect(result!.logo_url).toBe('https://example.com/buddy-logo.jpg');
    expect(result!.photo_url).toBe('https://example.com/buddy-photo.jpg');
    expect(result!.age).toBe(3);
    expect(result!.is_featured).toBe(true);
    expect(result!.created_at).toBeInstanceOf(Date);
  });

  it('should return null when dog is not found', async () => {
    // Try to get a dog with non-existent ID
    const result = await getDogById(999);

    expect(result).toBeNull();
  });

  it('should handle dogs with null fields correctly', async () => {
    // Create a dog with nullable fields set to null
    const insertResult = await db.insert(dogsTable)
      .values(secondTestDogInput)
      .returning()
      .execute();

    const createdDog = insertResult[0];

    // Get the dog by ID
    const result = await getDogById(createdDog.id);

    // Verify the result handles null fields correctly
    expect(result).not.toBeNull();
    expect(result!.id).toBe(createdDog.id);
    expect(result!.name).toBe('Max');
    expect(result!.breed).toBe('German Shepherd');
    expect(result!.description).toBeNull();
    expect(result!.logo_url).toBeNull();
    expect(result!.photo_url).toBeNull();
    expect(result!.age).toBeNull();
    expect(result!.is_featured).toBe(false);
    expect(result!.created_at).toBeInstanceOf(Date);
  });

  it('should return the correct dog when multiple dogs exist', async () => {
    // Create multiple test dogs
    const firstInsertResult = await db.insert(dogsTable)
      .values(testDogInput)
      .returning()
      .execute();

    const secondInsertResult = await db.insert(dogsTable)
      .values(secondTestDogInput)
      .returning()
      .execute();

    const firstDog = firstInsertResult[0];
    const secondDog = secondInsertResult[0];

    // Get the second dog by its specific ID
    const result = await getDogById(secondDog.id);

    // Verify we got the correct dog
    expect(result).not.toBeNull();
    expect(result!.id).toBe(secondDog.id);
    expect(result!.name).toBe('Max');
    expect(result!.breed).toBe('German Shepherd');
    
    // Verify it's not the first dog
    expect(result!.id).not.toBe(firstDog.id);
    expect(result!.name).not.toBe('Buddy');
  });

  it('should handle edge case with ID 0', async () => {
    // Try to get a dog with ID 0 (should return null as IDs start from 1)
    const result = await getDogById(0);

    expect(result).toBeNull();
  });

  it('should handle negative ID correctly', async () => {
    // Try to get a dog with negative ID
    const result = await getDogById(-1);

    expect(result).toBeNull();
  });
});