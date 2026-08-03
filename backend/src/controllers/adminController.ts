import { Request, Response } from 'express';
import { prisma } from '../server';
import { sendBulkNewsletter } from '../services/emailService';
import { createClient } from '@supabase/supabase-js';

// Supabase client for deleting images
function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
}

const BUCKET = 'uploads';

// Helper to extract filename from Supabase public URL
function extractFilenameFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    // URL format: /storage/v1/object/public/uploads/filename.jpg
    const bucketIndex = pathParts.indexOf('uploads');
    if (bucketIndex !== -1 && bucketIndex + 1 < pathParts.length) {
      return pathParts[bucketIndex + 1] ?? null;
    }
    return null;
  } catch {
    return null;
  }
}

// Helper to delete image from Supabase
async function deleteImageFromSupabase(imageUrl: string | null | undefined) {
  if (!imageUrl) return;
  const filename = extractFilenameFromUrl(imageUrl);
  if (!filename) return;
  
  const supabase = getSupabase();
  const { error } = await supabase.storage.from(BUCKET).remove([filename]);
  if (error) {
    console.error('Error deleting image from Supabase:', error);
  }
}

// ── Stats ──
export const getStats = async (_req: Request, res: Response) => {
  try {
    const [totalOrders, totalProducts, totalUsers, revenueAgg, recentOrders] = await Promise.all([
      prisma.order.count(),
      prisma.product.count(),
      prisma.user.count(),
      prisma.order.aggregate({ 
        _sum: { total: true },
        where: { status: { not: 'CANCELLED' } }
      }),
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
      include: { category: true, variants: true, collections: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { 
      name, description, price, compareAtPrice, categoryId, images, active, variants, collectionIds 
    } = req.body as { 
      name: string; 
      description?: string | null; 
      price: number; 
      compareAtPrice?: number | null; 
      categoryId: string; 
      images?: string[]; 
      active?: boolean; 
      variants?: Array<{ size: string; color?: string | null; stock?: number }>;
      collectionIds?: string[];
    };

    const collectionsInput = collectionIds?.length 
      ? { connect: collectionIds.map((id) => ({ id })) }
      : undefined;

    const product = await prisma.product.create({
      data: {
        name,
        description: description ?? null,
        price,
        compareAtPrice: compareAtPrice ?? null,
        categoryId,
        images: images || [],
        active: active ?? true,
        variants: {
          create: (variants || []).map((v) => ({
            size: v.size,
            color: v.color || null,
            stock: v.stock || 0,
          })),
        },
        collections: collectionsInput as any,
      },
      include: { category: true, variants: true, collections: true },
    });

    res.status(201).json(product);
  } catch (error: any) {
    console.error('Admin createProduct error:', error);
    res.status(500).json({ error: error.message || 'Error al crear producto' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { name, description, price, compareAtPrice, categoryId, images, active, variants, collectionIds } = req.body as {
      name?: string;
      description?: string | null;
      price?: number;
      compareAtPrice?: number | null;
      categoryId?: string;
      images?: string[];
      active?: boolean;
      variants?: Array<{ id?: string; size: string; color?: string | null; stock?: number }>;
      collectionIds?: string[];
    };

    // Update product fields
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description: description ?? null }),
        ...(price !== undefined && { price }),
        ...(compareAtPrice !== undefined && { compareAtPrice: compareAtPrice ?? null }),
        ...(categoryId !== undefined && { categoryId }),
        ...(images !== undefined && { images }),
        ...(active !== undefined && { active }),
      },
      include: { category: true, variants: true, collections: true },
    });

    // If variants are provided, smart update (preserve variants with orders)
    if (variants) {
      // Get existing variants
      const existingVariants = await prisma.productVariant.findMany({
        where: { productId: id },
        select: { id: true }
      });
      const existingVariantIds = existingVariants.map(v => v.id);
      const incomingVariantIds = variants.filter(v => v.id).map(v => v.id!);

      // 1. Delete variants NOT in incoming list AND have no orders
      const variantIdsToDelete = existingVariantIds.filter(vid => !incomingVariantIds.includes(vid));

      if (variantIdsToDelete.length > 0) {
        const deletableVariants = await prisma.productVariant.findMany({
          where: {
            id: { in: variantIdsToDelete },
            orderItems: { none: {} }
          },
          select: { id: true }
        });

        if (deletableVariants.length > 0) {
          await prisma.productVariant.deleteMany({
            where: { id: { in: deletableVariants.map(v => v.id) } }
          });
        }
      }

      // 2. Update existing variants or create new ones
      for (const variant of variants) {
        if (variant.id && existingVariantIds.includes(variant.id)) {
          // Update existing variant
          await prisma.productVariant.update({
            where: { id: variant.id },
            data: {
              size: variant.size,
              color: variant.color || null,
              stock: variant.stock || 0,
            }
          });
        } else {
          // Create new variant
          await prisma.productVariant.create({
            data: {
              productId: id,
              size: variant.size,
              color: variant.color || null,
              stock: variant.stock || 0,
            }
          });
        }
      }
    }

    // Sync collections
    if (collectionIds !== undefined) {
      await prisma.product.update({
        where: { id },
        data: { collections: { set: collectionIds.map((cid) => ({ id: cid })) } },
      });
    }

    const updated = await prisma.product.findUnique({
      where: { id },
      include: { category: true, variants: true, collections: true },
    });

    res.json(updated);
  } catch (error: any) {
    console.error('Admin updateProduct error:', error);
    // Log more details for debugging
    console.error('Error code:', error.code);
    console.error('Error meta:', error.meta);
    res.status(500).json({ error: error.message || 'Error al actualizar producto' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.product.update({
      where: { id },
      data: { active: false },
    });
    res.json({ message: 'Producto desactivado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
};

export const hardDeleteProduct = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    
    // Get product first to access images
    const product = await prisma.product.findUnique({ 
      where: { id },
      select: { images: true }
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    // Delete variants first (foreign key constraint)
    await prisma.productVariant.deleteMany({ where: { productId: id } });
    
    // Delete product
    await prisma.product.delete({ where: { id } });
    
    // Delete images from Supabase Storage
    if (product.images && product.images.length > 0) {
      for (const imageUrl of product.images) {
        await deleteImageFromSupabase(imageUrl);
      }
    }
    
    res.json({ message: 'Producto eliminado permanentemente' });
  } catch (error: any) {
    console.error('Hard delete product error:', error);
    res.status(500).json({ error: error.message || 'Error al eliminar producto permanentemente' });
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
    const id = String(req.params.id);
    const { status } = req.body;

    const validStatuses = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: 'Estado inválido' });
      return;
    }

    // Get current order to check previous status and items
    const currentOrder = await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { variant: true } } },
    });

    if (!currentOrder) {
      res.status(404).json({ error: 'Pedido no encontrado' });
      return;
    }

    const wasCancelled = currentOrder.status === 'CANCELLED';
    const isNowCancelled = status === 'CANCELLED';

    const order = await prisma.$transaction(async (tx) => {
      // If cancelling an order that wasn't cancelled, restore stock
      if (isNowCancelled && !wasCancelled) {
        for (const item of currentOrder.items) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }
      }

      // Update order status
      return tx.order.update({
        where: { id },
        data: { status },
        include: {
          items: { include: { variant: { include: { product: true } } } },
          user: { select: { email: true } },
        },
      });
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
    const { name, slug, image } = req.body;
    const category = await prisma.category.create({
      data: { name, slug, image: image || null },
    });
    res.status(201).json(category);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error al crear categoría' });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    
    // Get category first to get image URL
    const category = await prisma.category.findUnique({ where: { id } });
    
    await prisma.category.delete({ where: { id } });
    
    // Delete image from Supabase after successful DB delete
    if (category?.image) {
      await deleteImageFromSupabase(category.image);
    }
    
    res.json({ message: 'Categoría eliminada' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error al eliminar categoría' });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { name, slug, image } = req.body;
    
    // Get current category to check for old image
    const currentCategory = await prisma.category.findUnique({ where: { id } });
    
    const category = await prisma.category.update({
      where: { id },
      data: { name, slug, image: image || null },
    });
    
    // Delete old image from Supabase if it was replaced
    if (currentCategory?.image && currentCategory.image !== image) {
      await deleteImageFromSupabase(currentCategory.image);
    }
    
    res.json(category);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error al actualizar categoría' });
  }
};

// ── Collections ──
export const getAllCollections = async (_req: Request, res: Response) => {
  try {
    const collections = await prisma.collection.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(collections);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener colecciones' });
  }
};

export const createCollection = async (req: Request, res: Response) => {
  try {
    const { name, slug, tag, description, image } = req.body;
    const collection = await prisma.collection.create({
      data: { name, slug, tag, description, image },
    });
    res.status(201).json(collection);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error al crear colección' });
  }
};

export const updateCollection = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { name, slug, tag, description, image } = req.body;
    
    // Get current collection to check for old image
    const currentCollection = await prisma.collection.findUnique({ where: { id } });
    
    const collection = await prisma.collection.update({
      where: { id },
      data: { name, slug, tag, description, image },
    });
    
    // Delete old image from Supabase if it was replaced
    if (currentCollection?.image && currentCollection.image !== image) {
      await deleteImageFromSupabase(currentCollection.image);
    }
    
    res.json(collection);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error al actualizar colección' });
  }
};

export const deleteCollection = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    
    // Get collection first to get image URL
    const collection = await prisma.collection.findUnique({ where: { id } });
    
    await prisma.collection.delete({ where: { id } });
    
    // Delete image from Supabase after successful DB delete
    if (collection?.image) {
      await deleteImageFromSupabase(collection.image);
    }
    
    res.json({ message: 'Colección eliminada' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error al eliminar colección' });
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
