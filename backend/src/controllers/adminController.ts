import { Request, Response } from 'express';
import { prisma } from '../server';
import { sendBulkNewsletter } from '../services/emailService';

// ── Stats ──
export const getStats = async (_req: Request, res: Response) => {
  try {
    const [totalOrders, totalProducts, totalUsers, revenueAgg, recentOrders] = await Promise.all([
      prisma.order.count(),
      prisma.product.count(),
      prisma.user.count(),
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          items: { include: { variant: { include: { product: true } } } },
          user: { select: { email: true } },
        },
      }),
    ]);

    res.json({
      totalOrders,
      totalProducts,
      totalUsers,
      totalRevenue: revenueAgg._sum.total || 0,
      recentOrders,
    });
  } catch (error) {
    console.error('Admin getStats error:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

// ── Products ──
export const getAllProducts = async (_req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true, variants: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, compareAtPrice, categoryId, images, active, variants } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        compareAtPrice,
        categoryId,
        images: images || [],
        active: active ?? true,
        variants: {
          create: (variants || []).map((v: any) => ({
            size: v.size,
            color: v.color || null,
            stock: v.stock || 0,
            sku: v.sku,
          })),
        },
      },
      include: { category: true, variants: true },
    });

    res.status(201).json(product);
  } catch (error: any) {
    console.error('Admin createProduct error:', error);
    res.status(500).json({ error: error.message || 'Error al crear producto' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, compareAtPrice, categoryId, images, active, variants } = req.body;

    // Update product fields
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price }),
        ...(compareAtPrice !== undefined && { compareAtPrice }),
        ...(categoryId !== undefined && { categoryId }),
        ...(images !== undefined && { images }),
        ...(active !== undefined && { active }),
      },
      include: { category: true, variants: true },
    });

    // If variants are provided, replace them
    if (variants) {
      await prisma.productVariant.deleteMany({ where: { productId: id } });
      await prisma.productVariant.createMany({
        data: variants.map((v: any) => ({
          productId: id,
          size: v.size,
          color: v.color || null,
          stock: v.stock || 0,
          sku: v.sku,
        })),
      });
    }

    const updated = await prisma.product.findUnique({
      where: { id },
      include: { category: true, variants: true },
    });

    res.json(updated);
  } catch (error: any) {
    console.error('Admin updateProduct error:', error);
    res.status(500).json({ error: error.message || 'Error al actualizar producto' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.product.update({
      where: { id },
      data: { active: false },
    });
    res.json({ message: 'Producto desactivado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
};

// ── Orders ──
export const getAllOrders = async (_req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: { include: { variant: { include: { product: true } } } },
        user: { select: { email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: 'Estado inválido' });
      return;
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: { include: { variant: { include: { product: true } } } },
        user: { select: { email: true } },
      },
    });

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar estado del pedido' });
  }
};

// ── Categories ──
export const getAllCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, slug } = req.body;
    const category = await prisma.category.create({
      data: { name, slug },
    });
    res.status(201).json(category);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error al crear categoría' });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id } });
    res.json({ message: 'Categoría eliminada' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error al eliminar categoría' });
  }
};

// ── Newsletter ──
export const getNewsletterSubscribers = async (_req: Request, res: Response) => {
  try {
    const subscribers = await prisma.newsletterSubscription.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(subscribers);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener suscriptores' });
  }
};

export const sendNewsletter = async (req: Request, res: Response) => {
  try {
    console.log('sendNewsletter body:', req.body);
    const { subject, title, message, ctaText, ctaLink, imageUrl } = req.body;

    if (!subject || !title || !message) {
      console.log('Validation failed:', { subject, title, message });
      res.status(400).json({ error: 'Asunto, título y mensaje son requeridos' });
      return;
    }

    const subscribers = await prisma.newsletterSubscription.findMany({
      select: { email: true },
    });

    const emails = subscribers.map(s => s.email);

    if (emails.length === 0) {
      res.status(400).json({ error: 'No hay suscriptores para enviar' });
      return;
    }

    const result = await sendBulkNewsletter(emails, { subject, title, message, ctaText, ctaLink, imageUrl });

    res.json({ message: 'Newsletter enviado', ...result });
  } catch (error: any) {
    console.error('Admin sendNewsletter error:', error);
    res.status(500).json({ error: error.message || 'Error al enviar newsletter' });
  }
};
