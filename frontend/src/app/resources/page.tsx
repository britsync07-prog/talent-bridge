'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

const ResourcesPage = () => {
  const resources = [
    { title: 'The 2026 AI Report', type: 'Intelligence', date: 'March 2026' },
    { title: 'Neural Security Protocol', type: 'Documentation', date: 'Feb 2026' },
    { title: 'Scaling Transformers', type: 'Technical Paper', date: 'Jan 2026' },
    { title: 'Marketplace Liquidity', type: 'Economic Study', date: 'Dec 2025' },
  ];

  return (
    <div className="min-h-screen bg-[#E7E6E2] text-[#32312D] font-sans selection:bg-[#3A3F5F] selection:text-white">
      <Navbar />
      
      {/* 1. HERO */}
      <section className="py-40 px-6 md:px-12 max-w-7xl mx-auto text-center">
        <h1 className="text-7xl md:text-8xl font-black mb-12 tracking-tighter uppercase text-[#32312D]">Library of <br/><span className="text-[#3A3F5F]">Intelligence.</span></h1>
        <p className="text-xl text-[#32312D]/60 max-w-2xl mx-auto mb-20 leading-relaxed uppercase tracking-widest font-medium text-center">Primary research and operational frameworks for technical leaders.</p>
      </section>

      {/* 2. RESOURCES LIST */}
      <section className="py-24 px-6 md:px-12 max-w-5xl mx-auto">
        <div className="space-y-6">
          {resources.map((r, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl border border-[#32312D]/10 hover:border-[#3A3F5F]/30 transition-all flex flex-col md:flex-row justify-between items-center group shadow-sm">
              <div className="text-left w-full md:w-auto mb-6 md:mb-0">
                <div className="text-[8px] font-black text-[#3A3F5F] uppercase tracking-[0.4em] mb-2">{r.type}</div>
                <h3 className="text-2xl font-black text-[#32312D] uppercase tracking-tight">{r.title}</h3>
              </div>
              <div className="flex items-center gap-12 w-full md:w-auto justify-between">
                <span className="text-[10px] font-black text-[#32312D]/40 uppercase tracking-widest">{r.date}</span>
                <button className="text-[#3A3F5F] font-black uppercase text-[10px] tracking-[0.3em] border-b-2 border-[#3A3F5F] pb-1 hover:text-[#32312D] hover:border-[#32312D] transition-all">Download PDF</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. NEWSLETTER */}
      <section className="py-40 px-6 md:px-12 bg-white border-t border-[#32312D]/10">
          <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-black text-[#32312D] mb-8 uppercase tracking-[0.3em]">The Private Circular</h2>
              <p className="text-[#32312D]/60 text-sm leading-relaxed uppercase tracking-widest mb-16">Bi-weekly transmissions on the state of the AI roster and emerging technical protocols.</p>
              <form className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
                  <input type="email" placeholder="SECURE_EMAIL@HUB.NETWORK" className="flex-1 bg-[#E7E6E2]/30 border-b-2 border-[#32312D]/10 py-4 px-6 text-[#32312D] outline-none focus:border-[#3A3F5F] font-black uppercase text-xs tracking-widest" />
                  <button className="bg-[#3A3F5F] text-white px-12 py-4 rounded-xl font-black uppercase text-xs tracking-[0.3em] hover:bg-[#32312D] transition-all shadow-md">Subscribe</button>
              </form>
          </div>
      </section>
    </div>
  );
};

export default ResourcesPage;
