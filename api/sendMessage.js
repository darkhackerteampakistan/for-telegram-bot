import fetch from 'node-fetch';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return res.status(500).json({ ok: false, error: 'BOT_TOKEN not set' });

  try {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const raw = Buffer.concat(chunks);
    const ct = req.headers['content-type'] || '';

    let chatId = '', text = '', parseMode = '';

    if (ct.includes('multipart/form-data')) {
      const boundary = ct.split('boundary=')[1]?.trim();
      if (!boundary) return res.status(400).json({ ok: false, error: 'No boundary' });
      const parts = raw.toString('binary').split('--' + boundary);
      for (const part of parts) {
        if (part.trim() === '' || part.trim() === '--') continue;
        const hEnd = part.indexOf('\r\n\r\n');
        if (hEnd === -1) continue;
        const nm = part.substring(0, hEnd).match(/name="([^"]+)"/);
        if (!nm) continue;
        const val = part.substring(hEnd + 4).replace(/\r\n--$/, '').replace(/\r\n$/, '');
        if (nm[1] === 'chat_id') chatId = val;
        if (nm[1] === 'text') text = val;
        if (nm[1] === 'parse_mode') parseMode = val;
      }
    } else {
      try {
        const b = JSON.parse(raw.toString());
        chatId = b.chat_id; text = b.text; parseMode = b.parse_mode;
      } catch {
        const p = new URLSearchParams(raw.toString());
        chatId = p.get('chat_id'); text = p.get('text'); parseMode = p.get('parse_mode');
      }
    }

    if (!chatId) return res.status(400).json({ ok: false, error: 'chat_id required' });
    if (!text?.trim()) return res.status(400).json({ ok: false, error: 'text required' });

    const p = new URLSearchParams();
    p.append('chat_id', chatId);
    p.append('text', text.substring(0, 4000));
    if (parseMode) p.append('parse_mode', parseMode);

    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST', body: p, headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    const j = await r.json();
    return res.status(r.status).json(j);
  } catch (e) {
    console.error('sendMessage error:', e);
    return res.status(500).json({ ok: false, error: e.message });
  }
}
