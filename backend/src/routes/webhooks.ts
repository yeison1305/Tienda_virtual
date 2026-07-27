import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../server';

const router = Router();

router.post('/wompi', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-event-checksum'] as string;
    
    if (!signature) {
      res.status(400).json({ error: 'Missing signature' });
      return;
    }

    const { data, timestamp } = req.body;
    const secret = process.env.WOMPI_EVENTS_SECRET || '';
    
    // Wompi checksum is SHA256(id + status + amount_in_cents + timestamp + secret)
    const { transaction } = data;
    const { id, status, amount_in_cents, reference } = transaction;
    const checkString = `${id}${status}${amount_in_cents}${timestamp}${secret}`;
    const generatedSignature = crypto.createHash('sha256').update(checkString).digest('hex');

    if (signature !== generatedSignature) {
      res.status(400).json({ error: 'Invalid signature' });
      return;
    }

    const newPaymentStatus = status === 'APPROVED' ? 'PAID' : (status === 'DECLINED' || status === 'ERROR' ? 'FAILED' : 'PENDING');
    const newOrderStatus = status === 'APPROVED' ? 'PAID' : 'PENDING';

    await prisma.order.update({
      where: { id: reference },
      data: { 
        paymentStatus: newPaymentStatus,
        status: newOrderStatus,
        wompiTransactionId: id
      }
    });

    res.status(200).send('OK');
  } catch (error) {
    res.status(500).send('Error processing webhook');
  }
});

export default router;
