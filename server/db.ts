import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let client: any;

export function getPrisma(): any {
  if (client) return client;
  try {
    const mod = require('@prisma/client');
    client = new mod.PrismaClient({ log: ['error'] });
    return client;
  } catch {
    throw new Error('DATABASE_NOT_CONFIGURED');
  }
}

export const prisma: any = new Proxy({}, {
  get(_target, property) {
    return getPrisma()[property];
  },
});

export async function closeDatabase() {
  if (client) await client.$disconnect();
}
