import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

import { auth } from './auth'; // path to your auth file

const app = new Hono();

app.use(logger());

app.use(
  '/api/auth/*', // or replace with "*" to enable cors for all routes
  cors({
    origin: 'http://localhost:4200', // replace with your origin
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true
  })
);

// Handle preflight OPTIONS requests for CORS
app.options('/api/auth/*', (c) => {
  // eslint-disable-next-line unicorn/no-null
  return c.body(null, 204);
});

app.on(['POST', 'GET'], '/api/auth/*', async (c) => {
  const handle = await auth.handler(c.req.raw);

  console.log(handle);

  return handle;
});

serve(app);
