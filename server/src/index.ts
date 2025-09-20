import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schema types
import { 
  createDogInputSchema, 
  updateDogInputSchema, 
  getDogsByFilterSchema 
} from './schema';

// Import handlers
import { createDog } from './handlers/create_dog';
import { getDogs } from './handlers/get_dogs';
import { getFeaturedDogs } from './handlers/get_featured_dogs';
import { getDogsByBreed } from './handlers/get_dogs_by_breed';
import { getDogById } from './handlers/get_dog_by_id';
import { updateDog } from './handlers/update_dog';
import { deleteDog } from './handlers/delete_dog';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check endpoint
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Create a new dog
  createDog: publicProcedure
    .input(createDogInputSchema)
    .mutation(({ input }) => createDog(input)),

  // Get all dogs
  getDogs: publicProcedure
    .query(() => getDogs()),

  // Get featured dogs for the landing page
  getFeaturedDogs: publicProcedure
    .query(() => getFeaturedDogs()),

  // Get dogs by breed
  getDogsByBreed: publicProcedure
    .input(z.object({ breed: z.string() }))
    .query(({ input }) => getDogsByBreed(input.breed)),

  // Get a single dog by ID
  getDogById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => getDogById(input.id)),

  // Update a dog
  updateDog: publicProcedure
    .input(updateDogInputSchema)
    .mutation(({ input }) => updateDog(input)),

  // Delete a dog
  deleteDog: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteDog(input.id)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();