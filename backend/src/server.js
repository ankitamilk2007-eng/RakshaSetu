import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './routes/api.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static uploads directory (for previewing safe assets if requested)
app.use('/uploads', express.static(path.resolve('uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    system: 'RakshaSetu Production API Node',
    timestamp: new Date().toISOString(),
    version: '1.0.0-hackathon'
  });
});

// Mount main API
app.use('/api', apiRouter);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  if (err.name === 'MulterError') {
    return res.status(400).json({ error: `File upload error: ${err.message}` });
  }
  return res.status(500).json({ error: err.message || 'Internal server error occurred.' });
});

app.listen(PORT, () => {
  console.log(`[RakshaSetu] Backend API running on http://localhost:${PORT}`);
});
