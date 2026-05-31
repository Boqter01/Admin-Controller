"use client";

import { useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";

export default function Topbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isSignedIn, user } = useUser();

  return (
    <header className="bg-white shadow px-6 py-3 flex justify-between items-center top-0 z-50">
      <h1 className="text-lg font-semibold">Admin Panel</h1>

      <div className="relative">
        {isSignedIn ? (
          <>
            {/* Avatar Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition"
            >
               
               <div className="px-3 py-2">
                    <UserButton afterSignOutUrl="/sign-in" />
                  </div>
            </button>

         
          </>
        ) : (
          <a
            href="/sign-in"
            className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm"
          >
            Sign in
          </a>
        )}
      </div>
    </header>
  );
}

 