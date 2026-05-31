"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { API_URL } from "@/lib/api";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

function getInitials(name: string) {
  return name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() ?? "?";
}

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-600",
  "bg-purple-100 text-purple-600",
  "bg-emerald-100 text-emerald-600",
  "bg-amber-100 text-amber-600",
  "bg-rose-100 text-rose-600",
  "bg-cyan-100 text-cyan-600",
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const roleBadge = (role: string) =>
  role?.toLowerCase() === "admin"
    ? "bg-purple-100 text-purple-700"
    : "bg-blue-100 text-blue-700";

function UserProfileCard({ user }: { user: User }) {
  const avatarColor = getAvatarColor(user.name);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      {/* Top: avatar + name + role */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${avatarColor}`}
          >
            {getInitials(user.name)}
          </div>
          <div>
            <p className="font-semibold text-gray-800">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
        <span
          className={`mt-0.5 rounded-full px-3 py-1 text-xs font-semibold capitalize ${roleBadge(user.role)}`}
        >
          {user.role}
        </span>
      </div>

      {/* Divider */}
      <div className="my-4 border-t border-gray-100" />

      {/* Details */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="mb-0.5 uppercase tracking-wide text-gray-400">User ID</p>
          <p className="truncate font-mono text-gray-600">...{user._id.slice(-8)}</p>
        </div>
        <div>
          <p className="mb-0.5 uppercase tracking-wide text-gray-400">Joined</p>
          <p className="text-gray-600">{formatDate(user.createdAt)}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        <Link
          href={`/users/${user._id}`}
          className="flex-1 rounded-lg border border-gray-200 py-1.5 text-center text-xs font-medium text-gray-600 transition hover:bg-gray-50"
        >
          View
        </Link>
        <Link
          href={`/users/${user._id}/edit`}
          className="flex-1 rounded-lg bg-blue-600 py-1.5 text-center text-xs font-semibold text-white transition hover:bg-blue-700"
        >
          Edit
        </Link>
      </div>
    </div>
  );
}

export default function UserProfilesPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/users`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data: User[] = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const roles = ["All", ...Array.from(new Set(users.map((u) => u.role ?? "User")))];

  const filtered = users.filter((u) => {
    const matchRole = roleFilter === "All" || u.role === roleFilter;
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-5xl px-4">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">User Profiles</h1>
            {!loading && !error && (
              <p className="mt-0.5 text-sm text-gray-500">
                {filtered.length} of {users.length} users
              </p>
            )}
          </div>
          <Link
            href="/users/create"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            + Add New
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
          />
          <div className="flex gap-2">
            {roles.map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                  roleFilter === r
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-44 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="text-4xl">⚠️</span>
            <p className="font-medium text-red-500">{error}</p>
            <button
              onClick={fetchUsers}
              className="rounded-lg border border-gray-200 px-4 py-1.5 text-sm text-gray-600 transition hover:bg-gray-50"
            >
              Retry
            </button>
          </div>
        )}

        {/* Cards grid */}
        {!loading && !error && (
          <>
            {filtered.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((user) => (
                  <UserProfileCard key={user._id} user={user} />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-gray-400">No users found.</div>
            )}
          </>
        )}
      </div>
    </main>
  );
}