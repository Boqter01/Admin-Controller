type User = {
  _id: string;  
  name: string;
  email: string;
  role?: string;
  createdAt?: string;
};

export default function UserTable({ users }: { users: User[] }) {
  return (
    <table className="w-full bg-white shadow rounded overflow-hidden">
      <thead className="bg-gray-200">
        <tr>
          <th className="p-3 text-left">Name</th>
          <th className="p-3 text-left">Email</th>
          <th className="p-3 text-left">Role</th>
          <th className="p-3 text-left">Joined</th>
        </tr>
      </thead>

      <tbody>
        {users.map((user) => (
          // Using _id from your Mongoose schema as the key
          <tr key={user._id} className="border-t hover:bg-gray-50 transition-colors">
            <td className="p-3">{user.name}</td>
            <td className="p-3">{user.email}</td>
            <td className="p-3 text-sm">
              <span className={`px-2 py-1 rounded ${user.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                {user.role ?? "User"}
              </span>
            </td>
            <td className="p-3 text-gray-500 text-sm">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}