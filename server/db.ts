import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

let client: PrismaClient | null = null;

export function getPrisma() {
  if (client) return client;

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL missing');
  }

  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });

  client = new PrismaClient({
    adapter,
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