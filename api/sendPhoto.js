import fetch from 'node-fetch';
import FormData from 'form-data';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return res.status(500).json({ ok: false, error: 'BOT_TOKEN not set' });

  const ct = req.headers['content-type'] || '';
  if (!ct.includes('multipart/form-data')) return res.status(400).json({ ok: false, error: 'Need multipart' });

  try {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const raw = Buffer.concat(chunks);
    const boundary = ct.split('boundary=')[1]?.trim();
    if (!boundary) return res.status(400).json({ ok: false, error: 'No boundary' });

    const parts = raw.toString('binary').split('--' + boundary);
    let chatId = '', caption = '', fileData = null, fileName = 'photo.jpg', fileType = 'image/jpeg';

    for (const part of parts) {
      if (part.trim() === '' || part.trim() === '--') continue;
      const hEnd = part.indexOf('\r\n\r\n');
      if (hEnd === -1) continue;
      const hs = part.substring(0, hEnd);
      const nm = hs.match(/name="([^"]+)"/);
      if (!nm) continue;
      const field = nm[1];
      const fnMatch = hs.match(/filename="([^"]+)"/);

      if (fnMatch) {
        const ctMatch = hs.match(/Content-Type:\s*([^\r\n]+)/i);
        fileType = ctMatch ? ctMatch[1].trim() : 'image/jpeg';
        fileName = fnMatch[1];
        const bStart = hEnd + 4;
        const bEnd = part.lastIndexOf('\r\n--');
        const bPart = part.substring(bStart, bEnd !== -1 ? bEnd : part.length);
        fileData = Buffer.from(bPart, 'binary');
      } else {
        const val = part.substring(hEnd + 4).replace(/\r\n--$/, '').replace(/\r\n$/, '');
        if (field === 'chat_id') chatId = val;
        if (field === 'caption') caption = val;
      }
    }

    if (!chatId) return res.status(400).json({ ok: false, error: 'chat_id required' });
    if (!fileData) return res.status(400).json({ ok: false, error: 'photo required' });

    const fd = new FormData();
    fd.append('chat_id', chatId);
    fd.append('photo', fileData, { filename: fileName, contentType: fileType });
    if (caption) { fd.append('caption', caption.substring(0, 1024)); fd.append('parse_mode', 'HTML'); }

    const r = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
      method: 'POST', body: fd, headers: fd.getHeaders(),
    });
    const j = await r.json();
    if (!j.ok) console.error('Telegram error:', j);
    return res.status(r.status).json(j);
  } catch (e) {
    console.error('sendPhoto error:', e);
    return res.status(500).json({ ok: false, error: e.message });
  }
}
