// // pages/[code].js
// import { query } from '../../lib/db';
// ;

// export async function getServerSideProps({ params, res }) {
//   const { code } = params;
//   const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;

//   if (!CODE_REGEX.test(code)) {
//     res.statusCode = 404;
//     return { props: {} };
//   }

//   try {
//     const result = await query(
//       'SELECT target_url FROM links WHERE code=$1',
//       [code]
//     );

//     if (result.rowCount === 0) {
//       res.statusCode = 404;
//       return { props: {} };
//     }

//     const target = result.rows[0].target_url;

//     await query(
//       'UPDATE links SET clicks = clicks + 1, last_clicked_at = now() WHERE code=$1',
//       [code]
//     );

//     res.setHeader('Location', target);
//     res.statusCode = 302;
//     res.end();

//     return { props: {} };
//   } catch (error) {
//     console.error(error);
//     res.statusCode = 500;
//     return { props: {} };
//   }
// }

// export default function RedirectPage() {
//   return <div style={{ padding: 20 }}>Redirecting…</div>;
// }

// pages/api/links/[code].js
import { query } from '../../../lib/db';

const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;

export default async function handler(req, res) {
  const { code } = req.query;

  if (!CODE_REGEX.test(code)) {
    return res.status(400).json({ error: 'invalid_code_format' });
  }

  if (req.method === 'GET') {
    try {
      const result = await query(
        'SELECT code, target_url, clicks, last_clicked_at, created_at FROM links WHERE code=$1',
        [code]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'not_found' });
      }

      return res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'db_error' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const del = await query(
        'DELETE FROM links WHERE code=$1 RETURNING code',
        [code]
      );

      if (del.rowCount === 0) {
        return res.status(404).json({ error: 'not_found' });
      }

      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'db_error' });
    }
  }

  res.setHeader('Allow', 'GET, DELETE');
  res.status(405).json({ error: 'method_not_allowed' });
}
