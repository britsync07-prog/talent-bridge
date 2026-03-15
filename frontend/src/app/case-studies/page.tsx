'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

const CaseStudiesPage = () => {
  const cases = [
    { title: 'Neural Scale', sector: 'Fintech', desc: 'Preventing $40M in fraud using custom-built transformer models.', icon: '🏛️' },
    { title: 'Genomic AI', sector: 'Health', desc: 'Accelerating drug discovery by 300% via deep reinforcement learning.', icon: '🧬' },
    { title: 'Auto-Logistics', sector: 'Supply Chain', desc: 'A global routing engine optimizing 14,000 daily transits.', icon: '🚢' },
  ];

  return (
    <div className="min-h-screen bg-[#E7E6E2] text-[#32312D] font-sans selection:bg-[#3A3F5F] selection:text-white">
      <Navbar />
      
      {/* 1. IMPACT HERO */}
      <section className="py-40 px-6 md:px-12 max-w-7xl mx-auto text-center text-left">
        <h1 className="text-7xl md:text-8xl font-black mb-12 tracking-tighter uppercase text-[#32312D]">The <br/><span className="text-[#3A3F5F]">Anthology.</span></h1>
        <p className="text-xl text-[#32312D]/60 max-w-2xl mx-auto mb-20 leading-relaxed uppercase tracking-widest font-medium text-center">Documenting the triumphs of scrutinized intelligence.</p>
      </section>

      {/* 2. SUCCESS ANTHOLOGY GRID */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-1 gap-12 max-w-5xl mx-auto text-left">
          {cases.map((c, i) => (
            <div key={i} className="bg-white p-16 rounded-[60px] border border-[#32312D]/10 flex flex-col md:flex-row items-center gap-16 hover:border-[#3A3F5F]/30 transition-all duration-700 group shadow-sm hover:shadow-xl">
              <div className="w-40 h-40 bg-[#E7E6E2]/50 rounded-[40px] flex items-center justify-center text-7xl border border-[#32312D]/5 group-hover:scale-110 transition-transform shadow-sm grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100">{c.icon}</div>
              <div className="flex-1 text-left">
                <span className="text-[#3A3F5F] font-black uppercase text-[9px] tracking-[0.4em] mb-4 block">{c.sector} CASE_STUDY_v4.0</span>
                <h3 className="text-4xl font-black text-[#32312D] mb-6 uppercase tracking-tighter">{c.title}</h3>
                <p className="text-[#32312D]/60 text-sm leading-loose uppercase tracking-widest mb-10">{c.desc}</p>
                <Link href="/contact" className="text-[#32312D] font-black uppercase text-[10px] tracking-[0.3em] border-b border-[#32312D]/20 pb-2 hover:text-[#3A3F5F] hover:border-[#3A3F5F] transition-all">Request Full Documentation →</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. SECTOR ANALYSIS */}
      <section className="py-40 bg-white border-y border-[#32312D]/10">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-24 items-center text-left">
              <div className="text-left">
                  <h2 className="text-4xl font-black text-[#32312D] mb-8 tracking-tighter uppercase">Vertical <br/>Mastery.</h2>
                  <p className="text-[#32312D]/60 text-xs font-black uppercase tracking-widest leading-loose">We do not develop generic solutions. Our case studies represent deep-sector expertise in high-stakes environments where performance is the only metric.</p>
              </div>
              <div className="grid grid-cols-2 gap-8 text-left">
                  {['FINANCE', 'BIOTECH', 'ROBOTICS', 'DEFENSE'].map((s, i) => (
                      <div key={i} className="p-8 bg-[#E7E6E2]/30 border border-[#32312D]/5 rounded-3xl text-center text-[#32312D]/40 font-black uppercase tracking-widest text-[10px]">{s}</div>
                  ))}
              </div>
          </div>
      </section>

      {/* 4. METRICS */}
      <section className="py-40 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12">
              {[
                  { label: 'Avg ROI Delta', value: '4.8x', desc: 'within first 12 months' },
                  { label: 'Deployment Cycle', value: '14 Days', desc: 'avg time to production' },
                  { label: 'Node Reliability', value: '99.99%', desc: 'system uptime average' }
              ].map((m, i) => (
                  <div key={i} className="p-12 bg-white border-t-4 border-[#3A3F5F] rounded-b-[40px] text-center shadow-sm">
                      <div className="text-5xl font-black text-[#32312D] mb-4 tracking-tighter uppercase">{m.value}</div>
                      <div className="text-[10px] font-black text-[#3A3F5F] uppercase tracking-[0.3em] mb-2">{m.label}</div>
                      <div className="text-[#32312D]/40 text-[9px] font-black uppercase tracking-widest">{m.desc}</div>
                  </div>
              ))}
          </div>
      </section>

      {/* 5. CTA */}
      <section className="py-40 px-6 md:px-12">
        <div className="max-w-5xl mx-auto bg-white rounded-[60px] p-24 text-center shadow-xl border border-[#32312D]/10 relative overflow-hidden">
            <h2 className="text-5xl font-black text-[#32312D] mb-10 tracking-tighter uppercase text-center">Build Your Own <br/>Success Story.</h2>
            <Link href="/contact" className="relative inline-block bg-[#32312D] text-white px-16 py-5 rounded-full font-black uppercase text-xs tracking-[0.3em] hover:bg-[#3A3F5F] transition-all shadow-md">Initiate Protocol</Link>
        </div>
      </section>
    </div>
  );
};

export default CaseStudiesPage;
