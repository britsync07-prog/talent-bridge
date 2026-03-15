'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E7E6E2] text-[#32312D] flex flex-col font-sans selection:bg-[#3A3F5F] selection:text-white">
      <Navbar />
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#3A3F5F]/5 rounded-full blur-[120px] -z-10"></div>
          
          <div className="w-full max-w-md bg-white p-12 rounded-[50px] border border-[#32312D]/10 shadow-2xl">
              <div className="text-center mb-12">
                  <div className="text-[10px] font-black text-[#3A3F5F] uppercase tracking-[0.4em] mb-4">Security Gateway</div>
                  <h1 className="text-4xl font-black tracking-tighter uppercase mb-2 text-[#32312D]">Initialize.</h1>
                  <p className="text-[#32312D]/40 text-[10px] font-black uppercase tracking-widest">Secure access to your operational node.</p>
              </div>

              {error && <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest text-center rounded-2xl">{error}</div>}

              <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-2 text-left">
                      <label className="block text-[8px] font-black text-[#32312D]/40 uppercase tracking-[0.3em] ml-2">Identifier (Email)</label>
                      <input 
                        type="email" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#E7E6E2]/30 border-b-2 border-[#32312D]/5 py-4 px-2 text-[#32312D] outline-none focus:border-[#3A3F5F] transition-all font-black uppercase text-xs tracking-widest placeholder:text-slate-300"
                        placeholder="OPERATOR@CORE.NETWORK"
                      />
                  </div>
                  <div className="space-y-2 text-left">
                      <label className="block text-[8px] font-black text-[#32312D]/40 uppercase tracking-[0.3em] ml-2">Passphrase (Password)</label>
                      <input 
                        type="password" 
                        required 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[#E7E6E2]/30 border-b-2 border-[#32312D]/5 py-4 px-2 text-[#32312D] outline-none focus:border-[#3A3F5F] transition-all font-black text-xs tracking-widest"
                        placeholder="••••••••"
                      />
                  </div>
                  <button 
                    disabled={loading}
                    className="w-full bg-[#3A3F5F] text-white py-6 rounded-2xl font-black uppercase text-xs tracking-[0.3em] hover:bg-[#32312D] transition-all shadow-xl shadow-[#3A3F5F]/20 disabled:opacity-20"
                  >
                    {loading ? 'Synthesizing...' : 'Authorize Access'}
                  </button>
              </form>

              <div className="mt-12 text-center">
                  <Link href="/signup" className="text-[9px] font-black text-[#32312D]/40 uppercase tracking-[0.3em] hover:text-[#3A3F5F] transition-all border-b border-[#32312D]/5 pb-1">Request New Credentials</Link>
              </div>
          </div>

          <div className="mt-12 flex gap-10">
              <Link href="/terms" className="text-[#32312D]/20 font-black uppercase text-[10px] tracking-[0.3em] hover:text-[#32312D] transition-all">Accord</Link>
              <Link href="/privacy" className="text-[#32312D]/20 font-black uppercase text-[10px] tracking-[0.3em] hover:text-[#32312D] transition-all">Shield</Link>
          </div>
      </section>Section
    </div>
  );
};

export default LoginPage;
