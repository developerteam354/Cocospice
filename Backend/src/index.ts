import 'dotenv/config';
import express, { type Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middlewares/error.middleware.js';
// import { seedAdminUser } from './utils/seedAdmin.js'; // ✅ Seeding completed - commented out

// ─── Validate required env vars at startup ────────────────────────────────────
const REQUIRED_ENV = [
  'MONGO_URI', 'ACCESS_TOKEN_SECRET', 'REFRESH_TOKEN_SECRET',
  'AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_S3_BUCKET',
];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`❌ Missing required env variables: ${missing.join(', ')}`);
  process.exit(1);
}
console.log(`✅ AWS config — region=${process.env.AWS_REGION} bucket=${process.env.AWS_S3_BUCKET}`);


const app: Application = express();
const PORT = process.env.PORT ?? 5000;

// ─── CORS ─────────────────────────────────────────────────────────────────────

const allowedOrigins = [
  process.env.USER_FRONTEND_URL,
  process.env.ADMIN_FRONTEND_URL,
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ─── Middlewares ──────────────────────────────────────────────────────────────

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Routes ───────────────────────────────────────────────────────────────────

app.get('/', (_req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

app.use('/api', apiRoutes);

// ─── Error Handler ────────────────────────────────────────────────────────────

app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────

const startServer = async (): Promise<void> => {
  await connectDB();
  
  // ✅ Admin seeding completed - function call removed to avoid unnecessary DB checks
  // await seedAdminUser();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer();
