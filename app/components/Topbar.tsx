// // import Profile from "./Profile";
// // import LoginButton from "./LoginButton";
// // import LogoutButton from "./LogoutButton";

// // export default function Topbar() {
// //   return (
// //     <header className="bg-white shadow p-4 flex justify-between">
// //       <span className="font-semibold">Admin Panel</span>
// //        <span className="font-semibold">Admin  </span>
      
// //     </header>
// //   );
// // }
// "use client";
// import { useState } from "react";
// import Profile from "./Profile";
// import LoginButton from "./LoginButton";
// import LogoutButton from "./LogoutButton";

// export default function Topbar() {
//   const [isOpen, setIsOpen] = useState(false);

//   return (
//     <header className="relative bg-white shadow p-4 flex justify-between items-center">
//       <span className="font-semibold text-lg">Admin Panel</span>

//       <div className="relative">
//         {/* The Trigger: Clicking this toggles the menu */}
//         <button 
//           onClick={() => setIsOpen(!isOpen)}
//           className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-full transition"
//         >
//           <span className="font-semibold">Admin</span>
//           <div className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center">
//             <Profile />
//           </div>
//         </button>

//         {/* The Dropdown Card */}
//         {isOpen && (
//           <div className="absolute right-0 mt-2 w-80 bg-[#2d2e30] text-white rounded-3xl shadow-xl p-6 z-50">
//             <div className="flex flex-col items-center">
//               <span className="text-sm text-gray-400 mb-4">admin@example.com</span>
              
//               {/* Profile Component (The large BO circle) */}
//               <div className="relative mb-4">
//                 <div className="w-20 h-20 bg-teal-600 rounded-full flex items-center justify-center text-3xl">
//                   <Profile />
//                 </div>
//               </div>

//               <h2 className="text-xl mb-4">Hi, Admin!</h2>
              
//               <button className="border border-gray-500 rounded-full px-6 py-2 text-sm font-medium hover:bg-gray-800 mb-6">
//                 <LogoutButton />
//               </button>

//               <div className="flex w-full gap-1">
                 
//                 <div className="flex-1 bg-[#1e1f20] p-4 rounded-r-2xl flex items-center justify-center gap-2 hover:bg-gray-800 cursor-pointer">
//                   <LoginButton />
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </header>
//   );
// }
"use client";

import { useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import LoginButton from "./LoginButton";
import LogoutButton from "./LogoutButton";

export default function Topbar() {
  const { user, isLoading } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  // Optional: Add a subtle loading skeleton or stay silent until loaded
  if (isLoading) return <header className="bg-white shadow p-4 h-16 animate-pulse" />;

  return (
    <header className="relative bg-white shadow p-4 flex justify-between items-center">
      <span className="font-semibold text-lg">Admin Panel</span>

      <div className="relative">
        {user ? (
          <>
            {/* Authenticated Trigger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-full transition"
            >
              <span className="font-semibold">{user.name || "Admin"}</span>
              <img 
                src={user.picture || ""} 
                alt="Profile" 
                className="w-8 h-8 rounded-full border border-gray-200" 
              />
            </button>

            {/* Dropdown Card */}
            {isOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-[#2d2e30] text-white rounded-3xl shadow-xl p-6 z-50">
                <div className="flex flex-col items-center">
                  <span className="text-sm text-gray-400 mb-4">{user.email}</span>

                  {/* <div className="relative mb-4">
                    <img 
                      src={user.picture || ""} 
                      alt={user.name || "Profile"} 
                      className="w-20 h-20 rounded-full border-2 border-teal-500" 
                    />
                  </div> */}
                  <div className="relative mb-4">
                    {user?.picture ? (
                      <img
                        src={user.picture}
                        alt={user.name || "Profile"}
                        className="w-20 h-20 rounded-full border-2 border-teal-500 object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full border-2 border-teal-500 bg-teal-600 flex items-center justify-center text-white text-2xl font-bold">
                        {user?.name?.charAt(0).toUpperCase() || "A"}
                      </div>
                    )}
                  </div>

                  <h2 className="text-xl mb-4">Hi, {user.given_name || user.name}!</h2>

                  <div className="flex flex-col w-full gap-3">
                    <div className="flex justify-center border border-gray-500 rounded-full px-6 py-2 text-sm font-medium hover:bg-gray-800 transition">
                      <LogoutButton />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Unauthenticated State */
          <div className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition">
            <LoginButton />
          </div>
        )}
      </div>
    </header>
  );
}