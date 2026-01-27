export default function CreateUserPage() {
  return (
    <div className="max-w-md bg-white p-6 rounded shadow">
      <h1 className="text-xl font-bold mb-4">Create User</h1>

      <form className="space-y-4">
        <input className="w-full border p-2 rounded" placeholder="Name" />
        <input className="w-full border p-2 rounded" placeholder="Email" />

        <select className="w-full border p-2 rounded">
          <option>USER</option>
          {/* <option>ADMIN</option> */}
        </select>

        <button className="bg-blue-600 text-white w-full py-2 rounded">
          Create
        </button>
      </form>
    </div>
  );
}
