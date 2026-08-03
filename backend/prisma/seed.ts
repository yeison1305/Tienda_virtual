import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL!,
  ssl: { rejectUnauthorized: false },
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // Clean existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.category.deleteMany();
  await prisma.newsletterSubscription.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  const jeans = await prisma.category.upsert({
    where: { slug: 'jeans' },
    update: {},
    create: { name: 'Jeans', slug: 'jeans' },
  });

  const camisetas = await prisma.category.upsert({
    where: { slug: 'camisetas' },
    update: {},
    create: { name: 'Camisetas', slug: 'camisetas' },
  });

  const chaquetas = await prisma.category.upsert({
    where: { slug: 'chaquetas' },
    update: {},
    create: { name: 'Chaquetas', slug: 'chaquetas' },
  });

  const hoodies = await prisma.category.upsert({
    where: { slug: 'hoodies' },
    update: {},
    create: { name: 'Hoodies', slug: 'hoodies' },
  });

  const accesorios = await prisma.category.upsert({
    where: { slug: 'accesorios' },
    update: {},
    create: { name: 'Accesorios', slug: 'accesorios' },
  });

  // Create Collections
  const nuevaColeccion = await prisma.collection.upsert({
    where: { slug: 'nueva-coleccion' },
    update: {},
    create: { name: 'Nueva Colección', slug: 'nueva-coleccion', tag: 'NEW', description: 'Los últimos lanzamientos de la temporada', image: 'https://images.unsplash.com/photo-1662532577856-e8ee8b138a8b?w=600&h=700&fit=crop&auto=format&q=80' },
  });

  const bestSellers = await prisma.collection.upsert({
    where: { slug: 'best-sellers' },
    update: {},
    create: { name: 'Best Sellers', slug: 'best-sellers', tag: 'TOP', description: 'Los productos más vendidos', image: 'https://images.unsplash.com/photo-1578432156830-0ca0d7913b7f?w=600&h=700&fit=crop&auto=format&q=80' },
  });

  const streetwear = await prisma.collection.upsert({
    where: { slug: 'streetwear' },
    update: {},
    create: { name: 'Streetwear', slug: 'streetwear', tag: 'DROP', description: 'Estilo urbano y moderno', image: 'https://images.unsplash.com/photo-1629511565591-a1d494ad6c58?w=600&h=700&fit=crop&auto=format&q=80' },
  });

  const denim = await prisma.collection.upsert({
    where: { slug: 'denim' },
    update: {},
    create: { name: 'Denim', slug: 'denim', tag: 'EDIT', description: 'Lo mejor en denim', image: 'https://images.unsplash.com/photo-1613915617430-8ab0fd7c6baf?w=600&h=700&fit=crop&auto=format&q=80' },
  });

  const oversized = await prisma.collection.upsert({
    where: { slug: 'oversized' },
    update: {},
    create: { name: 'Oversized', slug: 'oversized', tag: 'FW25', description: 'Siloutas amplias y cómodas', image: 'https://images.unsplash.com/photo-1659522761084-79196b64abe4?w=600&h=700&fit=crop&auto=format&q=80' },
  });

  const limitedEdition = await prisma.collection.upsert({
    where: { slug: 'limited-edition' },
    update: {},
    create: { name: 'Limited Edition', slug: 'limited-edition', tag: 'LTD', description: 'Piezas exclusivas y limitadas', image: 'https://images.unsplash.com/photo-1664515226058-03952a19bd76?w=600&h=700&fit=crop&auto=format&q=80' },
  });

  const p1 = await prisma.product.create({
    data: {
      name: 'Jean Slim Fit',
      description: 'Jean de corte slim fit en denim premium',
      price: 89900,
      compareAtPrice: 119900,
      categoryId: jeans.id,
      images: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&h=800&fit=crop&auto=format&q=80'],
      active: true,
      collections: {
        connect: [{ id: nuevaColeccion.id }, { id: denim.id }],
      },
      variants: {
        create: [
          { size: 'S', color: '#1A1A2E', stock: 10, sku: 'JS-S-NEG' },
          { size: 'M', color: '#1A1A2E', stock: 15, sku: 'JM-M-NEG' },
          { size: 'L', color: '#4A4A4A', stock: 8, sku: 'JL-L-GRA' },
          { size: 'XL', color: '#8B6914', stock: 5, sku: 'JXL-XL-DOR' },
        ],
      },
    },
  });

  const p2 = await prisma.product.create({
    data: {
      name: 'Camiseta Oversized',
      description: 'Camiseta oversized en algodón premium',
      price: 45900,
      compareAtPrice: 59900,
      categoryId: camisetas.id,
      images: ['https://images.unsplash.com/photo-1601762603339-fd61e28b698a?w=600&h=800&fit=crop&auto=format&q=80'],
      active: true,
      collections: {
        connect: [{ id: nuevaColeccion.id }, { id: oversized.id }, { id: bestSellers.id }],
      },
      variants: {
        create: [
          { size: 'S', color: '#FAFAFA', stock: 20, sku: 'CS-S-BLA' },
          { size: 'M', color: '#0A0A0A', stock: 25, sku: 'CM-M-NEG' },
          { size: 'L', color: '#C4A882', stock: 12, sku: 'CL-L-CAV' },
        ],
      },
    },
  });

  const p3 = await prisma.product.create({
    data: {
      name: 'Chaqueta Premium',
      description: 'Chaqueta premium con forro interior',
      price: 159900,
      compareAtPrice: 199900,
      categoryId: chaquetas.id,
      images: ['https://images.unsplash.com/photo-1627637454030-5ddd536e06e5?w=600&h=800&fit=crop&auto=format&q=80'],
      active: true,
      collections: {
        connect: [{ id: streetwear.id }, { id: limitedEdition.id }],
      },
      variants: {
        create: [
          { size: 'M', color: '#2C2C2C', stock: 6, sku: 'CHM-M-NEG' },
          { size: 'L', color: '#6B4423', stock: 4, sku: 'CHL-L-MAR' },
          { size: 'XL', color: '#1C3A5E', stock: 3, sku: 'CHXL-XL-AZU' },
        ],
      },
    },
  });

  const p4 = await prisma.product.create({
    data: {
      name: 'Hoodie Essential',
      description: 'Hoodie essentials en algodón grueso',
      price: 75900,
      compareAtPrice: 95900,
      categoryId: hoodies.id,
      images: ['https://images.unsplash.com/photo-1508216310976-c518daae0cdc?w=600&h=800&fit=crop&auto=format&q=80'],
      active: true,
      collections: {
        connect: [{ id: bestSellers.id }, { id: oversized.id }],
      },
      variants: {
        create: [
          { size: 'S', color: '#EBEBEB', stock: 10, sku: 'HS-S-BLA' },
          { size: 'M', color: '#0A0A0A', stock: 18, sku: 'HM-M-NEG' },
          { size: 'L', color: '#8B7355', stock: 7, sku: 'HL-L-CAM' },
        ],
      },
    },
  });

  console.log('Seed completo:');
  console.log('  Categorías: jeans, camisetas, chaquetas, hoodies, accesorios');
  console.log('  Colecciones:', [nuevaColeccion.name, bestSellers.name, streetwear.name, denim.name, oversized.name, limitedEdition.name].join(', '));
  console.log('  Productos:', [p1.name, p2.name, p3.name, p4.name].join(', '));
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
