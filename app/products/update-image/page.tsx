"use client";

import { useState } from "react";

export default function UpdateImage() {
  const [id, setId] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const formData = new FormData();
    if (image) formData.append("image", image);

    await fetch(`http://localhost:5000/api/products/${id}/image`, {
      method: "PUT",
      body: formData,
    });

    alert("Image updated!");
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <input
        placeholder="Product ID"
        onChange={(e) => setId(e.target.value)}
        className="border p-2 w-full"
      />

      <input type="file" onChange={(e) => setImage(e.target.files?.[0] || null)} />

      <button className="bg-green-500 text-white px-4 py-2">
        Update Image
      </button>
    </form>
  );
}