const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Get user
  const user = await prisma.user.findUnique({
    where: { email: 'updated@test.com' }
  });
  
  if (!user) {
    console.log('User not found');
    return;
  }
  
  console.log('User:', user.id, user.email);
  
  // Get orders
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: {
      items: {
        include: {
          variant: { include: { product: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  
  console.log('\nOrders:', orders.length);
  orders.forEach(o => {
    console.log(`  - ${o.id} | ${o.status} | ${o.total} | ${o.createdAt}`);
  });
  
  // Get addresses
  const addresses = await prisma.address.findMany({
    where: { userId: user.id }
  });
  console.log('\nAddresses:', addresses.length);
  addresses.forEach(a => console.log(`  - ${a.id} | ${a.line1}, ${a.city} | default: ${a.isDefault}`));
  
  // Get all users
  const allUsers = await prisma.user.findMany();
  console.log('\nAll users:', allUsers.map(u => ({ id: u.id, email: u.email, role: u.role })));
}

main().catch(console.error).finally(() => prisma.$disconnect());