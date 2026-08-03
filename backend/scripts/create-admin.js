"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
async function main() {
    const adapter = new adapter_pg_1.PrismaPg({ connectionString: process.env.DIRECT_URL, ssl: { rejectUnauthorized: false } });
    const prisma = new client_1.PrismaClient({ adapter });
    await prisma.user.upsert({
        where: { email: 'admin@void.com' },
        update: { role: 'ADMIN' },
        create: { email: 'admin@void.com', passwordHash: '$2b$10$testhash', role: 'ADMIN' }
    });
    console.log('Admin created');
    await prisma.$disconnect();
}
main();
//# sourceMappingURL=create-admin.js.map