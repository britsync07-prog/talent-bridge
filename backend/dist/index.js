"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const prisma_1 = __importDefault(require("./lib/prisma"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const engineer_routes_1 = __importDefault(require("./routes/engineer.routes"));
const employer_routes_1 = __importDefault(require("./routes/employer.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const job_routes_1 = __importDefault(require("./routes/job.routes"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const task_routes_1 = __importDefault(require("./routes/task.routes"));
const contract_routes_1 = __importDefault(require("./routes/contract.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
// Enable trust proxy for Render/Cloudflare
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;
const allowedOrigins = [
    ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map((s) => s.trim()) : []),
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://meet.truecrm.online',
    'https://talent-bridge0.netlify.app',
    'https://talentbridge.it.com',
    'http://talentbridge.it.com',
    'https://www.talentbridge.it.com',
    'http://www.talentbridge.it.com',
].filter(Boolean);
const corsOptions = {
    origin: (origin, cb) => {
        if (!origin)
            return cb(null, true);
        if (process.env.NODE_ENV !== 'production')
            return cb(null, true);
        return cb(null, allowedOrigins.includes(origin));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
    optionsSuccessStatus: 204,
    maxAge: 86400,
};
app.use((0, cors_1.default)(corsOptions));
app.use((0, morgan_1.default)('dev'));
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false,
}));
// Special case for Stripe webhooks - MUST come before express.json()
app.use('/api/payments/webhook', express_1.default.raw({ type: 'application/json' }));
app.use(express_1.default.json({ limit: '100mb' }));
app.use(express_1.default.urlencoded({ limit: '100mb', extended: true }));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);
// Health check (registered first to avoid interception)
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'API is alive' });
});
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/engineers', engineer_routes_1.default);
app.use('/api/employers', employer_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.use('/api/jobs', job_routes_1.default);
app.use('/api/payments', payment_routes_1.default);
app.use('/api/tasks', task_routes_1.default);
app.use('/api/contracts', contract_routes_1.default);
app.get('/', (req, res) => {
    res.send('Remote AI Workforce Platform API');
});
// Final Error Handler
app.use((err, req, res, next) => {
    console.error('--- Global Exception ---');
    console.error(err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Conflict',
        error: process.env.NODE_ENV === 'production' ? {} : err
    });
});
const startServer = async () => {
    try {
        console.log('--- Startup Phase ---');
        console.log(`Port: ${PORT}`);
        console.log('Verifying Database Connection...');
        await prisma_1.default.$connect();
        console.log('Database Connection: OK');
        server.listen(Number(PORT), '0.0.0.0', () => {
            console.log(`Server successfully bound to 0.0.0.0:${PORT}`);
        });
    }
    catch (error) {
        console.error('FAILED TO START SERVER:', error);
        process.exit(1);
    }
};
startServer();
