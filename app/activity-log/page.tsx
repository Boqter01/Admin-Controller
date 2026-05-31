"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Clock, RefreshCw, Search } from "lucide-react";
import { apiFetch } from "@/lib/api";

/* ─── types ──────────────────────────────────────────────────────── */
interface ActivityLog {
  _id: string;
  userId: string;
  action: string;
  entity?: string;
  entityId?: string;
  ipAddress?: string;
  details?: {
    route?: string;
    endpoint?: string;
    statusCode?: number;
    productName?: string;
    changes?: Record<string, { from: unknown; to: unknown }>;
  };
  createdAt: string;
}

interface ClerkUserInfo {
  fullName: string | null;
  imageUrl: string | null;
  email: string | null;
}

/* ─── helpers ────────────────────────────────────────────────────── */
const timeAgo = (dateStr: string) => {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatAction = (action: string) =>
  action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const StatusPill = ({ statusCode }: { statusCode?: number }) => {
  const isError = statusCode !== undefined && statusCode >= 400;
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
        isError ? "bg-red-100 text-red-500" : "bg-green-100 text-green-600"
      }`}
    >
      {isError ? "error" : "success"}
    </span>
  );
};

/* ─── skeleton row ───────────────────────────────────────────────── */
const SkeletonRow = () => (
  <tr className="border-b border-gray-100">
    {[160, 120, 160, 70, 80].map((w, i) => (
      <td key={i} className="px-6 py-4">
        <div className="h-4 animate-pulse rounded bg-gray-100" style={{ width: w }} />
      </td>
    ))}
  </tr>
);

/* ─── main page ──────────────────────────────────────────────────── */
export default function ActivityLogPage() {
  const { getToken } = useAuth();

  const [logs, setLogs]       = useState<ActivityLog[]>([]);
  const [userMap, setUserMap] = useState<Record<string, ClerkUserInfo>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [search, setSearch]   = useState("");
  const [page, setPage]       = useState(0);
  const PER_PAGE = 10;

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      // API_URL already has /api prefix → path is just /activity-logs
      const data = await apiFetch("/activity-logs?limit=100", getToken);
      const list: ActivityLog[] = Array.isArray(data) ? data : data.logs ?? [];
      setLogs(list);
      setUserMap(data.users ?? {});
      setPage(0);
    } catch (err) {
      console.error(err);
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const filtered = logs.filter((l) => {
    const q = search.toLowerCase();
    return (
      !q ||
      (userMap[l.userId]?.email ?? "").toLowerCase().includes(q) ||
      (userMap[l.userId]?.fullName ?? "").toLowerCase().includes(q) ||
      l.userId.toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q) ||
      (l.details?.route ?? "").toLowerCase().includes(q) ||
      (l.details?.endpoint ?? "").toLowerCase().includes(q) ||
      (l.details?.productName ?? "").toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated  = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  return (
    <div className="flex flex-col gap-6">

      {/* Page title */}
      <h1 className="text-2xl font-bold text-gray-800">Activity Log</h1>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

        {/* Card header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Clock size={15} className="text-gray-400" />
            Recent Activity
          </div>

          {/* Search + Refresh */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                className="h-8 w-44 rounded-lg border border-gray-200 pl-8 pr-3 text-xs outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 px-3 text-xs text-gray-500 transition hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <table className="w-full border-collapse text-left text-sm">
            <tbody>
              {[...Array(6)].map((_, i) => <SkeletonRow key={i} />)}
            </tbody>
          </table>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="text-4xl">⚠️</span>
            <p className="font-medium text-red-500">{error}</p>
            <button
              onClick={fetchLogs}
              className="rounded-lg border border-gray-200 px-4 py-1.5 text-sm text-gray-600 transition hover:bg-gray-50"
            >
              Retry
            </button>
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-400">
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Action</th>
                <th className="px-6 py-3">Endpoint</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length > 0 ? (
                paginated.map((log) => {
                  const user = userMap[log.userId];
                  const displayUser = user?.email ?? user?.fullName ?? log.userId;
                  const endpoint = log.details?.route ?? log.details?.endpoint ?? "—";

                  return (
                    <tr
                      key={log._id}
                      className="border-b border-gray-100 transition hover:bg-gray-50/60"
                    >
                      <td className="px-6 py-4 text-sm text-gray-700">{displayUser}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatAction(log.action)}</td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">
                        <span className="block max-w-[220px] truncate">{endpoint}</span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusPill statusCode={log.details?.statusCode} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {timeAgo(log.createdAt)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-14 text-center text-sm text-gray-400">
                    No activity logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {!loading && !error && filtered.length > PER_PAGE && (
          <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3">
            <p className="text-xs text-gray-400">
              Showing {page * PER_PAGE + 1}–
              {Math.min((page + 1) * PER_PAGE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
              >
                ← Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}