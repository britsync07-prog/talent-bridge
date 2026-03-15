import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2023-10-16' as any,
});

// POST /api/payments/generate-invoice
export const generateInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const { contractId } = req.body;

    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: { employer: true }
    });

    if (!contract || contract.employer.userId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); // Due in 7 days

    const months = contract.type === 'FULLTIME' ? 6 : 1;
    const baseAmount = contract.salary * months;
    const feeAmount = baseAmount * (contract.platformFee / 100);

    const invoice = await prisma.invoice.create({
      data: {
        contractId,
        amount: baseAmount + feeAmount,
        status: 'UNPAID',
        dueDate
      }
    });

    // Activity Log
    await prisma.activity_log.create({
      data: {
        userId: req.user.id,
        action: 'invoice generated',
        details: `Invoice ${invoice.id} generated for contract ${contractId}`
      }
    });

    res.status(201).json(invoice);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/payments/create-checkout-session/:invoiceId
export const createCheckoutSession = async (req: AuthRequest, res: Response) => {
  try {
    const invoiceId = req.params.invoiceId as string;

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { contract: { include: { employer: true } } }
    });

    if (!invoice || (invoice.contract as any).employer.userId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Monthly payment for contract ${invoice.contractId}`,
            },
            unit_amount: Math.round(invoice.amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/dashboard/employer/billing?success=true`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard/employer/billing?canceled=true`,
      metadata: { invoiceId: invoice.id }
    });

    res.json({ url: session.url });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/payments/webhook
export const handleWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig as string,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const invoiceId = session.metadata?.invoiceId;

    if (invoiceId) {
      const invoice = await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: 'PAID' },
        include: { contract: true }
      });

      await prisma.payment.create({
        data: {
          invoiceId: invoice.id,
          amount: invoice.amount,
          status: 'COMPLETED',
          stripeId: session.id
        }
      });

      // Activity Log
      await prisma.activity_log.create({
        data: {
          userId: (await prisma.user.findFirst({ where: { employerProfile: { id: (invoice.contract as any).employerId } } }))?.id || '',
          action: 'payment completed',
          details: `Payment for invoice ${invoice.id} completed`
        }
      });
    }
  }

  res.json({ received: true });
};

// GET /api/payments/invoices
export const getMyInvoices = async (req: AuthRequest, res: Response) => {
  try {
    let invoices;

    if (req.user.role === 'EMPLOYER') {
      const employer = await prisma.employerProfile.findUnique({ where: { userId: req.user.id } });
      invoices = await prisma.invoice.findMany({
        where: { contract: { employerId: employer?.id } },
        include: { contract: { include: { engineer: true } } },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      const engineer = await prisma.engineerProfile.findUnique({ where: { userId: req.user.id } });
      invoices = await prisma.invoice.findMany({
        where: { contract: { engineerId: engineer?.id } },
        include: { contract: { include: { employer: true } } },
        orderBy: { createdAt: 'desc' }
      });
    }

    res.json(invoices);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
