import type { VercelRequest, VercelResponse } from '@vercel/node';
import { webhookCallback } from 'grammy';
import { bot } from '../src/bot/bot.js';

const SECRET = process.env['WEBHOOK_SECRET'] ?? '';

const handleUpdate = webhookCallback(bot, 'std/http');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  // Verify Telegram webhook secret token
  if (SECRET && req.headers['x-telegram-bot-api-secret-token'] !== SECRET) {
    res.status(401).send('Unauthorized');
    return;
  }

  try {
    const request = new Request('https://dummy.url', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    await handleUpdate(request);
    res.status(200).send('ok');
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(200).send('ok'); // always 200 to Telegram to avoid retries
  }
}
