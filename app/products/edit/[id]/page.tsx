"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { API_URL, BASE_URL } from "@/lib/api";
import Link from "next/link";

export default function EditProduct() {
  const { id } = useParams();
  const router = useRouter();
  const { getToken } = useAuth();

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    stock: "",
  });

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      const token = await getToken();

      const res = await fetch(`${API_URL}/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      setForm({
        name: data.name ?? "",
        price: data.price ?? "",
        description: data.description ?? "",
        category: data.category ?? "",
        stock: data.stock ?? "",
      });

      if (data.image) {
        setPreview(`${BASE_URL}${data.image}`);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = await getToken();

      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("price", form.price);
      formData.append("description", form.description);
      formData.append("category", form.category);
      formData.append("stock", form.stock);
      if (image) formData.append("image", image);

      const res = await fetch(`${API_URL}/products/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Update failed");

      alert("Product updated successfully!");
      router.push("/products");
      router.refresh();
    } catch (err) {
      alert("Something went wrong");
      console.error(err);
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
            value={form.name}
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
            value={form.price}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <input
            name="category"
            type="text"
            className="w-full border p-2 rounded"
            value={form.category}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Stock</label>
          <input
            name="stock"
            type="number"
            className="w-full border p-2 rounded"
            value={form.stock}
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
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="mt-2 w-32 h-32 object-cover rounded border"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            className="w-full border p-2 rounded"
            value={form.description}
            onChange={handleChange}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded text-white font-bold ${
            loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? "Updating..." : "Update Product"}
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