import { Request, Response } from 'express';
import { prisma } from '../server';
import bcrypt from 'bcrypt';
import { isValidEmail, isValidPhone, validatePassword, validateText } from '../utils/validators';

function validateAddressInput(body: any): string | null {
  const { line1, city, department, phone, recipientName } = body;
  if (!line1 || !city || !department || !phone) {
    return 'Todos los campos son requeridos';
  }
  const errLine1 = validateText('La dirección', line1, 5, 120, 'La dirección');
  if (errLine1) return errLine1;
  const errCity = validateText('La ciudad', city, 2, 60, 'La ciudad');
  if (errCity) return errCity;
  const errDept = validateText('El departamento', department, 2, 60, 'El departamento');
  if (errDept) return errDept;
  if (!isValidPhone(phone)) return 'El teléfono debe tener entre 7 y 15 dígitos';
  if (recipientName && recipientName.length > 60) return 'El nombre del destinatario no debe superar 60 caracteres';
  return null;
}

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        addresses: { where: { isDefault: true }, take: 1 },
      },
    });

    if (!dbUser) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    res.json(dbUser);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  console.log('updateProfile req.body:', req.body, typeof req.body);
  try {
    const user = (req as any).user;
    const { email, currentPassword, newPassword } = req.body;

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    // Verificar email único si se cambia
    if (email && email !== dbUser.email) {
      if (!isValidEmail(email)) {
        res.status(400).json({ error: 'El email no tiene un formato válido' });
        return;
      }
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        res.status(400).json({ error: 'El email ya está en uso' });
        return;
      }
    }

    // Si quiere cambiar password, verificar el actual
    let passwordHash = dbUser.passwordHash;
    if (newPassword) {
      if (!currentPassword) {
        res.status(400).json({ error: 'Contraseña actual requerida' });
        return;
      }
      const valid = await bcrypt.compare(currentPassword, dbUser.passwordHash || '');
      if (!valid) {
        res.status(400).json({ error: 'Contraseña actual incorrecta' });
        return;
      }
      const passwordErrors = validatePassword(newPassword);
      if (passwordErrors.length > 0) {
        res.status(400).json({ error: passwordErrors[0] });
        return;
      }
      passwordHash = await bcrypt.hash(newPassword, 10);
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(email && { email }),
        passwordHash,
      },
      select: { id: true, email: true, role: true, createdAt: true },
    });

    res.json(updated);
  } catch (error) {
    console.error('Update profile error:', error);
    console.error('Error details:', error instanceof Error ? error.message : error);
    console.error('Error code:', (error as any).code);
    console.error('Error meta:', (error as any).meta);
    res.status(500).json({ error: 'Error al actualizar perfil', details: error instanceof Error ? error.message : String(error) });
  }
};

export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            variant: {
              include: { product: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(orders);
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
};

export const getOrderDetail = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const id = String(req.params.id);

    const order = await prisma.order.findFirst({
      where: { id, userId: user.id },
      include: {
        items: {
          include: {
            variant: {
              include: { product: true }
            }
          }
        },
        address: true
      }
    });

    if (!order) {
      res.status(404).json({ error: 'Pedido no encontrado' });
      return;
    }

    res.json(order);
  } catch (error) {
    console.error('Get order detail error:', error);
    res.status(500).json({ error: 'Error al obtener detalle del pedido' });
  }
};

export const getAddresses = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: { isDefault: 'desc' }
    });

    res.json(addresses);
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({ error: 'Error al obtener direcciones' });
  }
};

export const createAddress = async (req: Request, res: Response) => {
  console.log('createAddress - req:', req.method, req.path);
  console.log('createAddress - req.body:', req.body);
  console.log('createAddress - req.body type:', typeof req.body);
  console.log('createAddress - has body:', !!req.body);
  try {
    const user = (req as any).user;
    const { line1, city, department, phone, recipientName, isDefault } = req.body;

    const inputError = validateAddressInput(req.body);
    if (inputError) {
      res.status(400).json({ error: inputError });
      return;
    }

    const count = await prisma.address.count({ where: { userId: user.id } });
    const willBeDefault = isDefault || count === 0;

    if (willBeDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false }
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: user.id,
        line1,
        city,
        department,
        phone,
        recipientName: recipientName || null,
        isDefault: willBeDefault
      }
    });

    res.status(201).json(address);
  } catch (error) {
    console.error('Create address error:', error);
    console.error('Error details:', error instanceof Error ? error.message : error);
    console.error('Error code:', (error as any).code);
    console.error('Error meta:', (error as any).meta);
    res.status(500).json({ error: 'Error al crear dirección', details: error instanceof Error ? error.message : String(error) });
  }
};

export const updateAddress = async (req: Request, res: Response) => {
  console.log('updateAddress req.body:', req.body, typeof req.body);
  try {
    const user = (req as any).user;
    const id = String(req.params.id);
    const { line1, city, department, phone, recipientName, isDefault } = req.body;

    const address = await prisma.address.findFirst({
      where: { id, userId: user.id }
    });

    if (!address) {
      res.status(404).json({ error: 'Dirección no encontrada' });
      return;
    }

    const inputError = validateAddressInput({
      line1: line1 || address.line1,
      city: city || address.city,
      department: department || address.department,
      phone: phone || address.phone,
      recipientName: recipientName !== undefined ? recipientName : address.recipientName,
    });
    if (inputError) {
      res.status(400).json({ error: inputError });
      return;
    }

    if (isDefault && !address.isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false }
      });
    }

    const updated = await prisma.address.update({
      where: { id },
      data: {
        line1: line1 || address.line1,
        city: city || address.city,
        department: department || address.department,
        phone: phone || address.phone,
        recipientName: recipientName !== undefined ? recipientName : address.recipientName,
        isDefault: isDefault !== undefined ? isDefault : address.isDefault
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Update address error:', error);
    console.error('Error details:', error instanceof Error ? error.message : error);
    console.error('Error code:', (error as any).code);
    console.error('Error meta:', (error as any).meta);
    res.status(500).json({ error: 'Error al actualizar dirección', details: error instanceof Error ? error.message : String(error) });
  }
};

export const deleteAddress = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const id = String(req.params.id);

    const address = await prisma.address.findFirst({
      where: { id, userId: user.id }
    });

    if (!address) {
      res.status(404).json({ error: 'Dirección no encontrada' });
      return;
    }

    await prisma.address.delete({ where: { id } });

    // Si era la default, poner otra como default
    if (address.isDefault) {
      const other = await prisma.address.findFirst({
        where: { userId: user.id }
      });
      if (other) {
        await prisma.address.update({
          where: { id: other.id },
          data: { isDefault: true }
        });
      }
    }

    res.json({ message: 'Dirección eliminada' });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ error: 'Error al eliminar dirección' });
  }
};

export const setDefaultAddress = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const id = String(req.params.id);

    const address = await prisma.address.findFirst({
      where: { id, userId: user.id }
    });

    if (!address) {
      res.status(404).json({ error: 'Dirección no encontrada' });
      return;
    }

    await prisma.address.updateMany({
      where: { userId: user.id, isDefault: true },
      data: { isDefault: false }
    });

    const updated = await prisma.address.update({
      where: { id },
      data: { isDefault: true }
    });

    res.json(updated);
  } catch (error) {
    console.error('Set default address error:', error);
    res.status(500).json({ error: 'Error al establecer dirección por defecto' });
  }
};