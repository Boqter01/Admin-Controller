// "use client";

// import { API_URL } from "@/lib/api";
// import { useRouter } from "next/navigation";

// interface ProductActionsProps {
//   productId: string;
//   onDeleted?: () => void;
// }

// export default function ProductActions({
//   productId,
//   onDeleted,
// }: ProductActionsProps) {
//   const router = useRouter();

//   const handleEdit = () => {
//     router.push(`/products/edit/${productId}`);
//   };

//   const handleDelete = async () => {
//     const confirmed = window.confirm(
//       "Are you sure you want to delete this product?"
//     );
//     if (!confirmed) return;

//     try {
//       const res = await fetch(`${API_URL}/products/${productId}`, {
//         method: "DELETE",
//       });

//       const text = await res.text();
//       let data: { message?: string } = {};

//       try {
//         data = text ? JSON.parse(text) : {};
//       } catch {
//         // Ignore non-JSON responses
//       }

//       if (!res.ok) {
//         console.error("Delete error:", data);
//         alert(data.message || "Delete failed");
//         return;
//       }

//       // Success
//       onDeleted?.(); // call parent callback
//       router.refresh(); // refresh the page
//     } catch (err) {
//       console.error("Network error:", err);
//       alert("Failed to delete product.");
//     }
//   };

//   return (
//     <div className="flex justify-end gap-2">
//       <button
//         onClick={handleEdit}
//         className="rounded bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-100"
//       >
//         Edit
//       </button>

//       <button
//         onClick={handleDelete}
//         className="rounded bg-red-50 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-100"
//       >
//         Delete
//       </button>
//     </div>
//   );
// }
 
"use client";

import { API_URL } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

interface ProductActionsProps {
  productId: string;
  onDeleted?: () => void;
}

export default function ProductActions({
  productId,
  onDeleted,
}: ProductActionsProps) {
  const router = useRouter();
  const { getToken } = useAuth();

  const handleEdit = () => {
    router.push(`/products/edit/${productId}`);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );
    if (!confirmed) return;

    try {
      const token = await getToken();

      const res = await fetch(`${API_URL}/products/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const text = await res.text();
      let data: { message?: string } = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        // Ignore non-JSON responses
      }

      if (!res.ok) {
        console.error("Delete error:", data);
        alert(data.message || "Delete failed");
        return;
      }

      onDeleted?.();
      router.refresh();
    } catch (err) {
      console.error("Network error:", err);
      alert("Failed to delete product.");
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