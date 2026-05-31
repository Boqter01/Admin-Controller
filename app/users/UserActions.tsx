 
"use client";

import { API_URL } from "@/lib/api";
import { useRouter } from "next/navigation";

interface UserActionsProps {
  userId: string;
  onDeleted?: () => void;
}

export default function UserActions({ userId, onDeleted }: UserActionsProps) {
  const router = useRouter();

  const handleEdit = () => {
    router.push(`/users/edit/${userId}`);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`${API_URL}/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const text = await res.text();
      let data: any = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        // response not JSON
      }

      if (!res.ok) {
        console.error("Delete error:", data);
        alert(data.message || "Delete failed");
        return;
      }

      // Success
      onDeleted?.();
      router.refresh(); // App Router safe refresh
    } catch (err) {
      console.error("Network error:", err);
      alert("Failed to delete user. Server not reachable.");
    }
  };

  return (
    <div className="flex justify-end gap-2">
      <button
        onClick={handleEdit}
        className="rounded bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-100"
      >
        Edit
      </button>

      <button
        onClick={handleDelete}
        className="rounded bg-red-50 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-100"
      >
        Delete
      </button>
    </div>
  );
}

