import { PrismaClient } from '@prisma/client';

let client: PrismaClient | null = null;

export function getPrisma() {
  if (client) return client;

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL missing');
  }

  client = new PrismaClient({
    log: ['error'],
  });

  return client;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    return (getPrisma() as any)[property];
  },
});

export async function closeDatabase() {
  if (client) {
    await client.$disconnect();
  }
}