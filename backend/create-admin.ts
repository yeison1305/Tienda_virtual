import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL!, ssl: { rejectUnauthorized: false } });
  const prisma = new PrismaClient({ adapter });

  await prisma.user.upsert({
    where: { email: 'admin@void.com' },
    update: { role: 'ADMIN' },
    create: { email: 'admin@void.com', passwordHash: '$2b$10$testhash', role: 'ADMIN' }
  });

  console.log('Admin created');
  await prisma.$disconnect();
}

main();