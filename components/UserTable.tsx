// type User = {
//   _id: string;  
//   name: string;
//   email: string;
//   role?: string;
//   createdAt?: string;
// };

// export default function UserTable({ users }: { users: User[] }) {
//   return (
//     <table className="w-full  shadow rounded overflow-hidden">
//       <thead className="bg-gray-200">
//         <tr>
//           <th className="p-3 text-left">Name</th>
//           <th className="p-3 text-left">Email</th>
//           <th className="p-3 text-left">Role</th>
//           <th className="p-3 text-left">Joined</th>
//         </tr>
//       </thead>

//       <tbody>
//         {users.map((user) => (
//           // Using _id from your Mongoose schema as the key
//           <tr key={user._id} className="border-t hover:bg-gray-50 transition-colors">
//             <td className="p-3">{user.name}</td>
//             <td className="p-3">{user.email}</td>
//             <td className="p-3 text-sm">
//               <span className={`px-2 py-1 rounded ${user.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
//                 {user.role ?? "User"}
//               </span>
//             </td>
//             <td className="p-3 text-gray-500 text-sm">
//               {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
//             </td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   );
// }

type User = {
  _id: string;
  name: string;
  email: string;
  role?: string;
  createdAt?: string;
};

export default function UserTable({ users }: { users: User[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <th className="px-6 py-3">Name</th>
            <th className="px-6 py-3">Email</th>
            <th className="px-6 py-3">Role</th>
            <th className="px-6 py-3">Joined</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user._id} className="transition hover:bg-gray-50">

                {/* Name + initials avatar */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                      {user.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase() ?? "?"}
                    </div>
                    <span className="font-medium text-gray-800">{user.name}</span>
                  </div>
                </td>

                {/* Email */}
                <td className="px-6 py-4 text-gray-600">{user.email}</td>

                {/* Role badge */}
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                      user.role?.toLowerCase() === "admin"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {user.role ?? "User"}
                  </span>
                </td>

                {/* Joined date */}
                <td className="px-6 py-4 text-gray-500">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric", month: "short", day: "numeric",
                      })
                    : "N/A"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="py-14 text-center text-gray-400">
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}