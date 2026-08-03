import { Request, Response } from 'express';
import { prisma } from '../server';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { category, collection, search, limit, minPrice, maxPrice, size, color, sort } = req.query;
    let whereClause: any = { active: true };

    if (category) {
      whereClause.category = { slug: category };
    }

    if (collection) {
      whereClause.collections = { some: { slug: collection } };
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    // Price filters
    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) whereClause.price.gte = parseInt(minPrice as string);
      if (maxPrice) whereClause.price.lte = parseInt(maxPrice as string);
    }

    // Variant filters (size, color) - filter products that have variants matching these
    if (size || color) {
      whereClause.variants = { some: {} };
      if (size) (whereClause.variants.some as any).size = size;
      if (color) (whereClause.variants.some as any).color = color;
    }

    // Sorting
    let orderBy: any = { createdAt: 'desc' };
    switch (sort) {
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'name_asc':
        orderBy = { name: 'asc' };
        break;
      case 'name_desc':
        orderBy = { name: 'desc' };
        break;
    }

    const take = limit ? parseInt(limit as string) : undefined;

    const products = await prisma.product.findMany({
      where: whereClause,
      ...(take !== undefined && { take }),
      orderBy,
      include: { category: true, variants: true, collections: true }
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true, variants: true, collections: true }
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

export const getCollections = async (req: Request, res: Response) => {
  try {
    const collections = await prisma.collection.findMany({
      include: { products: { where: { active: true }, take: 1 } },
      orderBy: { createdAt: 'asc' }
    });
    res.json(collections);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch collections' });
  }
};

export const getCollectionBySlug = async (req: Request, res: Response) => {
  try {
    const slug = String(req.params.slug);
    const collection = await prisma.collection.findUnique({
      where: { slug },
      include: { products: { where: { active: true }, include: { variants: true, category: true } } }
    });

    if (!collection) {
      res.status(404).json({ error: 'Collection not found' });
      return;
    }
    res.json(collection);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch collection' });
  }
};
