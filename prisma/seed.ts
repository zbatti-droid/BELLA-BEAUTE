import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.service.upsert({
    where: { slug: 'hair-styling' },
    update: {},
    create: { title: 'Hair Styling', slug: 'hair-styling', description: 'Signature styling for every occasion.', priceFrom: 250 },
  });
  await prisma.service.upsert({
    where: { slug: 'bridal-beauty' },
    update: {},
    create: { title: 'Bridal Beauty', slug: 'bridal-beauty', description: 'A complete bridal preparation experience.', priceFrom: 1200 },
  });
  console.log('Bella Beauté seed complete');
}

main().finally(() => prisma.$disconnect());
