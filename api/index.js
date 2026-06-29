import express from 'express';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from '../dist/index.js';
import { createContext } from '../dist/index.js';

const app = express();

// Configure body parser with larger size limit for file uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// tRPC API
app.use(
  '/api/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Fallback for any other requests
app.all('*', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

export default app;
