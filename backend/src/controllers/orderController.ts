import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../server';
import { sendOrderConfirmation } from '../services/emailService';

const orderInclude = {
  items: { include: { variant: { include: { product: true } } } },
} satisfies Prisma.OrderInclude;

export const createOrder = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { items, guestEmail, shipping, shippingAddressId, requestKey } = req.body;

    // Idempotency: a requestKey uniquely identifies a checkout submission.
    // If it was already processed, replay the existing order instead of creating a duplicate.
    if (!requestKey || typeof requestKey !== 'string') {
      return res.status(400).json({ error: 'Falta la clave del pedido' });
    }

    const existing = await prisma.order.findUnique({
      where: { requestKey },
      include: orderInclude,
    });
    if (existing) {
      return res.json(existing);
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'El pedido no tiene artículos' });
    }
    if (items.some((item: any) => !item.quantity || !Number.isInteger(item.quantity) || item.quantity < 1)) {
      return res.status(400).json({ error: 'Cantidad inválida en el pedido' });
    }
    if (!user && (!guestEmail || typeof guestEmail !== 'string')) {
      return res.status(400).json({ error: 'El email es obligatorio para pedidos de invitado' });
    }

    // Resolve variant IDs and take prices from the database (never from the client)
    let resolvedItems: { variantId: string; quantity: number; unitPrice: number }[];
    try {
      resolvedItems = await Promise.all(
        items.map(async (item: any) => {
          let variantId = item.variantId;

          if (variantId) {
            let variant = await prisma.productVariant.findUnique({
              where: { id: variantId },
              include: { product: true },
            });

            if (!variant) {
              const product = await prisma.product.findUnique({
                where: { id: variantId },
                include: { variants: true },
              });
              const firstVariant = product?.variants[0];
              if (firstVariant) {
                variant = await prisma.productVariant.findUnique({
                  where: { id: firstVariant.id },
                  include: { product: true },
                });
              }
            }

            if (variant) {
              return {
                variantId: variant.id,
                quantity: item.quantity,
                unitPrice: variant.product.price,
              };
            }
          }

          throw new Error(`Variante no encontrada para el artículo ${item.variantId}`);
        })
      );
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }

    const serverTotal = resolvedItems.reduce(
      (sum: number, item: any) => sum + item.unitPrice * item.quantity,
      0
    );

    let finalAddressId = shippingAddressId || null;

    // If user provided a shippingAddressId, validate it belongs to them
    if (finalAddressId && user) {
      const address = await prisma.address.findFirst({
        where: { id: finalAddressId, userId: user.id },
      });
      if (!address) {
        finalAddressId = null; // Invalid address ID, ignore it
      }
    }

    let order;
    try {
      order = await prisma.$transaction(async (tx) => {
        // Validate stock
        for (const item of resolvedItems) {
          if (!item.variantId) continue;
          const variant = await tx.productVariant.findUnique({ 
            where: { id: item.variantId },
            select: { stock: true }
          });
          if (!variant || variant.stock < item.quantity) {
            throw new Error(`Stock insuficiente para variante ${item.variantId}`);
          }
        }

        // If no addressId but user is logged in and has shipping data, create new address
        if (!finalAddressId && user && shipping) {
          const newAddress = await tx.address.create({
            data: {
              userId: user.id,
              line1: shipping.address,
              city: shipping.city,
              department: shipping.department,
              phone: shipping.phone,
              recipientName: shipping.name,
              isDefault: false,
            }
          });
          finalAddressId = newAddress.id;
        }

        // Create order
        const newOrder = await tx.order.create({
          data: {
            userId: user?.id || undefined,
            guestEmail: user ? undefined : guestEmail,
            shippingName: shipping?.name,
            shippingPhone: shipping?.phone,
            shippingAddress: shipping?.address,
            shippingCity: shipping?.city,
            shippingDepartment: shipping?.department,
            addressId: finalAddressId || undefined,
            total: serverTotal,
            requestKey,
            items: {
              create: resolvedItems.map((item) => ({
                variantId: item.variantId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
              }))
            }
          },
          include: orderInclude
        });

        // Decrement stock atomically
        await Promise.all(resolvedItems.map(item => {
          if (!item.variantId) return Promise.resolve();
          return tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } }
          });
        }));

        return newOrder;
      });
    } catch (err: any) {
      // Race: an identical request was processed first and hit the unique requestKey constraint.
      // Its transaction rolled back, so return the order created by the winning request.
      if (err?.code === 'P2002') {
        const winner = await prisma.order.findUnique({
          where: { requestKey },
          include: orderInclude,
        });
        if (winner) return res.json(winner);
      }
      if (err?.message && !err?.code) {
        return res.status(400).json({ error: err.message }); // e.g. stock validation
      }
      throw err;
    }

    // Send confirmation email
    const email = user?.email || guestEmail;
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
