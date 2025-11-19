// pages/api/links/index.js
import { query } from '../../../lib/db';

const URL_REGEX = /^https?:\/\/.+/i;
const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;

export default async function handler(req, res) {
  // GET /api/links - list all links
  if (req.method === 'GET') {
    try {
      const result = await query(
        'SELECT code, target_url, clicks, created_at, last_clicked_at FROM links ORDER BY created_at DESC'
      );
      return res.status(200).json(result.rows);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'db_error' });
    }
  }

  // POST /api/links - create a link
  if (req.method === 'POST') {
    const { target_url, code } = req.body || {};

    if (!target_url || typeof target_url !== 'string') {
      return res.status(400).json({ error: 'invalid_target_url' });
    }

    if (!URL_REGEX.test(target_url.trim())) {
      return res.status(400).json({
        error: 'invalid_url_format',
        message: 'URL must start with http:// or https://',
      });
    }

    let insertCode = code?.trim() || null;

    if (insertCode && !CODE_REGEX.test(insertCode)) {
      return res.status(400).json({
        error: 'invalid_code_format',
        message: 'Codes must match [A-Za-z0-9]{6,8}',
      });
    }

    try {
      const result = await query(
        `INSERT INTO links (code, target_url)
         VALUES (
           COALESCE($2, substring(md5(random()::text) for 8)),
           $1
         )
         RETURNING code, target_url, clicks, created_at`,
        [target_url.trim(), insertCode]
      );

      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'db_error' });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  res.status(405).json({ error: 'method_not_allowed' });
}
