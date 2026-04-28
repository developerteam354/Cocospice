import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(cookieParser());

// Health check
app.get('/', (_req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

export default app;
