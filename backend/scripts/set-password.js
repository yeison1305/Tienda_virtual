const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'yeisonduqueossa@gmail.com' }
  });
  console.log('User:', user);
  
  // Set a known password
  const hash = await bcrypt.hash('***REMOVED***', 10);
  await prisma.user.update({
    where: { email: 'yeisonduqueossa@gmail.com' },
    data: { passwordHash: hash }
  });
  console.log('Password updated to: ***REMOVED***');
}

main().catch(console.error).finally(() => prisma.$disconnect());