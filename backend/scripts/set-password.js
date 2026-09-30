// Uso: NEW_PASSWORD='...' node scripts/set-password.js <email>
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const email = process.argv[2];
const password = process.env.NEW_PASSWORD;
if (!email || !password) {
  console.error("Uso: NEW_PASSWORD='...' node scripts/set-password.js <email>");
  process.exit(1);
}
if (password.length < 8) {
  console.error('La contraseña debe tener al menos 8 caracteres');
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const hash = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { email },
    data: { passwordHash: hash }
  });
  console.log(`Contraseña actualizada para ${email}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
