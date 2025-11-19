// // pages/index.js
// import { useState, useEffect } from 'react';

// function fetchJson(url, opts) {
//   return fetch(url, opts).then(async (res) => {
//     const text = await res.text();
//     try {
//       return JSON.parse(text);
//     } catch {
//       return text;
//     }
//   });
// }

// export default function Dashboard() {
//   const [links, setLinks] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [targetUrl, setTargetUrl] = useState('');
//   const [code, setCode] = useState('');
//   const [error, setError] = useState('');
//   const [busy, setBusy] = useState(false);
//   const [filter, setFilter] = useState('');

//   const baseUrl =
//     process.env.NEXT_PUBLIC_BASE_URL ||
//     (typeof window !== 'undefined' ? window.location.origin : '');

//   async function load() {
//     setLoading(true);
//     const data = await fetchJson('/api/links');
//     setLinks(Array.isArray(data) ? data : []);
//     setLoading(false);
//   }

//   useEffect(() => {
//     const id = setTimeout(() => {
//       load();
//     }, 0);
//     return () => clearTimeout(id);
//   }, []);

//   function validate() {
//     if (!targetUrl) return 'Target URL is required';
//     if (!/^https?:\/\//i.test(targetUrl))
//       return 'URL must start with http:// or https://';
//     if (code && !/^[A-Za-z0-9]{6,8}$/.test(code))
//       return 'Custom code must be 6–8 alphanumeric characters';
//     return null;
//   }

//   async function handleCreate(e) {
//     e.preventDefault();
//     const validation = validate();
//     if (validation) {
//       setError(validation);
//       return;
//     }

//     setError('');
//     setBusy(true);

//     try {
//       const res = await fetch('/api/links', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           target_url: targetUrl,
//           code: code || undefined,
//         }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         setError(data.error || 'Something went wrong');
//       } else {
//         setTargetUrl('');
//         setCode('');
//         await load();
//       }
//     } catch {
//       setError('Network error');
//     }

//     setBusy(false);
//   }

//   async function handleDelete(c) {
//     if (!confirm(`Delete ${c}? This cannot be undone.`)) return;

//     try {
//       const res = await fetch(`/api/links/${c}`, { method: 'DELETE' });
//       if (res.ok) await load();
//       else alert('Delete failed');
//     } catch {
//       alert('Delete failed');
//     }
//   }

//   function copyToClipboard(text) {
//     navigator.clipboard.writeText(text);
//     alert('Copied!');
//   }

//   const filtered = links.filter((l) => {
//     const q = filter.trim().toLowerCase();
//     if (!q) return true;
//     return (
//       l.code.toLowerCase().includes(q) ||
//       l.target_url.toLowerCase().includes(q)
//     );
//   });

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-5xl mx-auto">
//         <header className="flex justify-between items-center mb-6">
//           <h1 className="text-2xl font-semibold">TinyLink Dashboard</h1>
//         </header>

//         {/* Add Link Form */}
//         <section className="bg-white shadow rounded p-4 mb-6">
//           <form onSubmit={handleCreate} className="space-y-3">
//             <div className="flex flex-col sm:flex-row gap-3">
//               <input
//                 type="text"
//                 value={targetUrl}
//                 onChange={(e) => setTargetUrl(e.target.value)}
//                 placeholder="https://example.com/my-long-url"
//                 className="flex-1 p-2 border rounded"
//               />

//               <input
//                 type="text"
//                 value={code}
//                 onChange={(e) => setCode(e.target.value)}
//                 placeholder="Optional code (6–8 chars)"
//                 className="w-64 p-2 border rounded"
//               />

//               <button
//                 disabled={busy}
//                 className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-40"
//               >
//                 {busy ? 'Adding…' : 'Add'}
//               </button>
//             </div>

//             {error && <p className="text-red-600 text-sm">{error}</p>}
//           </form>
//         </section>

//         {/* Search */}
//         <section className="bg-white shadow rounded p-4">
//           <div className="flex justify-between items-center mb-3">
//             <h2 className="font-medium">Your Links</h2>

//             <input
//               value={filter}
//               onChange={(e) => setFilter(e.target.value)}
//               placeholder="Search code or target…"
//               className="w-64 p-2 border rounded"
//             />
//           </div>

//           {/* Loading / Empty */}
//           {loading ? (
//             <div className="py-6 text-center text-gray-500">Loading…</div>
//           ) : filtered.length === 0 ? (
//             <div className="py-6 text-center text-gray-500">No links found.</div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full text-left">
//                 <thead>
//                   <tr className="text-sm text-gray-600">
//                     <th className="py-2">Code</th>
//                     <th>Target URL</th>
//                     <th className="text-right">Clicks</th>
//                     <th className="text-right">Last Clicked</th>
//                     <th className="text-right">Actions</th>
//                   </tr>
//                 </thead>

//                 <tbody>
//                   {filtered.map((l) => (
//                     <tr key={l.code} className="border-t">
//                       <td className="py-3 font-mono">{l.code}</td>

//                       <td className="py-3 max-w-xl">
//                         <div className="truncate">{l.target_url}</div>
//                       </td>

//                       <td className="py-3 text-right">{l.clicks}</td>

//                       <td className="py-3 text-right">
//                         {l.last_clicked_at
//                           ? new Date(l.last_clicked_at).toLocaleString()
//                           : '—'}
//                       </td>

//                       <td className="py-3 text-right space-x-2">
//                         <button
//                           className="px-2 py-1 border rounded text-sm"
//                           onClick={() =>
//                             copyToClipboard(`${baseUrl}/${l.code}`)
//                           }
//                         >
//                           Copy
//                         </button>

//                         <a
//                           className="px-2 py-1 border rounded text-sm"
//                           href={`/code/${l.code}`}
//                         >
//                           Stats
//                         </a>

//                         <button
//                           className="px-2 py-1 border rounded text-sm text-red-600"
//                           onClick={() => handleDelete(l.code)}
//                         >
//                           Delete
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </section>

//         <footer className="mt-6 text-sm text-gray-500 text-center">
//           TinyLink © 2025 — URL Shortener
//         </footer>
//       </div>
//     </div>
//   );
// }


// pages/index.js
import { useState, useEffect } from 'react';

function fetchJson(url, opts) {
  return fetch(url, opts).then(async (res) => {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  });
}

export default function Dashboard() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [targetUrl, setTargetUrl] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState('');

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (typeof window !== 'undefined' ? window.location.origin : '');

  async function load() {
    setLoading(true);
    const data = await fetchJson('/api/links');
    setLinks(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => {
    (async () => {
      await load();
    })();
  }, []);

  function validate() {
    if (!targetUrl) return 'Target URL is required';
    if (!/^https?:\/\//i.test(targetUrl))
      return 'URL must start with http:// or https://';
    if (code && !/^[A-Za-z0-9]{6,8}$/.test(code))
      return 'Custom code must be 6–8 alphanumeric characters';
    return null;
  }

  async function handleCreate(e) {
    e.preventDefault();
    const validation = validate();
    if (validation) {
      setError(validation);
      return;
    }

    setError('');
    setBusy(true);

    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_url: targetUrl,
          code: code || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
      } else {
        setTargetUrl('');
        setCode('');
        await load();
      }
    } catch {
      setError('Network error');
    }

    setBusy(false);
  }

  async function handleDelete(c) {
    if (!confirm(`Delete ${c}? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/links/${c}`, { method: 'DELETE' });
      if (res.ok) await load();
      else alert('Delete failed');
    } catch {
      alert('Delete failed');
    }
  }

  function copyToClipboard(text) {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard
        .writeText(text)
        .then(() => alert('Copied!'))
        .catch(() => alert('Failed to copy'));
    } else {
      alert('Clipboard not supported');
    }
  }

  const filtered = links.filter((l) => {
    const q = filter.trim().toLowerCase();
    if (!q) return true;
    return (
      l.code.toLowerCase().includes(q) ||
      l.target_url.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">TinyLink Dashboard</h1>
        </header>

        {/* Add Link */}
        <section className="bg-white shadow rounded p-4 mb-6">
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://example.com/my-long-url"
                className="flex-1 p-2 border rounded"
              />

              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Optional code (6–8 chars)"
                className="w-64 p-2 border rounded"
              />

              <button
                disabled={busy}
                className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-40"
              >
                {busy ? 'Adding…' : 'Add'}
              </button>
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}
          </form>
        </section>

        {/* Search Section */}
        <section className="bg-white shadow rounded p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-medium">Your Links</h2>

            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search code or target…"
              className="w-64 p-2 border rounded"
            />
          </div>

          {/* Loading */}
          {loading ? (
            <div className="py-6 text-center text-gray-500">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="py-6 text-center text-gray-500">No links found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-sm text-gray-600">
                    <th className="py-2">Code</th>
                    <th>Target URL</th>
                    <th className="text-right">Clicks</th>
                    <th className="text-right">Last Clicked</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((l) => (
                    <tr key={l.code} className="border-t">
                      <td className="py-3 font-mono">{l.code}</td>

                      <td className="py-3 max-w-xl">
                        <div className="truncate">{l.target_url}</div>
                      </td>

                      <td className="py-3 text-right">{l.clicks}</td>

                      <td className="py-3 text-right">
                        {l.last_clicked_at
                          ? new Date(l.last_clicked_at).toLocaleString()
                          : '—'}
                      </td>

                      <td className="py-3 text-right space-x-2">
                        <button
                          className="px-2 py-1 border rounded text-sm"
                          onClick={() =>
                            copyToClipboard(`${baseUrl}/${l.code}`)
                          }
                        >
                          Copy
                        </button>

                        <a
                          className="px-2 py-1 border rounded text-sm"
                          href={`/code/${l.code}`}
                        >
                          Stats
                        </a>

                        <button
                          className="px-2 py-1 border rounded text-sm text-red-600"
                          onClick={() => handleDelete(l.code)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="mt-6 text-sm text-gray-500 text-center">
          TinyLink © 2025 — URL Shortener
        </footer>
      </div>
    </div>
  );
}
