// "use client";

// import Dashboard from "./Dashboard";

// export default function Home() {
//   return (
//     <main className="p-6">
//       <Dashboard />
//     </main>
//   );
// }
 
 "use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import Dashboard from "./Dashboard";
import LoginButton  from "./components/LoginButton";


export default function Home() {
  const { user, isLoading } = useUser();

  // Prevents content flashing while checking session
  if (isLoading) {
    return (
      <main className="p-6">
        <div className="animate-pulse bg-gray-200 h-64 w-full rounded-xl" />
      </main>
    );
  }

  // If no user is logged in, show a call to action or a restricted message
  if (!user) {
    return (
      <main className="p-6 flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl text-white font-bold mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6">Please log in to view the Admin Panel. </p>
          <p className="text-white mb-6"> <LoginButton /> </p>
        
          
       
      </main>
    );
  }

  // Only success can reach this
  return (
    <main className="p-6">
      <Dashboard />
    </main>
  );
}