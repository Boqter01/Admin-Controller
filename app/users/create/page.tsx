 
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/app/lib/api"
import Link from "next/link";

export default function CreateUserPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "USER",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        // Redirect back to the users list after success
        router.push("/users");
        router.refresh(); // Refresh server components to show new data
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Failed to create user:", error);
      alert("Something went wrong. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            required
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            required
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Role</label>
          <select
            className="w-full border p-2 rounded outline-none"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            <option value="USER">User</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded text-white font-bold transition-all ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Saving..." : "Create User"}
        </button>
        <button className="mt-2 w-full py-2 rounded text-gray-700 font-bold border border-gray-300 hover:bg-gray-100 transition">
          <Link href="/users">Cancel</Link>
        </button>
      </form>
    </div>
  );
}