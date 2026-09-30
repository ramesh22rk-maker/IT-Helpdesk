import app, { initDbPromise } from '../server.js';

export default async function handler(req, res) {
  if (initDbPromise) {
    try {
      await initDbPromise;
    } catch (err) {
      console.error('[Vercel Serverless] DB init error:', err);
    }
  }
  return app(req, res);
}
