const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ 
  connectionString: 'postgresql://postgres.gsqufinekgjjicqxosxg:***REMOVED***@aws-1-us-east-2.pooler.supabase.com:5432/postgres', 
  ssl: { rejectUnauthorized: false } 
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'admin@void.com' } });
  console.log('User:', user);
  await prisma.$disconnect();
}

main();