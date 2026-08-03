require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$executeRaw`ALTER TABLE "ProductVariant" DROP COLUMN IF EXISTS "sku"`;
  console.log('SKU column dropped');
}

main().catch(console.error).finally(() => prisma.$disconnect());