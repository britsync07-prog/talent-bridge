'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'EMPLOYER' | 'ENGINEER'>('EMPLOYER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signup(email, password, role);
      if (role === 'EMPLOYER') router.push('/dashboard/employer');
      else router.push('/dashboard/engineer');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E7E6E2] text-[#32312D] flex flex-col font-sans selection:bg-[#3A3F5F] selection:text-white">
      <Navbar />
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#3A3F5F]/5 rounded-full blur-[150px] -z-10"></div>
          
          <div className="w-full max-w-xl bg-white p-16 rounded-[60px] border border-[#32312D]/10 shadow-[0_0_100px_rgba(58,63,95,0.05)]">
              <div className="text-center mb-16">
                  <div className="text-[10px] font-black text-[#3A3F5F] uppercase tracking-[0.5em] mb-6">Credential Acquisition</div>
                  <h1 className="text-5xl font-black tracking-tighter uppercase mb-4 text-[#32312D]">Join The Roster.</h1>
                  <p className="text-[#32312D]/40 text-[10px] font-black uppercase tracking-[0.2em]">Begin your induction into the Talent Bridge Standard.</p>
              </div>

              {error && <div className="mb-10 p-6 bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest text-center rounded-3xl">{error}</div>}

              <form onSubmit={handleSubmit} className="space-y-10">
                  <div className="grid grid-cols-2 gap-4">
                      <button 
                        type="button"
                        onClick={() => setRole('EMPLOYER')}
                        className={`py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${role === 'EMPLOYER' ? 'bg-[#3A3F5F] text-white shadow-lg shadow-[#3A3F5F]/30' : 'bg-[#E7E6E2]/50 text-[#32312D]/40 border border-[#32312D]/5 hover:border-[#3A3F5F]/30'}`}
                      >
                        Corporate
                      </button>
                      <button 
                        type="button"
                        onClick={() => setRole('ENGINEER')}
                        className={`py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${role === 'ENGINEER' ? 'bg-[#3A3F5F] text-white shadow-lg shadow-[#3A3F5F]/30' : 'bg-[#E7E6E2]/50 text-[#32312D]/40 border border-[#32312D]/5 hover:border-[#3A3F5F]/30'}`}
                      >
                        Engineer
                      </button>
                  </div>

                  <div className="space-y-8">
                      <div className="space-y-3 text-left">
                          <label className="block text-[8px] font-black text-[#32312D]/40 uppercase tracking-[0.4em] ml-2">Secure Identifier (Email)</label>
                          <input 
                            type="email" 
                            required 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#E7E6E2]/30 border-b-2 border-[#32312D]/10 py-5 px-2 text-[#32312D] outline-none focus:border-[#3A3F5F] transition-all font-black uppercase text-xs tracking-widest placeholder:text-slate-300"
                            placeholder="OPERATOR@CORE.NETWORK"
                          />
                      </div>
                      <div className="space-y-3 text-left">
                          <label className="block text-[8px] font-black text-[#32312D]/40 uppercase tracking-[0.4em] ml-2">Passphrase (Password)</label>
                          <input 
                            type="password" 
                            required 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[#E7E6E2]/30 border-b-2 border-[#32312D]/10 py-5 px-2 text-[#32312D] outline-none focus:border-[#3A3F5F] transition-all font-black text-xs tracking-widest"
                            placeholder="••••••••••••"
                          />
                      </div>
                  </div>

                  <button 
                    disabled={loading}
                    className="w-full mt-12 bg-[#3A3F5F] text-white py-7 rounded-3xl font-black uppercase text-xs tracking-[0.4em] hover:bg-[#32312D] transition-all shadow-2xl shadow-[#3A3F5F]/20 disabled:opacity-20"
                  >
                    {loading ? 'Synthesizing...' : 'Execute Induction'}
                  </button>
              </form>

              <div className="mt-16 text-center">
                  <Link href="/login" className="text-[9px] font-black text-[#32312D]/40 uppercase tracking-[0.3em] hover:text-[#3A3F5F] transition-all border-b border-[#3A3F5F] pb-1">Access Encryption Gateway →</Link>
              </div>
          </div>
      </section>
    </div>
  );
};

export default SignupPage;
