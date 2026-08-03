import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../server';

const JWT_SECRET = process.env.JWT_SECRET ?? '';
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET no está definida. Configúrala en el archivo .env');
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string };

    const user = await prisma.user.findUnique({
      where: { id: payload.sub }
    });

    if (!user) {
      res.status(401).json({ error: 'Usuario no encontrado' });
      return;
    }

    (req as any).user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        const payload = jwt.verify(token, JWT_SECRET) as { sub: string };
        const user = await prisma.user.findUnique({
          where: { id: payload.sub }
        });
        if (user) {
          (req as any).user = user;
        }
      }
    }
  } catch (error) {
    // Si falla el token, lo ignoramos porque es opcional
  }
  next();
};
