"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import UserActions from "./UserActions";
import { API_URL } from "@/app/lib/api";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_URL}/users`, {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch users");
      }

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

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Users</h1>
          <Link
            href="/users/create"
            className="rounded bg-blue-600 px-4 py-2 text-white shadow-sm transition hover:bg-blue-700"
          >
            Add New
          </Link>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-gray-500 animate-pulse">
              Loading users...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : (
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                    Name
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                    Email
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr
                      key={user._id}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 font-medium text-gray-800">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <UserActions
                          userId={user._id}
                          onDeleted={fetchUsers}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-10 text-center text-gray-400"
                    >
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
