// Uso: node scripts/check-user.js <email>
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

const email = process.argv[2];
if (!email) {
  console.error('Uso: node scripts/check-user.js <email>');
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error('Falta DATABASE_URL en el .env');
  process.exit(1);
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, role: true }
  });
  console.log('User:', user);
}

main().catch(console.error).finally(() => prisma.$disconnect());
