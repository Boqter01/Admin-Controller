"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import UserActions from "./UserActions";
import { API_URL } from "@/lib/api";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const roleBadge = (role: string) =>
  role?.toLowerCase() === "admin"
    ? "bg-purple-100 text-purple-700"
    : "bg-blue-100 text-blue-700";

export default function UsersPage() {
  const [users, setUsers]     = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

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

  useEffect(() => { fetchUsers(); }, []);

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-4xl px-4">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Users</h1>
            {!loading && !error && (
              <p className="mt-0.5 text-sm text-gray-500">{users.length} total</p>
            )}
          </div>
          <Link
            href="/users/create"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            + Add New
          </Link>
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
                onClick={fetchUsers}
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
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Created At</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user._id} className="transition hover:bg-gray-50">

                      {/* Name + initials avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                            {user.name?.split(" ").map((n) => n[0]).join("").toUpperCase() ?? "?"}
                          </div>
                          <span className="font-medium text-gray-800">{user.name}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 text-gray-600">{user.email}</td>

                      {/* Role badge */}
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${roleBadge(user.role)}`}>
                          {user.role}
                        </span>
                      </td>

                      {/* Created At */}
                      <td className="px-6 py-4 text-gray-500">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString("en-US", {
                              year: "numeric", month: "short", day: "numeric",
                            })
                          : "—"}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <UserActions userId={user._id} onDeleted={fetchUsers} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-14 text-center text-gray-400">
                      No users found.
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