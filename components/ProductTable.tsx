// type Product = {
//   _id: string;
//   name: string;
//   price: number;
//   description?: string;
//   category?: string;
//   stock?: number;
//   image?: string;
//   createdAt?: string;
// };

// interface ProductTableProps {
//   products: Product[];
// }

// export default function ProductTable({ products }: ProductTableProps) {
//   return (
//     <table className="w-full shadow rounded overflow-hidden">
//       <thead className="bg-gray-200">
//         <tr>
//           <th className="p-3 text-left">Image</th>
//           <th className="p-3 text-left">Name</th>
//           <th className="p-3 text-left">Price</th>
//           <th className="p-3 text-left">Category</th>
//           <th className="p-3 text-left">Stock</th>
//           <th className="p-3 text-left">Created</th>
//           <th className="p-3 text-left">Action</th>
//         </tr>
//       </thead>

//       <tbody>
//         {products.map((product) => (
//           <tr
//             key={product._id}
//             className="border-t hover:bg-gray-50 transition-colors"
//           >
//             {/* Image */}
//             <td className="p-3">
//               {product.image ? (
//                 <img
//                   src={
//                     product.image.startsWith("http")
//                       ? product.image
//                       : `http://localhost:5000${product.image}`
//                   }
//                   alt={product.name}
//                   className="w-12 h-12 object-cover rounded"
//                 />
//               ) : (
//                 <span className="text-gray-400 text-sm">No Image</span>
//               )}
//             </td>

//             {/* Name */}
//             <td className="p-3 font-medium">{product.name}</td>

//             {/* Price */}
//             <td className="p-3 text-green-600 font-semibold">
//               ${product.price.toFixed(2)}
//             </td>

//             {/* Category */}
//             <td className="p-3 text-sm">
//               <span className="px-2 py-1 rounded bg-gray-100 text-gray-700">
//                 {product.category ?? "Uncategorized"}
//               </span>
//             </td>

//             {/* Stock */}
//             <td className="p-3">
//               <span
//                 className={`px-2 py-1 rounded text-sm ${
//                   product.stock && product.stock > 0
//                     ? "bg-green-100 text-green-700"
//                     : "bg-red-100 text-red-700"
//                 }`}
//               >
//                 {product.stock ?? 0}
//               </span>
//             </td>

//             {/* Created Date */}
//             <td className="p-3 text-gray-500 text-sm">
//               {product.createdAt
//                 ? new Date(product.createdAt).toLocaleDateString()
//                 : "N/A"}
//             </td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   );
// }

type Product = {
  _id: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
  stock?: number;
  image?: string;
  createdAt?: string;
};

interface ProductTableProps {
  products: Product[];
}

const stockBadge = (stock?: number) => {
  if (stock === undefined || stock === null)
    return { label: "—",            cls: "bg-gray-100 text-gray-400"   };
  if (stock === 0)
    return { label: "Out of Stock", cls: "bg-red-100 text-red-600"     };
  if (stock < 10)
    return { label: "Low Stock",    cls: "bg-yellow-100 text-yellow-700" };
  return   { label: "In Stock",    cls: "bg-green-100 text-green-700"  };
};

export default function ProductTable({ products }: ProductTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <th className="px-6 py-3">Image</th>
            <th className="px-6 py-3">Name</th>
            <th className="px-6 py-3">Category</th>
            <th className="px-6 py-3">Price</th>
            <th className="px-6 py-3">Stock</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3">Created</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {products.length > 0 ? (
            products.map((product) => {
              const badge = stockBadge(product.stock);
              return (
                <tr key={product._id} className="transition hover:bg-gray-50">

                  {/* Image */}
                  <td className="px-6 py-4">
                    {product.image ? (
                      <img
                        src={
                          product.image.startsWith("http")
                            ? product.image
                            : `http://localhost:5000${product.image}`
                        }
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
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                      {product.category ?? "Uncategorized"}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-6 py-4 font-semibold text-gray-800">
                    ${product.price.toFixed(2)}
                  </td>

                  {/* Stock count */}
                  <td className="px-6 py-4 text-gray-700 font-medium">
                    {product.stock ?? 0}
                  </td>

                  {/* Status badge */}
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </td>

                  {/* Created */}
                  <td className="px-6 py-4 text-gray-500">
                    {product.createdAt
                      ? new Date(product.createdAt).toLocaleDateString("en-US", {
                          year: "numeric", month: "short", day: "numeric",
                        })
                      : "N/A"}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={7} className="py-14 text-center text-gray-400">
                No products found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}