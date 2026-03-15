'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-[#E7E6E2] text-[#32312D] font-sans selection:bg-[#3A3F5F] selection:text-white">
      <Navbar />
      
      {/* 1. MANIFESTO HERO */}
      <section className="py-40 px-6 md:px-12 max-w-7xl mx-auto text-center">
        <span className="text-[#3A3F5F] font-black uppercase text-[10px] tracking-[0.5em] block mb-8">The Manifesto</span>
        <h1 className="text-7xl md:text-8xl font-black mb-12 tracking-tighter max-w-4xl mx-auto uppercase text-[#32312D]">The Vanguard of <br/><span className="text-[#3A3F5F]">Global Intelligence.</span></h1>
        <p className="text-xl text-[#32312D]/60 max-w-2xl mx-auto mb-20 leading-relaxed uppercase tracking-widest font-medium">Talent Bridge is not a marketplace. We are a secure infrastructure for world-class talent and the organizations that deserve them.</p>
      </section>

      {/* 2. THE PRINCIPLES */}
      <section className="py-40 px-6 md:px-12 bg-white border-y border-[#32312D]/10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-20">
            {[
                { title: 'Absolute Quality', desc: 'We reject 99% of nodes. Compromise is not in our functional specification.', icon: '💎' },
                { title: 'Neural focus', desc: 'We only build AI. We do not dilute our processing power with other domains.', icon: '🎯' },
                { title: 'Global Ethics', desc: 'All AI development follows strict alignment protocols and safety standards.', icon: '⚖️' },
            ].map((p, i) => (
                <div key={i} className="text-center group">
                    <div className="text-5xl mb-8 group-hover:scale-110 transition-transform block grayscale opacity-50 group-hover:opacity-100">{p.icon}</div>
                    <h3 className="text-xl font-black text-[#32312D] mb-6 uppercase tracking-widest group-hover:text-[#3A3F5F] transition-colors">{p.title}</h3>
                    <p className="text-[#32312D]/60 text-[10px] font-black uppercase tracking-[0.2em] leading-loose">{p.desc}</p>
                </div>
            ))}
        </div>
      </section>

      {/* 3. EXECUTIVE LEADERSHIP */}
      <section className="py-40 px-6 md:px-12 max-w-7xl mx-auto">
          <h2 className="text-4xl font-black text-[#32312D] mb-24 tracking-tighter uppercase text-center">Executive Council.</h2>
          <div className="grid md:grid-cols-3 gap-12">
              {[
                  { name: 'Dr. Aris Thorne', role: 'Head of Neural Vetting', origin: 'CERN / Stanford' },
                  { name: 'Marcus Sterling', role: 'Managing Partner', origin: 'Goldman / YC' },
                  { name: 'Elena Vossen', role: 'Chief of Ethics', origin: 'DeepMind / Oxford' },
              ].map((member, i) => (
                  <div key={i} className="bg-white p-12 rounded-[50px] border border-[#32312D]/10 text-center shadow-sm hover:border-[#3A3F5F]/30 transition-all group">
                      <div className="w-20 h-20 bg-[#E7E6E2] rounded-2xl mx-auto mb-8 flex items-center justify-center text-3xl grayscale group-hover:grayscale-0 transition-all opacity-50 group-hover:opacity-100">👤</div>
                      <div className="text-[#32312D] font-black uppercase tracking-widest text-lg mb-2">{member.name}</div>
                      <div className="text-[#3A3F5F] text-[10px] font-black uppercase tracking-[0.2em] mb-4">{member.role}</div>
                      <div className="text-[#32312D]/40 text-[9px] font-black uppercase tracking-widest italic">{member.origin}</div>
                  </div>
              ))}
          </div>
      </section>

      {/* 4. STATS */}
      <section className="py-40 bg-[#3A3F5F]/5 border-y border-[#32312D]/10">
          <div className="max-w-7xl mx-auto px-6 text-center flex flex-wrap justify-center gap-32">
              <div>
                  <div className="text-5xl font-black text-[#32312D] mb-4 tracking-tighter uppercase">14</div>
                  <div className="text-[10px] font-black text-[#32312D]/40 uppercase tracking-widest">PHDs on Council</div>
              </div>
              <div>
                  <div className="text-5xl font-black text-[#3A3F5F] mb-4 tracking-tighter uppercase">Top 1%</div>
                  <div className="text-[10px] font-black text-[#32312D]/40 uppercase tracking-widest">Vetting Standard</div>
              </div>
              <div>
                  <div className="text-5xl font-black text-[#32312D] mb-4 tracking-tighter uppercase">800M</div>
                  <div className="text-[10px] font-black text-[#32312D]/40 uppercase tracking-widest">Compute Cycle Index</div>
              </div>
          </div>
      </section>

      {/* 5. MILESTONES */}
      <section className="py-40 px-6 md:px-12 max-w-5xl mx-auto">
          <h2 className="text-center text-3xl font-black text-[#32312D] mb-24 uppercase tracking-[0.3em]">Milestones</h2>
          <div className="space-y-20 text-left">
              <div className="flex gap-12 items-start">
                  <div className="text-[#3A3F5F] font-black text-xl tracking-tighter">2024</div>
                  <div className="pt-1">
                      <div className="text-[#32312D] font-black uppercase tracking-widest text-sm mb-2">Foundation</div>
                      <p className="text-[#32312D]/60 text-[10px] font-black uppercase tracking-widest leading-loose">TALENT BRIDGE established in San Francisco to solve the AI talent transparency crisis.</p>
                  </div>
              </div>
              <div className="flex gap-12 items-start border-l-2 border-[#3A3F5F]/20 pl-12 ml-6">
                  <div className="text-[#3A3F5F] font-black text-xl tracking-tighter">2025</div>
                  <div className="pt-1">
                      <div className="text-[#32312D] font-black uppercase tracking-widest text-sm mb-2">Global Expansion</div>
                      <p className="text-[#32312D]/60 text-[10px] font-black uppercase tracking-widest leading-loose">Opening of London and Tokyo nodes to capture decentralized AI brilliance.</p>
                  </div>
              </div>
          </div>
      </section>

      {/* 6. OFFICES */}
      <section className="py-40 bg-white">
          <div className="max-w-7xl mx-auto px-6 text-center">
              <h2 className="text-2xl font-black text-[#32312D] mb-20 uppercase tracking-[0.4em]">Operations Centers</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {['San Francisco', 'London', 'Tokyo', 'Singapore'].map((city, i) => (
                      <div key={i} className="text-[#32312D]/40 font-black uppercase tracking-widest text-[10px]">{city} • Global Hub</div>
                  ))}
              </div>
          </div>
      </section>

      {/* 7. CTA */}
      <section className="py-40 px-6 md:px-12 bg-[#E7E6E2]">
        <div className="max-w-6xl mx-auto bg-white rounded-[80px] p-24 text-center border border-[#32312D]/10 shadow-xl relative overflow-hidden">
            <h2 className="text-6xl font-black text-[#32312D] mb-12 tracking-tighter uppercase">Our Legacy is Your <br/>Future.</h2>
            <Link href="/signup" className="inline-block bg-[#3A3F5F] text-white px-20 py-6 rounded-full font-black uppercase text-xs tracking-[0.3em] hover:bg-[#32312D] transition-all shadow-lg shadow-[#3A3F5F]/20">Establish Alliance</Link>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
