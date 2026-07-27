const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ 
  connectionString: 'postgresql://postgres.gsqufinekgjjicqxosxg:***REMOVED***@aws-1-us-east-2.pooler.supabase.com:5432/postgres', 
  ssl: { rejectUnauthorized: false } 
});
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.user.upsert({
    where: { email: 'admin@void.com' },
    update: { role: 'ADMIN' },
    create: { email: 'admin@void.com', passwordHash: '$2b$10$testhash', role: 'ADMIN' }
  });
  console.log('Admin created');
  await prisma.$disconnect();
}

main();