'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';

const LogoutButton = () => {
  const { logout } = useAuth();

  return (
    <button 
      onClick={logout}
      className="bg-[#3A3F5F] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#32312D] transition-all shadow-lg shadow-[#3A3F5F]/20 flex items-center gap-3 group"
    >
      <span className="group-hover:rotate-12 transition-transform">Logout</span>
      <span className="text-white/50 group-hover:text-white transition-colors">→</span>
    </button>
  );
};

export default LogoutButton;
