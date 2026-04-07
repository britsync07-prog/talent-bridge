'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-[#E7E6E2]/90 backdrop-blur-xl border-b border-[#32312D]/10 py-5 px-6 md:px-12 flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center gap-12">
        <Link href="/" className="text-2xl font-black text-[#3A3F5F] tracking-tighter">
          TALENT BRIDGE
        </Link>
      </div>
      <div className="flex items-center gap-6">
        {user ? (
          <>
            <Link 
              href={user.role === 'ADMIN' ? '/dashboard/admin' : user.role === 'EMPLOYER' ? '/dashboard/employer' : '/dashboard/engineer'}
              className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-[#3A3F5F] transition-all"
            >
              Dashboard
            </Link>
            <button 
              onClick={logout}
              className="bg-[#3A3F5F] text-white px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-[#3A3F5F]/90 transition-all shadow-md shadow-[#3A3F5F]/20"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-[#3A3F5F] transition-all">Login</Link>
            <Link 
              href="/signup" 
              className="bg-[#3A3F5F] text-white px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-[#3A3F5F]/20"
            >
              Join Talent Bridge
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
