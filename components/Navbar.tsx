// components/Navbar.tsx
"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import React from "react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
  <nav className="flex items-center justify-between px-5 py-2 shadow-md" style={{ boxShadow: '0 4px 16px -4px rgba(0,0,0,0.15)' }}>
      <h1 className="text-3xl font-extrabold tracking-tight">Open-ADR</h1>
      <div>
        {session ? (
          <div className="flex items-center gap-4">
            {session.user?.image && (
              <Image
                src={session.user.image}
                alt="Avatar"
                width={36}
                height={36}
                className="rounded-full border-2 border-gray-300 shadow"
              />
            )}
            <button
              onClick={() => signOut()}
              className="px-4 py-2 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-700 transition-all duration-150 shadow"
            >
              Sign out
            </button>
          </div>
        ) : (
          <button
            onClick={() => signIn("github")}
            className="px-4 py-2 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-700 transition-all duration-150 shadow"
          >
            Sign in with GitHub
          </button>
        )}
      </div>
    </nav>
  );
}
