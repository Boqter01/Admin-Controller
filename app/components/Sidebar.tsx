import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white p-6">
      <h2 className="text-xl font-bold mb-6">Dashboard</h2>

      <nav className="space-y-3">
        <Link href="/">Home</Link>
        <Link href="/users">Users</Link>
      </nav>
    </aside>
  );
}
