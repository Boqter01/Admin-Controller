"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import StatCard from "@/components/StatCard";
import { Users, Activity, TrendingUp, Database } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { apiFetch, API_URL } from "@/lib/api";

// ── Types ────────────────────────────────────────────────────────────────────

interface MetricsSummary {
  totalRequests: number;
  avgResponseTime: number;
  errorCount: number;
}

interface ActivityLog {
  _id: string;
  userId: string;
  action: string;
  entity?: string;
  entityId?: string;
  ipAddress?: string;
  createdAt: string;
  details?: { route?: string; endpoint?: string };
}

interface ApiMetric {
  createdAt: string;
  statusCode: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const timeRanges = ["Last 24 Hours", "Last 7 Days", "Last 30 Days"];

/** Group raw ApiMetric rows into chart buckets */
function buildChartData(metrics: ApiMetric[], range: string) {
  if (range === "Last 24 Hours") {
    const buckets: Record<string, { requests: number; errors: number }> = {};
    for (let h = 0; h < 24; h++) {
      const label = `${String(h).padStart(2, "0")}:00`;
      buckets[label] = { requests: 0, errors: 0 };
    }
    metrics.forEach((m) => {
      const h = new Date(m.createdAt).getHours();
      const label = `${String(h).padStart(2, "0")}:00`;
      if (buckets[label]) {
        buckets[label].requests++;
        if (m.statusCode >= 400) buckets[label].errors++;
      }
    });
    return Object.entries(buckets).map(([time, v]) => ({ time, ...v }));
  }

  if (range === "Last 7 Days") {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const buckets: Record<string, { requests: number; errors: number }> = {};
    days.forEach((d) => (buckets[d] = { requests: 0, errors: 0 }));
    metrics.forEach((m) => {
      const d = days[new Date(m.createdAt).getDay()];
      buckets[d].requests++;
      if (m.statusCode >= 400) buckets[d].errors++;
    });
    return days.map((time) => ({ time, ...buckets[time] }));
  }

  // Last 30 Days
  const buckets: Record<string, { requests: number; errors: number }> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = `${d.getMonth() + 1}/${d.getDate()}`;
    buckets[label] = { requests: 0, errors: 0 };
  }
  metrics.forEach((m) => {
    const d = new Date(m.createdAt);
    const label = `${d.getMonth() + 1}/${d.getDate()}`;
    if (buckets[label]) {
      buckets[label].requests++;
      if (m.statusCode >= 400) buckets[label].errors++;
    }
  });
  return Object.entries(buckets).map(([time, v]) => ({ time, ...v }));
}

// ── Component ────────────────────────────────────────────────────────────────

export default function OverviewPage() {
  const { getToken } = useAuth();

  // State
  const [timeRange, setTimeRange]       = useState("Last 24 Hours");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [totalUsers, setTotalUsers]         = useState<number | null>(null);
  const [activeSessions, setActiveSessions] = useState<number | null>(null);
  const [summary, setSummary]               = useState<MetricsSummary | null>(null);
  const [chartMetrics, setChartMetrics]     = useState<ApiMetric[]>([]);
  const [recentLogs, setRecentLogs]         = useState<ActivityLog[]>([]);
  const [loadingStats, setLoadingStats]     = useState(true);
  const [loadingChart, setLoadingChart]     = useState(true);

  // Fetch stat cards
  useEffect(() => {
    const load = async () => {
      setLoadingStats(true);
      try {
        const [usersRes, sessionsData, metricsData] = await Promise.allSettled([
          fetch(`${API_URL}/users`, { cache: "no-store" }),
          apiFetch("/sessions?isActive=true&limit=1", getToken),
          apiFetch("/metrics/summary", getToken),
        ]);

        if (usersRes.status === "fulfilled" && usersRes.value.ok) {
          const users = await usersRes.value.json();
          setTotalUsers(Array.isArray(users) ? users.length : users.total ?? 0);
        }
        if (sessionsData.status === "fulfilled") {
          const d = sessionsData.value as any;
          setActiveSessions(d.total ?? 0);
        }
        if (metricsData.status === "fulfilled") {
          setSummary(metricsData.value as MetricsSummary);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingStats(false);
      }
    };
    load();
  }, []);

  // Fetch chart metrics + activity logs
  useEffect(() => {
    const load = async () => {
      setLoadingChart(true);
      try {
        const rangeParam =
          timeRange === "Last 24 Hours" ? "24h" :
          timeRange === "Last 7 Days"   ? "7d"  : "30d";

        const [metricsData, logsData] = await Promise.allSettled([
          apiFetch(`/metrics?limit=500&range=${rangeParam}`, getToken),
          apiFetch("/activity-logs?limit=4", getToken),
        ]);

        if (metricsData.status === "fulfilled") {
          const d = metricsData.value as any;
          setChartMetrics(Array.isArray(d) ? d : d.metrics ?? []);
        }
        if (logsData.status === "fulfilled") {
          const d = logsData.value as any;
          setRecentLogs(Array.isArray(d) ? d : d.logs ?? []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingChart(false);
      }
    };
    load();
  }, [timeRange]);

  const chartData = buildChartData(chartMetrics, timeRange);

  const successRate = summary
    ? (((summary.totalRequests - summary.errorCount) / Math.max(summary.totalRequests, 1)) * 100).toFixed(1)
    : null;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">

      {/* ── Stat Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={loadingStats ? "..." : totalUsers !== null ? totalUsers.toLocaleString() : "—"}
          change="+12.5%" changePositive
          iconBg="#eff6ff" icon={<Users size={20} color="#3b82f6" />}
        />
        <StatCard
          title="API Calls Today"
          value={loadingStats ? "..." : summary ? summary.totalRequests.toLocaleString() : "—"}
          change="+8.2%" changePositive
          iconBg="#ecfdf5" icon={<Activity size={20} color="#10b981" />}
        />
        <StatCard
          title="Active Sessions"
          value={loadingStats ? "..." : activeSessions !== null ? activeSessions.toLocaleString() : "—"}
          change="-2.4%" changePositive={false}
          iconBg="#f5f3ff" icon={<TrendingUp size={20} color="#8b5cf6" />}
        />
        <StatCard
          title="Avg Response Time"
          value={loadingStats ? "..." : summary ? `${summary.avgResponseTime}ms` : "—"}
          change="+5.1%" changePositive
          iconBg="#fffbeb" icon={<Database size={20} color="#f59e0b" />}
        />
      </div>

      {/* ── Chart + Activity ───────────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">

        {/* API Performance Chart */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-gray-400" />
              <span className="font-semibold text-gray-800">API Performance</span>
            </div>

            {/* Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                {timeRange}
                <svg width={13} height={13} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-full z-50 mt-1 min-w-[150px] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                  {timeRanges.map((r) => (
                    <button
                      key={r}
                      onClick={() => { setTimeRange(r); setDropdownOpen(false); }}
                      className={`block w-full px-4 py-2 text-left text-sm transition hover:bg-gray-50 ${
                        r === timeRange ? "bg-blue-50 font-semibold text-blue-600" : "text-gray-700"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chart */}
          {loadingChart ? (
            <div className="flex h-[260px] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gReq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01} />
                  </linearGradient>
                  <linearGradient id="gErr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e8eaf0", fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                <Area type="monotone" dataKey="requests" stroke="#3b82f6" strokeWidth={2} fill="url(#gReq)" dot={false} activeDot={{ r: 4 }} />
                <Area type="monotone" dataKey="errors"   stroke="#ef4444" strokeWidth={2} fill="url(#gErr)" dot={false} activeDot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {/* Bottom stats */}
          <div className="mt-4 flex gap-8 border-t border-gray-100 pt-4">
            <div>
              <p className="text-xs text-gray-400">Avg Response Time</p>
              <p className="mt-0.5 text-lg font-bold text-gray-800">
                {summary ? `${summary.avgResponseTime}ms` : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Success Rate</p>
              <p className="mt-0.5 text-lg font-bold text-green-600">
                {successRate ? `${successRate}%` : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Total Errors</p>
              <p className="mt-0.5 text-lg font-bold text-red-500">
                {summary ? summary.errorCount.toLocaleString() : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg width={15} height={15} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="text-gray-400">
                <circle cx={12} cy={12} r={10} /><polyline points="12 6 12 12 16 14" />
              </svg>
              <span className="font-semibold text-gray-800">Recent Activity</span>
            </div>
            <a href="/activity-log" className="text-sm font-medium text-blue-600 hover:underline">
              View All
            </a>
          </div>

          {/* Header row */}
          <div className="grid grid-cols-[1fr_90px_1fr] gap-2 border-b border-gray-100 pb-2">
            {["USER", "ACTION", "ENDPOINT"].map((h) => (
              <span key={h} className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{h}</span>
            ))}
          </div>

          {/* Rows */}
          {loadingChart ? (
            <div className="mt-3 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-8 animate-pulse rounded bg-gray-100" />
              ))}
            </div>
          ) : recentLogs.length > 0 ? (
            recentLogs.map((log, i) => (
              <div
                key={log._id}
                className={`grid grid-cols-[1fr_90px_1fr] gap-2 py-3 ${
                  i < recentLogs.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <span className="truncate text-xs font-medium text-gray-800">{log.userId}</span>
                <span className="text-xs text-gray-500">{log.action}</span>
                <span className="truncate font-mono text-[10px] text-gray-400">
                  {log.details?.route ?? log.details?.endpoint ?? log.entity ?? "—"}
                </span>
              </div>
            ))
          ) : (
            <p className="mt-6 text-center text-sm text-gray-400">No recent activity.</p>
          )}
        </div>
      </div>
    </div>
  );
}