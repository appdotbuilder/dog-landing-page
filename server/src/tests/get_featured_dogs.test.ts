import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { dogsTable } from '../db/schema';
import { type CreateDogInput } from '../schema';
import { getFeaturedDogs } from '../handlers/get_featured_dogs';

// Test data for creating dogs
const testDog1: CreateDogInput = {
  name: 'Buddy',
  breed: 'Golden Retriever',
  description: 'A friendly golden retriever',
  logo_url: 'https://example.com/buddy-logo.jpg',
  photo_url: 'https://example.com/buddy-photo.jpg',
  age: 3,
  is_featured: true
};

const testDog2: CreateDogInput = {
  name: 'Max',
  breed: 'German Shepherd',
  description: 'A loyal companion',
  logo_url: 'https://example.com/max-logo.jpg',
  photo_url: 'https://example.com/max-photo.jpg',
  age: 5,
  is_featured: false // Not featured
};

const testDog3: CreateDogInput = {
  name: 'Luna',
  breed: 'Border Collie',
  description: 'An energetic border collie',
  logo_url: null,
  photo_url: null,
  age: 2,
  is_featured: true
};

describe('getFeaturedDogs', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no featured dogs exist', async () => {
    // Create a non-featured dog
    await db.insert(dogsTable).values({
      name: testDog2.name,
      breed: testDog2.breed,
      description: testDog2.description,
      logo_url: testDog2.logo_url,
      photo_url: testDog2.photo_url,
      age: testDog2.age,
      is_featured: testDog2.is_featured
    });

    const result = await getFeaturedDogs();
    expect(result).toHaveLength(0);
  });

  it('should return only featured dogs', async () => {
    // Create featured and non-featured dogs
    await db.insert(dogsTable).values([
      {
        name: testDog1.name,
        breed: testDog1.breed,
        description: testDog1.description,
        logo_url: testDog1.logo_url,
        photo_url: testDog1.photo_url,
        age: testDog1.age,
        is_featured: testDog1.is_featured
      },
      {
        name: testDog2.name,
        breed: testDog2.breed,
        description: testDog2.description,
        logo_url: testDog2.logo_url,
        photo_url: testDog2.photo_url,
        age: testDog2.age,
        is_featured: testDog2.is_featured
      },
      {
        name: testDog3.name,
        breed: testDog3.breed,
        description: testDog3.description,
        logo_url: testDog3.logo_url,
        photo_url: testDog3.photo_url,
        age: testDog3.age,
        is_featured: testDog3.is_featured
      }
    ]);

    const result = await getFeaturedDogs();
    
    // Should return only featured dogs (2 out of 3)
    expect(result).toHaveLength(2);
    
    // Verify all returned dogs are featured
    result.forEach(dog => {
      expect(dog.is_featured).toBe(true);
    });

    // Verify specific dogs are returned
    const dogNames = result.map(dog => dog.name);
    expect(dogNames).toContain('Buddy');
    expect(dogNames).toContain('Luna');
    expect(dogNames).not.toContain('Max');
  });

  it('should return dogs ordered by creation date (newest first)', async () => {
    // Create dogs with slight delay to ensure different timestamps
    const dog1Result = await db.insert(dogsTable).values({
      name: testDog1.name,
      breed: testDog1.breed,
      description: testDog1.description,
      logo_url: testDog1.logo_url,
      photo_url: testDog1.photo_url,
      age: testDog1.age,
      is_featured: testDog1.is_featured
    }).returning();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    const dog3Result = await db.insert(dogsTable).values({
      name: testDog3.name,
      breed: testDog3.breed,
      description: testDog3.description,
      logo_url: testDog3.logo_url,
      photo_url: testDog3.photo_url,
      age: testDog3.age,
      is_featured: testDog3.is_featured
    }).returning();

    const result = await getFeaturedDogs();
    
    expect(result).toHaveLength(2);
    
    // Verify ordering - newest first (Luna should come before Buddy)
    expect(result[0].name).toBe('Luna');
    expect(result[1].name).toBe('Buddy');
    
    // Verify timestamps are in descending order
    expect(result[0].created_at >= result[1].created_at).toBe(true);
  });

  it('should return complete dog data with all fields', async () => {
    await db.insert(dogsTable).values({
      name: testDog1.name,
      breed: testDog1.breed,
      description: testDog1.description,
      logo_url: testDog1.logo_url,
      photo_url: testDog1.photo_url,
      age: testDog1.age,
      is_featured: testDog1.is_featured
    });

    const result = await getFeaturedDogs();
    
    expect(result).toHaveLength(1);
    
    const dog = result[0];
    expect(dog.id).toBeDefined();
    expect(dog.name).toBe('Buddy');
    expect(dog.breed).toBe('Golden Retriever');
    expect(dog.description).toBe('A friendly golden retriever');
    expect(dog.logo_url).toBe('https://example.com/buddy-logo.jpg');
    expect(dog.photo_url).toBe('https://example.com/buddy-photo.jpg');
    expect(dog.age).toBe(3);
    expect(dog.is_featured).toBe(true);
    expect(dog.created_at).toBeInstanceOf(Date);
  });

  it('should handle dogs with null optional fields', async () => {
    await db.insert(dogsTable).values({
      name: testDog3.name,
      breed: testDog3.breed,
      description: testDog3.description,
      logo_url: testDog3.logo_url, // null
      photo_url: testDog3.photo_url, // null
      age: testDog3.age,
      is_featured: testDog3.is_featured
    });

    const result = await getFeaturedDogs();
    
    expect(result).toHaveLength(1);
    
    const dog = result[0];
    expect(dog.name).toBe('Luna');
    expect(dog.breed).toBe('Border Collie');
    expect(dog.description).toBe('An energetic border collie');
    expect(dog.logo_url).toBeNull();
    expect(dog.photo_url).toBeNull();
    expect(dog.age).toBe(2);
    expect(dog.is_featured).toBe(true);
  });
});