"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { API_URL } from "@/lib/api";
import Link from "next/link";

export default function CreateProductPage() {
  const router = useRouter();
  const { getToken } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    stock: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = await getToken();

      const data = new FormData();
      data.append("name", formData.name);
      data.append("price", String(Number(formData.price)));
      data.append("stock", String(Number(formData.stock || 0)));
      if (formData.category) data.append("category", formData.category);
      if (formData.description) data.append("description", formData.description);
      if (imageFile) data.append("image", imageFile);

      const res = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // NOTE: do NOT set Content-Type here — browser sets it automatically for FormData
        },
        body: data,
      });

      const text = await res.text();
      console.log("Server response:", text);

      let result;
      try {
        result = text ? JSON.parse(text) : {};
      } catch {
        console.error("Invalid JSON from server");
        alert("Server returned invalid response");
        return;
      }

      if (!res.ok) {
        alert(result.message || "Failed to create product");
        return;
      }

      alert("Product created successfully!");
      router.push("/products");
      router.refresh();
    } catch (err) {
      console.error("Network error:", err);
      alert("Failed to create product. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            name="name"
            type="text"
            required
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Price</label>
          <input
            name="price"
            type="number"
            required
            className="w-full border p-2 rounded"
            value={formData.price}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <input
            name="category"
            type="text"
            className="w-full border p-2 rounded"
            value={formData.category}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Stock</label>
          <input
            name="stock"
            type="number"
            className="w-full border p-2 rounded"
            value={formData.stock}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Image</label>
          <input
            type="file"
            accept="image/*"
            className="w-full"
            onChange={handleFileChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            className="w-full border p-2 rounded"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded text-white font-bold ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Saving..." : "Create Product"}
        </button>

        <Link href="/products">
          <button
            type="button"
            className="mt-2 w-full py-2 rounded text-gray-700 font-bold border border-gray-300 hover:bg-gray-100"
          >
            Cancel
          </button>
        </Link>
      </form>
    </div>
  );
}