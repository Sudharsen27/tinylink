// pages/[code].js
import { query } from '../lib/db';

export async function getServerSideProps({ params, res }) {
  const { code } = params;
  const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;

  if (!CODE_REGEX.test(code)) {
    res.statusCode = 404;
    return { props: {} };
  }

  try {
    const result = await query(
      'SELECT target_url FROM links WHERE code=$1',
      [code]
    );

    if (result.rowCount === 0) {
      res.statusCode = 404;
      return { props: {} };
    }

    const target = result.rows[0].target_url;

    await query(
      'UPDATE links SET clicks = clicks + 1, last_clicked_at = now() WHERE code=$1',
      [code]
    );

    res.setHeader('Location', target);
    res.statusCode = 302;
    res.end();

    return { props: {} };
  } catch (error) {
    console.error(error);
    res.statusCode = 500;
    return { props: {} };
  }
}

export default function RedirectPage() {
  return <div style={{ padding: 20 }}>Redirecting…</div>;
}
