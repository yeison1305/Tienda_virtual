import { Request, Response } from 'express';
import { prisma } from '../server';
import { sendOrderConfirmation } from '../services/emailService';
import fs from 'fs';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { items, total, guestEmail, shipping } = req.body;

    // Resolve variant IDs
    const resolvedItems = await Promise.all(
      items.map(async (item: any) => {
        let variantId = item.variantId;

        if (variantId) {
          const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
          if (!variant) {
            const product = await prisma.product.findUnique({
              where: { id: variantId },
              include: { variants: true },
            });
            if (product && product.variants.length > 0) {
              variantId = product.variants[0].id;
            }
          }
        }

        return {
          variantId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        };
      })
    );

    const order = await prisma.order.create({
      data: {
        userId: user?.id || undefined,
        guestEmail: user ? undefined : guestEmail,
        shippingName: shipping?.name,
        shippingPhone: shipping?.phone,
        shippingAddress: shipping?.address,
        shippingCity: shipping?.city,
        shippingDepartment: shipping?.department,
        total,
        items: {
          create: resolvedItems.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          }))
        }
      },
      include: {
        items: {
          include: { variant: { include: { product: true } } }
        }
      }
    });

    // Send confirmation email
    const email = user?.email || guestEmail;
    fs.appendFileSync('email-debug.txt', new Date().toISOString() + ' - orderController: email = ' + email + ', shipping = ' + (shipping ? 'yes' : 'no') + '\n');
    if (email && shipping) {
      const emailItems = order.items.map((oi) => ({
        name: oi.variant.product.name,
        quantity: oi.quantity,
        price: oi.unitPrice,
      }));

      sendOrderConfirmation({
        orderId: order.id,
        customerName: shipping.name || 'Cliente',
        customerEmail: email,
        items: emailItems,
        total: order.total,
        shipping: {
          address: shipping.address || '',
          city: shipping.city || '',
          department: shipping.department || '',
          phone: shipping.phone || '',
        },
      });
    }

    res.json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: { items: { include: { variant: { include: { product: true } } } } },
      orderBy: { createdAt: 'desc' }
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};
