"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyInvoices = exports.handleWebhook = exports.createCheckoutSession = exports.generateInvoice = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const stripe_1 = __importDefault(require("stripe"));
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
    apiVersion: '2023-10-16',
});
// POST /api/payments/generate-invoice
const generateInvoice = async (req, res) => {
    try {
        const { contractId } = req.body;
        const contract = await prisma_1.default.contract.findUnique({
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
        const invoice = await prisma_1.default.invoice.create({
            data: {
                contractId,
                amount: baseAmount + feeAmount,
                status: 'UNPAID',
                dueDate
            }
        });
        // Activity Log
        await prisma_1.default.activity_log.create({
            data: {
                userId: req.user.id,
                action: 'invoice generated',
                details: `Invoice ${invoice.id} generated for contract ${contractId}`
            }
        });
        res.status(201).json(invoice);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.generateInvoice = generateInvoice;
// POST /api/payments/create-checkout-session/:invoiceId
const createCheckoutSession = async (req, res) => {
    try {
        const invoiceId = req.params.invoiceId;
        const invoice = await prisma_1.default.invoice.findUnique({
            where: { id: invoiceId },
            include: { contract: { include: { employer: true } } }
        });
        if (!invoice || invoice.contract.employer.userId !== req.user.id) {
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
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createCheckoutSession = createCheckoutSession;
// POST /api/payments/webhook
const handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || '');
    }
    catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const invoiceId = session.metadata?.invoiceId;
        if (invoiceId) {
            const invoice = await prisma_1.default.invoice.update({
                where: { id: invoiceId },
                data: { status: 'PAID' },
                include: { contract: true }
            });
            await prisma_1.default.payment.create({
                data: {
                    invoiceId: invoice.id,
                    amount: invoice.amount,
                    status: 'COMPLETED',
                    stripeId: session.id
                }
            });
            // Activity Log
            await prisma_1.default.activity_log.create({
                data: {
                    userId: (await prisma_1.default.user.findFirst({ where: { employerProfile: { id: invoice.contract.employerId } } }))?.id || '',
                    action: 'payment completed',
                    details: `Payment for invoice ${invoice.id} completed`
                }
            });
        }
    }
    res.json({ received: true });
};
exports.handleWebhook = handleWebhook;
// GET /api/payments/invoices
const getMyInvoices = async (req, res) => {
    try {
        let invoices;
        if (req.user.role === 'EMPLOYER') {
            const employer = await prisma_1.default.employerProfile.findUnique({ where: { userId: req.user.id } });
            invoices = await prisma_1.default.invoice.findMany({
                where: { contract: { employerId: employer?.id } },
                include: { contract: { include: { engineer: true } } },
                orderBy: { createdAt: 'desc' }
            });
        }
        else {
            const engineer = await prisma_1.default.engineerProfile.findUnique({ where: { userId: req.user.id } });
            invoices = await prisma_1.default.invoice.findMany({
                where: { contract: { engineerId: engineer?.id } },
                include: { contract: { include: { employer: true } } },
                orderBy: { createdAt: 'desc' }
            });
        }
        res.json(invoices);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getMyInvoices = getMyInvoices;
