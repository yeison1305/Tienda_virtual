import { Router, Request, Response } from 'express';
import { prisma } from '../server';
import { sendNewsletterWelcome } from '../services/emailService';

const router = Router();

router.post('/subscribe', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const existing = await prisma.newsletterSubscription.findUnique({
      where: { email }
    });

    if (existing) {
      res.status(400).json({ error: 'Already subscribed' });
      return;
    }

    await prisma.newsletterSubscription.create({
      data: { email }
    });

    await sendNewsletterWelcome(email);

    res.status(200).json({ message: 'Subscribed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

export default router;
