import { Request, Response } from 'express';
import { prisma } from '../server';

export const getCollections = async (req: Request, res: Response) => {
  try {
    const collections = await prisma.collection.findMany({
      orderBy: { createdAt: 'desc' }
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
      include: { products: { include: { category: true, variants: true } } }
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