"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { BarChart2 } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { apiFetch } from "@/lib/api";

// ── Types ─────────────────────────────────────────────────────────────────────

interface MetricsSummary {
  totalRequests: number;
  // API may return a number or a pre-formatted string — normalised in fetch
  avgResponseTime: number;
  errorCount: number;
}

interface RawMetric {
  _id: string;
  method: string;
  route: string;
  statusCode: number;
  responseTime: number;
  createdAt: string;
}

interface ChartPoint {
  time: string;
  requests: number;
  errors: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const TIME_RANGES = ["Last 24 Hours", "Last 7 Days", "Last 30 Days"] as const;
type TimeRange = (typeof TIME_RANGES)[number];

const RANGE_PARAM: Record<TimeRange, string> = {
  "Last 24 Hours": "24h",
  "Last 7 Days":   "7d",
  "Last 30 Days":  "30d",
};

function buildChartData(metrics: RawMetric[], range: TimeRange): ChartPoint[] {
  if (range === "Last 24 Hours") {
    const buckets: Record<string, ChartPoint> = {};
    for (let h = 0; h < 24; h++) {
      const label = `${String(h).padStart(2, "0")}:00`;
      buckets[label] = { time: label, requests: 0, errors: 0 };
    }
    metrics.forEach((m) => {
      const label = `${String(new Date(m.createdAt).getHours()).padStart(2, "0")}:00`;
      if (buckets[label]) {
        buckets[label].requests++;
        if (m.statusCode >= 400) buckets[label].errors++;
      }
    });
    return Object.values(buckets);
  }

  if (range === "Last 7 Days") {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
    const buckets = Object.fromEntries(
      days.map((d) => [d, { time: d, requests: 0, errors: 0 }])
    ) as Record<string, ChartPoint>;
    metrics.forEach((m) => {
      const d = days[new Date(m.createdAt).getDay()];
      buckets[d].requests++;
      if (m.statusCode >= 400) buckets[d].errors++;
    });
    return days.map((d) => buckets[d]);
  }

  // Last 30 Days
  const buckets: Record<string, ChartPoint> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = `${d.getMonth() + 1}/${d.getDate()}`;
    buckets[label] = { time: label, requests: 0, errors: 0 };
  }
  metrics.forEach((m) => {
    const d     = new Date(m.createdAt);
    const label = `${d.getMonth() + 1}/${d.getDate()}`;
    if (buckets[label]) {
      buckets[label].requests++;
      if (m.statusCode >= 400) buckets[label].errors++;
    }
  });
  return Object.values(buckets);
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────

interface TooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-lg text-sm">
      <p className="mb-1.5 font-bold text-gray-800">{label}</p>
      <p className="font-medium text-blue-600">
        Requests: {payload[0]?.value?.toLocaleString() ?? 0}
      </p>
      <p className="font-medium text-red-500">
        Errors: {payload[1]?.value?.toLocaleString() ?? 0}
      </p>
    </div>
  );
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function ApiMetricsPage() {
  const { getToken } = useAuth();

  const [timeRange, setTimeRange]           = useState<TimeRange>("Last 24 Hours");
  const [dropdownOpen, setDropdownOpen]     = useState(false);
  const dropdownRef                         = useRef<HTMLDivElement>(null);

  const [summary, setSummary]               = useState<MetricsSummary | null>(null);
  const [rawMetrics, setRawMetrics]         = useState<RawMetric[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingChart, setLoadingChart]     = useState(true);
  const [summaryError, setSummaryError]     = useState<string | null>(null);
  const [chartError, setChartError]         = useState<string | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch summary — getToken must be called, not passed as a ref
  useEffect(() => {
    const load = async () => {
      try {
        setLoadingSummary(true);
        setSummaryError(null);
        const token = await getToken();            // FIX: was passing getToken fn directly
        const data  = await apiFetch("/metrics/summary", token);
        setSummary({
          ...data,
          // Normalise: API may return string e.g. "142.3" — parse it
          avgResponseTime: parseFloat(data.avgResponseTime) || 0,
        } as MetricsSummary);
      } catch (e) {
        console.error(e);
        setSummaryError("Unable to load summary");
      } finally {
        setLoadingSummary(false);
      }
    };
    load();
  }, [getToken]);

  // Fetch chart metrics — re-fetches when timeRange changes
  const fetchMetrics = useCallback(async () => {
    try {
      setLoadingChart(true);
      setChartError(null);
      const token = await getToken();              // FIX: was passing getToken fn directly
      const data  = await apiFetch(
        `/metrics?limit=1000&range=${RANGE_PARAM[timeRange]}`,
        token
      );
      const list: RawMetric[] = Array.isArray(data) ? data : (data?.metrics ?? []);
      setRawMetrics(list);
    } catch (e) {
      console.error(e);
      setChartError("Unable to load chart data");
    } finally {
      setLoadingChart(false);
    }
  }, [timeRange, getToken]);

  useEffect(() => { fetchMetrics(); }, [fetchMetrics]);

  const chartData = buildChartData(rawMetrics, timeRange);

  // FIX: successRate was "—" when errorCount === 0 (falsy 0 failed the ternary)
  const successRate =
    summary
      ? (((summary.totalRequests - summary.errorCount) / Math.max(summary.totalRequests, 1)) * 100).toFixed(1)
      : null;

  // FIX: avgResponseTime may be float — round to 1 decimal for display
  const summaryCards = [
    {
      label: "Total Requests",
      value: loadingSummary ? "…" : summary ? summary.totalRequests.toLocaleString() : "—",
      color: "text-blue-600",
    },
    {
      label: "Avg Response Time",
      value: loadingSummary
        ? "…"
        : summary
        ? `${summary.avgResponseTime.toFixed(1)}ms`  // FIX: toFixed instead of raw string concat
        : "—",
      color: "text-gray-800",
    },
    {
      label: "Error Count",
      value: loadingSummary ? "…" : summary ? summary.errorCount.toLocaleString() : "—",
      color: "text-red-500",
    },
    {
      label: "Success Rate",
      // FIX: was `successRate ? ...` — falsy when 0%, now checks null explicitly
      value: loadingSummary ? "…" : successRate !== null ? `${successRate}%` : "—",
      color: "text-green-600",
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold text-gray-800">API Metrics</h1>

      {/* ── Summary Cards ──────────────────────────────────────────────────── */}
      {summaryError ? (
        <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-500">
          {summaryError}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {summaryCards.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm"
            >
              <p className="mb-1.5 text-xs font-medium text-gray-500">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Chart Card ─────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

        {/* Chart header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 size={17} className="text-gray-400" aria-hidden="true" />
            <span className="font-semibold text-gray-800">API Performance</span>
          </div>

          {/* Dropdown — FIX: added ref + outside-click close */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              aria-haspopup="listbox"
              aria-expanded={dropdownOpen}
              className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              {timeRange}
              <svg width={13} height={13} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {dropdownOpen && (
              <div
                role="listbox"
                className="absolute right-0 top-full z-50 mt-1 min-w-[150px] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
              >
                {TIME_RANGES.map((r) => (
                  <button
                    key={r}
                    role="option"
                    aria-selected={r === timeRange}
                    onClick={() => { setTimeRange(r); setDropdownOpen(false); }}
                    className={`block w-full px-4 py-2 text-left text-sm transition hover:bg-gray-50 ${
                      r === timeRange
                        ? "bg-blue-50 font-semibold text-blue-600"
                        : "text-gray-700"
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
          <div className="flex h-[320px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          </div>
        ) : chartError ? (
          // FIX: was checking the shared `error` state — now uses dedicated chartError
          <div className="flex h-[320px] flex-col items-center justify-center gap-3">
            <span className="text-3xl" role="img" aria-label="Warning">⚠️</span>
            <p className="text-sm font-medium text-red-500">{chartError}</p>
            <button
              onClick={fetchMetrics}
              className="rounded-lg border border-gray-200 px-4 py-1.5 text-sm text-gray-600 transition hover:bg-gray-50"
            >
              Retry
            </button>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="gReq2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01} />
                </linearGradient>
                <linearGradient id="gErr2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 14 }} />
              <Area type="monotone" dataKey="requests" stroke="#3b82f6" strokeWidth={2} fill="url(#gReq2)" dot={false} activeDot={{ r: 5, fill: "#3b82f6" }} />
              <Area type="monotone" dataKey="errors"   stroke="#ef4444" strokeWidth={2} fill="url(#gErr2)" dot={false} activeDot={{ r: 5, fill: "#ef4444" }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}