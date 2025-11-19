// pages/code/[code].js
import Link from "next/link";
import { useRouter } from "next/router";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function CodeStats() {
  const router = useRouter();
  const { code } = router.query;

  const { data, error } = useSWR(
    code ? `/api/links/${code}` : null,
    fetcher
  );

  if (error) return <div className="p-6">Failed to load.</div>;
  if (!data) return <div className="p-6">Loading…</div>;
  if (data.error) return <div className="p-6">Link not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-xl mx-auto bg-white shadow rounded p-4">
        <h1 className="text-xl font-semibold mb-3">
          Stats for <span className="font-mono">{data.code}</span>
        </h1>

        <div className="space-y-2 text-gray-700">
          <p>
            <strong>Target URL:</strong>{" "}
            <a
              href={data.target_url}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline"
            >
              {data.target_url}
            </a>
          </p>

          <p>
            <strong>Total Clicks:</strong> {data.clicks}
          </p>

          <p>
            <strong>Created:</strong>{" "}
            {new Date(data.created_at).toLocaleString()}
          </p>

          <p>
            <strong>Last Clicked:</strong>{" "}
            {data.last_clicked_at
              ? new Date(data.last_clicked_at).toLocaleString()
              : "—"}
          </p>
        </div>
        <div className="mt-4">
          <Link href="/">
            <a className="text-sm text-blue-600 hover:underline">← Back to dashboard</a>
          </Link>
        </div>
      </div>
    </div>
  );
}
