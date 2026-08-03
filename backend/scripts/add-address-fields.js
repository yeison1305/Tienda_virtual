const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Add new columns to Address table
  await prisma.$executeRaw`ALTER TABLE "Address" ADD COLUMN IF NOT EXISTS "isDefault" BOOLEAN DEFAULT false`;
  await prisma.$executeRaw`ALTER TABLE "Address" ADD COLUMN IF NOT EXISTS "recipientName" TEXT`;
  await prisma.$executeRaw`ALTER TABLE "Address" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) DEFAULT NOW()`;
  console.log('Address fields added');
}

main().catch(console.error).finally(() => prisma.$disconnect());