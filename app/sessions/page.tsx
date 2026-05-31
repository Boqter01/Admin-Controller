"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";

interface Session {
  _id: string;
  userName: string;
  userEmail: string;
  ipAddress: string;
  userAgent: string;
  loginAt: string;
  expiresAt: string;
  isActive: boolean;
}

const statusBadge = (active: boolean) =>
  active
    ? "bg-green-100 text-green-700"
    : "bg-gray-100 text-gray-500";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/sessions`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch sessions");
      const data: Session[] = await res.json();
      setSessions(data);
    } catch (err) {
      console.error(err);
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSessions(); }, []);

  const activeSessions = sessions.filter(s => s.isActive).length;

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-5xl px-4">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Sessions</h1>
            {!loading && !error && (
              <p className="mt-0.5 text-sm text-gray-500">
                {activeSessions} active · {sessions.length} total
              </p>
            )}
          </div>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

          {/* Loading skeleton */}
          {loading && (
            <div className="space-y-3 p-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100" />
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <span className="text-4xl">⚠️</span>
              <p className="font-medium text-red-500">{error}</p>
              <button
                onClick={fetchSessions}
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
                <tr className="border-b bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">IP Address</th>
                  <th className="px-6 py-3">Device</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Logged in</th>
                  <th className="px-6 py-3">Expires</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sessions.length > 0 ? (
                  sessions.map((session) => (
                    <tr key={session._id} className="transition hover:bg-gray-50">

                      {/* User */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                            {session.userName?.split(" ").map((n) => n[0]).join("").toUpperCase() ?? "?"}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{session.userName}</p>
                            <p className="text-xs text-gray-400">{session.userEmail}</p>
                          </div>
                        </div>
                      </td>

                      {/* IP */}
                      <td className="px-6 py-4 font-mono text-xs text-gray-600">
                        {session.ipAddress}
                      </td>

                      {/* Device — truncated user agent */}
                      <td className="max-w-[180px] px-6 py-4">
                        <span
                          className="block truncate text-xs text-gray-500"
                          title={session.userAgent}
                        >
                          {session.userAgent}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(session.isActive)}`}>
                          {session.isActive ? "Active" : "Expired"}
                        </span>
                      </td>

                      {/* Logged in */}
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {session.loginAt ? formatDate(session.loginAt) : "—"}
                      </td>

                      {/* Expires */}
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {session.expiresAt ? formatDate(session.expiresAt) : "—"}
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-14 text-center text-gray-400">
                      No sessions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}