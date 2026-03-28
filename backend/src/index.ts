import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import cors, { CorsOptions } from 'cors';
import morgan from 'morgan';
import prisma from './lib/prisma';

import authRoutes from './routes/auth.routes';
import engineerRoutes from './routes/engineer.routes';
import employerRoutes from './routes/employer.routes';
import adminRoutes from './routes/admin.routes';
import jobRoutes from './routes/job.routes';
import paymentRoutes from './routes/payment.routes';
import taskRoutes from './routes/task.routes';
import contractRoutes from './routes/contract.routes';

dotenv.config();

const app = express();
const server = http.createServer(app);

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
].filter(Boolean) as string[];

const corsOptions: CorsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (process.env.NODE_ENV !== 'production') return cb(null, true);
    return cb(null, allowedOrigins.includes(origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  optionsSuccessStatus: 204,
  maxAge: 86400,
};

app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false,
}));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/engineers', engineerRoutes);
app.use('/api/employers', employerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/contracts', contractRoutes);

app.get('/', (req, res) => {
  res.send('Remote AI Workforce Platform API');
});

const startServer = async () => {
  try {
    console.log('--- Startup Phase ---');
    console.log(`Port: ${PORT}`);
    
    console.log('Verifying Database Connection...');
    await prisma.$connect();
    console.log('Database Connection: OK');

    server.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`Server successfully bound to 0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('FAILED TO START SERVER:', error);
    process.exit(1);
  }
};

startServer();
