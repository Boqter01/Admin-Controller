"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { API_URL } from "@/app/lib/api";
import Link from "next/dist/client/link";

export default function EditUserPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "",
  });

  useEffect(() => {
    fetch(`${API_URL}/users/${id}`)
      .then((res) => res.json())
      .then((data) => setForm(data));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch(`${API_URL}/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      router.push("/users");
    } else {
      alert("Failed to update user");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-amber-50">
      <h1 className="text-xl font-bold mb-4">Edit User</h1>

  <form onSubmit={handleSubmit} className="space-y-4">
    <div>
      <label className="block text-sm font-medium mb-1">Name</label>
      <input
        type="text"
        required
        className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">Email</label>
      <input
        type="email"
        required
        className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">Role</label>
      <select
        className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500"
        value={form.role}
        onChange={(e) => setForm({ ...form, role: e.target.value })}
      >
        <option value="USER">User</option>
        <option value="ADMIN">Admin</option>
      </select>
    </div>

    <button
      type="submit"
      className="w-full py-2 rounded text-white font-bold bg-blue-600 hover:bg-blue-700 transition"
    >
      Update
    </button>
     <button className="mt-2 w-full py-2 rounded text-gray-700 font-bold border border-gray-300 hover:bg-gray-100 transition">
          <Link href="/users">Cancel</Link>
        </button>
  </form>

    </div>
  );
}
