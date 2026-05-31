 "use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import ProductActions from "./ProductActions";
import { BASE_URL, apiFetch } from "@/lib/api";


interface Product {
  _id: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
  stock?: number;
  image?: string;
  createdAt?: string;
}

const stockStatus = (stock?: number) => {
  if (stock === undefined || stock === null)
    return null;
  if (stock === 0)
    return { label: "Out of Stock", bg: "bg-red-100",    text: "text-red-600"    };
  if (stock < 10)
    return { label: "Low Stock",    bg: "bg-yellow-100", text: "text-yellow-700" };
  return   { label: "In Stock",    bg: "bg-green-100",  text: "text-green-700"  };
};

export default function ProductsPage() {
  const { getToken } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await apiFetch("/products", getToken);
      const list: Product[] = Array.isArray(data) ? data : data.products ?? [];

      setProducts(
        list.map((p) => ({
          ...p,
          image: p.image
            ? p.image.startsWith("http") ? p.image : `${BASE_URL}${p.image}`
            : "",
        }))
      );
    } catch (err) {
      console.error(err);
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-full px-6">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Products</h1>
            {!loading && !error && (
              <p className="mt-0.5 text-sm text-gray-500">{products.length} total</p>
            )}
          </div>
          <Link
            href="/products/create"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            + Add Product
          </Link>
        </div>

        {/* Card */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">

          {/* Loading skeleton */}
          {loading && (
            <div className="space-y-3 p-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-lg bg-gray-100" />
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <span className="text-4xl">⚠️</span>
              <p className="font-medium text-red-500">{error}</p>
              <button
                onClick={fetchProducts}
                className="rounded-lg border border-gray-200 px-4 py-1.5 text-sm text-gray-600 transition hover:bg-gray-50"
              >
                Retry
              </button>
            </div>
          )}

          {/* Table */}
          {!loading && !error && (
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-6 py-3">Image</th>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Stock</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3">Created At</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.length > 0 ? (
                  products.map((product) => {
                    const status = stockStatus(product.stock);
                    return (
                      <tr key={product._id} className="transition hover:bg-gray-50">

                        {/* Image */}
                        <td className="px-6 py-4">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-12 w-12 rounded-lg object-cover ring-1 ring-gray-200"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                              N/A
                            </div>
                          )}
                        </td>

                        {/* Name */}
                        <td className="px-6 py-4 font-semibold text-gray-800">
                          {product.name}
                        </td>

                        {/* Category */}
                        <td className="px-6 py-4">
                          {product.category ? (
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                              {product.category}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        {/* Price */}
                        <td className="px-6 py-4 font-semibold text-gray-800">
                          ${product.price.toFixed(2)}
                        </td>

                        {/* Stock */}
                        <td className="px-6 py-4 text-gray-700">
                          {product.stock ?? "—"}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          {status ? (
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.bg} ${status.text}`}>
                              {status.label}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        {/* Description */}
                        <td className="max-w-[180px] px-6 py-4 text-gray-500">
                          <p className="truncate">{product.description ?? "—"}</p>
                        </td>

                        {/* Created At */}
                        <td className="px-6 py-4 text-gray-500">
                          {product.createdAt
                            ? new Date(product.createdAt).toLocaleDateString("en-US", {
                                year: "numeric", month: "short", day: "numeric",
                              })
                            : "—"}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <ProductActions productId={product._id} onDeleted={fetchProducts} />
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="py-14 text-center text-gray-400">
                      No products found. Add your first product to get started.
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