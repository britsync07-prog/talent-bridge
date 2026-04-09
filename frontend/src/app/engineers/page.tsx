'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';

interface Engineer {
  id: string;
  fullName: string;
  skills: string;
  aiSpecializations: string;
  country: string;
  hourlyRate: number;
  yearsExperience: number;
  isFeatured: boolean;
}

const EngineersPage = () => {
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/engineers').then(res => {
      setEngineers(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = engineers.filter(e => 
    e.fullName.toLowerCase().includes(search.toLowerCase()) ||
    e.skills.toLowerCase().includes(search.toLowerCase()) ||
    e.aiSpecializations.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#E7E6E2] text-slate-600">
      <Navbar />
      
      {/* Search Header */}
      <section className="pt-20 pb-12 px-6 md:px-12 border-b border-[#32312D]/10 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="max-w-2xl text-left">
                <div className="flex items-center gap-3 mb-4">
                    <span className="w-2 h-2 rounded-full bg-[#3A3F5F]"></span>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#3A3F5F]">Operational Roster</span>
                </div>
                <h1 className="text-6xl font-black tracking-tighter uppercase mb-2 text-[#32312D]">The Talent Bridge <span className="text-[#3A3F5F]">Network.</span></h1>
                <p className="text-slate-400 font-medium uppercase tracking-widest text-sm">Direct access to the world's most scrutinized AI engineering nodes.</p>
            </div>
            <div className="w-full md:w-96">
                <input 
                    type="text" 
                    placeholder="QUERY SKILLS, SPECS, OR IDENT..." 
                    className="w-full bg-[#E7E6E2] border-b-2 border-[#32312D]/10 py-4 px-2 text-[#32312D] outline-none focus:border-[#3A3F5F] transition-all font-black uppercase text-xs tracking-widest placeholder:text-slate-300"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>
        </div>
      </section>

      {/* Roster Grid */}
      <section className="py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-40 text-[#3A3F5F] font-black uppercase tracking-[0.5em] animate-pulse">Scanning Neural Network...</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filtered.map(eng => (
                <Link href={`/engineers/${eng.id}`} key={eng.id} className="group relative">
                  <div className="bg-white rounded-[40px] p-10 border border-[#32312D]/10 hover:border-[#3A3F5F] transition-all duration-700 h-full flex flex-col shadow-sm hover:shadow-2xl relative overflow-hidden text-left">
                    {eng.isFeatured && (
                        <div className="absolute top-0 right-0 bg-[#3A3F5F] text-white text-[8px] font-black px-6 py-2 uppercase tracking-[0.3em] rounded-bl-2xl">Elite Featured</div>
                    )}
                    
                    <div className="w-20 h-20 bg-[#E7E6E2] rounded-2xl mb-8 flex items-center justify-center text-3xl font-black text-[#3A3F5F] border border-[#32312D]/10">
                        👤
                    </div>

                    <h3 className="text-2xl font-black text-[#32312D] mb-1 group-hover:text-[#3A3F5F] transition-colors uppercase tracking-tight">Specialist {eng.id.slice(0, 5).toUpperCase()}</h3>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8">{eng.country} • {eng.yearsExperience}yr Exp</p>
                    
                    <div className="flex-1">
                        <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-4">Core Specializations</div>
                        <div className="flex flex-wrap gap-2 mb-10">
                            {eng.aiSpecializations.split(',').map((s, j) => (
                                <span key={j} className="text-[9px] font-black uppercase tracking-widest bg-[#E7E6E2] text-slate-500 px-3 py-1 rounded-lg border border-[#32312D]/10 group-hover:border-[#3A3F5F]/20 transition-all">
                                    {s.trim()}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="pt-8 border-t border-[#32312D]/10 flex justify-between items-center">
                        {eng.hourlyRate > 0 ? (
                          <div>
                              <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Standard Rate</div>
                              <div className="text-xl font-black text-[#32312D]">${eng.hourlyRate}<span className="text-xs text-slate-400">/hr</span></div>
                          </div>
                        ) : (
                          <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">Rate: Restricted</div>
                        )}
                        <div className="text-[#3A3F5F] font-black text-[10px] uppercase tracking-widest group-hover:underline underline-offset-8">Audit Profile →</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-40 px-6 md:px-12 bg-white border-t border-[#32312D]/10">
        <div className="max-w-5xl mx-auto bg-[#E7E6E2] rounded-[60px] p-20 text-center border border-[#32312D]/10 relative overflow-hidden shadow-xl">
            <h2 className="text-4xl font-black mb-10 tracking-tighter uppercase text-[#32312D]">Seeking specific architecture?</h2>
            <p className="text-slate-400 uppercase tracking-widest text-sm mb-12 max-w-lg mx-auto leading-loose">Our concierge team can hand-source specific engineering nodes for unique planetary-scale requirements.</p>
            <Link href="/signup" className="inline-block bg-[#3A3F5F] text-white px-12 py-6 rounded-full font-black uppercase text-xs tracking-[0.3em] hover:bg-[#3A3F5F]/90 transition-all shadow-lg shadow-[#3A3F5F]/20">Establish Presence</Link>
        </div>
      </section>
    </div>
  );
};

export default EngineersPage;
