// Uso: ADMIN_PASSWORD='...' node scripts/update-admin.js <email>
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const email = process.argv[2];
const password = process.env.ADMIN_PASSWORD;
if (!email || !password) {
  console.error("Uso: ADMIN_PASSWORD='...' node scripts/update-admin.js <email>");
  process.exit(1);
}
if (password.length < 12) {
  console.error('La contraseña de admin debe tener al menos 12 caracteres');
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
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: 'ADMIN' },
    create: { email, passwordHash, role: 'ADMIN' }
  });
  console.log(`Admin ${email} actualizado`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
