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
const path_1 = __importDefault(require("path"));
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
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://leadhunter-crm.work.gd',
    'https://talent-bridge0.netlify.app'
].filter(Boolean);
// 1. Manual CORS Middleware (Top Priority)
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    else if (process.env.NODE_ENV !== 'production') {
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }
    next();
});
// 2. Security Middleware (with relaxed CSP)
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false, // Disable for now to rule out interference
}));
app.use(express_1.default.json({ limit: '100mb' }));
app.use(express_1.default.urlencoded({ limit: '100mb', extended: true }));
// Serve Static Files
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Increased limit for development/active use
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);
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
    console.log('Health check request received from Render');
    res.send('Remote AI Workforce Platform API');
});
const startServer = () => {
    server.listen(Number(PORT), '0.0.0.0', () => {
        console.log(`Server is running on port ${PORT} (0.0.0.0)`);
    });
};
startServer();
