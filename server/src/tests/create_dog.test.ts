import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { dogsTable } from '../db/schema';
import { type CreateDogInput } from '../schema';
import { createDog } from '../handlers/create_dog';
import { eq } from 'drizzle-orm';

// Complete test input with all fields
const testInput: CreateDogInput = {
  name: 'Buddy',
  breed: 'Golden Retriever',
  description: 'A friendly and energetic dog',
  logo_url: 'https://example.com/buddy-logo.jpg',
  photo_url: 'https://example.com/buddy-photo.jpg',
  age: 3,
  is_featured: true
};

// Minimal test input with required fields only
const minimalInput: CreateDogInput = {
  name: 'Rex',
  breed: 'German Shepherd',
  description: null,
  logo_url: null,
  photo_url: null,
  age: null,
  is_featured: false // Zod default applied
};

describe('createDog', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a dog with all fields', async () => {
    const result = await createDog(testInput);

    // Basic field validation
    expect(result.name).toEqual('Buddy');
    expect(result.breed).toEqual('Golden Retriever');
    expect(result.description).toEqual('A friendly and energetic dog');
    expect(result.logo_url).toEqual('https://example.com/buddy-logo.jpg');
    expect(result.photo_url).toEqual('https://example.com/buddy-photo.jpg');
    expect(result.age).toEqual(3);
    expect(result.is_featured).toEqual(true);
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should create a dog with minimal required fields', async () => {
    const result = await createDog(minimalInput);

    // Validate required fields
    expect(result.name).toEqual('Rex');
    expect(result.breed).toEqual('German Shepherd');
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.created_at).toBeInstanceOf(Date);
    
    // Validate nullable fields
    expect(result.description).toBeNull();
    expect(result.logo_url).toBeNull();
    expect(result.photo_url).toBeNull();
    expect(result.age).toBeNull();
    expect(result.is_featured).toEqual(false);
  });

  it('should save dog to database', async () => {
    const result = await createDog(testInput);

    // Query database to verify persistence
    const dogs = await db.select()
      .from(dogsTable)
      .where(eq(dogsTable.id, result.id))
      .execute();

    expect(dogs).toHaveLength(1);
    const savedDog = dogs[0];
    
    expect(savedDog.name).toEqual('Buddy');
    expect(savedDog.breed).toEqual('Golden Retriever');
    expect(savedDog.description).toEqual('A friendly and energetic dog');
    expect(savedDog.logo_url).toEqual('https://example.com/buddy-logo.jpg');
    expect(savedDog.photo_url).toEqual('https://example.com/buddy-photo.jpg');
    expect(savedDog.age).toEqual(3);
    expect(savedDog.is_featured).toEqual(true);
    expect(savedDog.created_at).toBeInstanceOf(Date);
  });

  it('should handle dogs with default is_featured value', async () => {
    const inputWithoutFeatured: CreateDogInput = {
      name: 'Max',
      breed: 'Labrador',
      description: null,
      logo_url: null,
      photo_url: null,
      age: null,
      is_featured: false // Zod default
    };

    const result = await createDog(inputWithoutFeatured);
    
    expect(result.name).toEqual('Max');
    expect(result.breed).toEqual('Labrador');
    expect(result.is_featured).toEqual(false);
    expect(result.id).toBeDefined();
  });

  it('should create multiple dogs with unique IDs', async () => {
    const dog1 = await createDog({
      ...testInput,
      name: 'Dog1'
    });
    
    const dog2 = await createDog({
      ...testInput,
      name: 'Dog2'
    });

    expect(dog1.id).toBeDefined();
    expect(dog2.id).toBeDefined();
    expect(dog1.id).not.toEqual(dog2.id);
    expect(dog1.name).toEqual('Dog1');
    expect(dog2.name).toEqual('Dog2');
  });

  it('should preserve timestamps correctly', async () => {
    const before = new Date();
    const result = await createDog(testInput);
    const after = new Date();

    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.created_at.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(result.created_at.getTime()).toBeLessThanOrEqual(after.getTime());
  });
});